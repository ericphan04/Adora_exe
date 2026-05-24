package com.adora.service;

import com.adora.dto.*;
import com.adora.entity.*;
import com.adora.exception.BadRequestException;
import com.adora.exception.ResourceNotFoundException;
import com.adora.repository.BillboardAvailabilityRepository;
import com.adora.repository.BillboardRepository;
import com.adora.repository.BookingRepository;
import com.adora.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BillboardRepository billboardRepository;
    private final UserRepository userRepository;
    private final BillboardAvailabilityRepository availabilityRepository;
    private final BillboardService billboardService;

    public BookingService(BookingRepository bookingRepository,
                          BillboardRepository billboardRepository,
                          UserRepository userRepository,
                          BillboardAvailabilityRepository availabilityRepository,
                          BillboardService billboardService) {
        this.bookingRepository = bookingRepository;
        this.billboardRepository = billboardRepository;
        this.userRepository = userRepository;
        this.availabilityRepository = availabilityRepository;
        this.billboardService = billboardService;
    }

    public BookingDto createBooking(CreateBookingRequest request, Long renterId) {
        User renter = userRepository.findById(renterId)
                .orElseThrow(() -> new ResourceNotFoundException("Renter not found with id: " + renterId));

        Billboard billboard = billboardRepository.findById(request.getBillboardId())
                .orElseThrow(() -> new ResourceNotFoundException("Billboard not found with id: " + request.getBillboardId()));

        if (billboard.getStatus() != BillboardStatus.APPROVED) {
            throw new BadRequestException("You can only book approved billboards");
        }

        LocalDate start = request.getStartDate();
        LocalDate end = request.getEndDate();

        if (start.isBefore(LocalDate.now())) {
            throw new BadRequestException("Start date cannot be in the past");
        }

        if (start.isAfter(end)) {
            throw new BadRequestException("Start date must be before or equal to end date");
        }

        // Check availability
        List<BillboardAvailability> availabilities = availabilityRepository
                .findByBillboardIdAndAvailableDateBetween(billboard.getId(), start, end);

        for (BillboardAvailability avail : availabilities) {
            if (avail.getStatus() == AvailabilityStatus.BOOKED || avail.getStatus() == AvailabilityStatus.BLOCKED) {
                throw new BadRequestException("Billboard is not available on " + avail.getAvailableDate());
            }
        }

        long daysCount = ChronoUnit.DAYS.between(start, end) + 1;
        BigDecimal dailyPrice = billboard.getPricePerDay();
        BigDecimal totalPrice = dailyPrice.multiply(BigDecimal.valueOf(daysCount));
        
        BigDecimal surcharge = billboard.getLocationSurcharge() != null ? 
                billboard.getLocationSurcharge() : BigDecimal.ZERO;
        
        BigDecimal finalAmount = totalPrice.add(surcharge);
        
        // 5% Platform Commission
        BigDecimal serviceFee = finalAmount.multiply(BigDecimal.valueOf(0.05))
                .setScale(2, RoundingMode.HALF_UP);

        Booking booking = Booking.builder()
                .renter(renter)
                .billboard(billboard)
                .startDate(start)
                .endDate(end)
                .totalPrice(totalPrice)
                .serviceFee(serviceFee)
                .locationSurcharge(surcharge)
                .finalAmount(finalAmount)
                .status(BookingStatus.PENDING)
                .note(request.getNote())
                .build();

        Booking saved = bookingRepository.save(booking);

        // Mark the availability as BOOKED (temporarily or pending approval)
        // For simplicity, we mark dates as BOOKED in availability calendar upon booking creation.
        // If rejected/cancelled, we will mark them back to AVAILABLE.
        LocalDate current = start;
        while (!current.isAfter(end)) {
            final LocalDate currentDate = current;
            BillboardAvailability avail = availabilities.stream()
                    .filter(a -> a.getAvailableDate().equals(currentDate))
                    .findFirst()
                    .orElse(null);

            if (avail == null) {
                avail = BillboardAvailability.builder()
                        .billboard(billboard)
                        .availableDate(currentDate)
                        .status(AvailabilityStatus.BOOKED)
                        .build();
            } else {
                avail.setStatus(AvailabilityStatus.BOOKED);
            }
            availabilityRepository.save(avail);
            current = current.plusDays(1);
        }

        return mapToDto(saved);
    }

    public List<BookingDto> getRenterBookings(Long renterId) {
        return bookingRepository.findByRenterId(renterId).stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    public List<BookingDto> getOwnerBookings(Long ownerId) {
        return bookingRepository.findByBillboardOwnerId(ownerId).stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    public List<BookingDto> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    public BookingDto getBookingById(Long id, Long userId, Role role) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (role == Role.RENTER && !booking.getRenter().getId().equals(userId)) {
            throw new BadRequestException("Access denied to this booking details");
        }

        if (role == Role.OWNER && !booking.getBillboard().getOwner().getId().equals(userId)) {
            throw new BadRequestException("Access denied to this booking details");
        }

        return mapToDto(booking);
    }

    public BookingDto cancelBooking(Long id, Long renterId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (!booking.getRenter().getId().equals(renterId)) {
            throw new BadRequestException("You can only cancel your own bookings");
        }

        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.ACCEPTED) {
            throw new BadRequestException("Cannot cancel booking at current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        releaseAvailabilityDates(booking);

        return mapToDto(bookingRepository.save(booking));
    }

    public BookingDto acceptBooking(Long id, Long ownerId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (!booking.getBillboard().getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You can only accept bookings for your own billboards");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Booking is not in PENDING state");
        }

        booking.setStatus(BookingStatus.ACCEPTED);
        return mapToDto(bookingRepository.save(booking));
    }

    public BookingDto rejectBooking(Long id, Long ownerId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (!booking.getBillboard().getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You can only reject bookings for your own billboards");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Booking is not in PENDING state");
        }

        booking.setStatus(BookingStatus.REJECTED);
        releaseAvailabilityDates(booking);

        return mapToDto(bookingRepository.save(booking));
    }

    private void releaseAvailabilityDates(Booking booking) {
        List<BillboardAvailability> availabilities = availabilityRepository
                .findByBillboardIdAndAvailableDateBetween(
                        booking.getBillboard().getId(), booking.getStartDate(), booking.getEndDate()
                );
        for (BillboardAvailability avail : availabilities) {
            avail.setStatus(AvailabilityStatus.AVAILABLE);
            availabilityRepository.save(avail);
        }
    }

    public BookingDto mapToDto(Booking entity) {
        if (entity == null) return null;
        return BookingDto.builder()
                .id(entity.getId())
                .renter(entity.getRenter() != null ? 
                        UserDto.builder()
                                .id(entity.getRenter().getId())
                                .fullName(entity.getRenter().getFullName())
                                .email(entity.getRenter().getEmail())
                                .phone(entity.getRenter().getPhone())
                                .role(entity.getRenter().getRole())
                                .status(entity.getRenter().getStatus())
                                .avatarUrl(entity.getRenter().getAvatarUrl())
                                .companyName(entity.getRenter().getCompanyName())
                                .build() : null)
                .billboard(billboardService.mapToDto(entity.getBillboard()))
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .totalPrice(entity.getTotalPrice())
                .serviceFee(entity.getServiceFee())
                .locationSurcharge(entity.getLocationSurcharge())
                .finalAmount(entity.getFinalAmount())
                .status(entity.getStatus())
                .note(entity.getNote())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
