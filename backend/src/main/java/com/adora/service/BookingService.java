package com.adora.service;

import com.adora.dto.*;
import com.adora.entity.*;
import com.adora.exception.BadRequestException;
import com.adora.exception.ResourceNotFoundException;
import com.adora.repository.BillboardAvailabilityRepository;
import com.adora.repository.BillboardRepository;
import com.adora.repository.BookingRepository;
import com.adora.repository.UserRepository;
import com.adora.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
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
    private final NotificationService notificationService;

    public BookingService(BookingRepository bookingRepository,
                          BillboardRepository billboardRepository,
                          UserRepository userRepository,
                          BillboardAvailabilityRepository availabilityRepository,
                          BillboardService billboardService,
                          NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.billboardRepository = billboardRepository;
        this.userRepository = userRepository;
        this.availabilityRepository = availabilityRepository;
        this.billboardService = billboardService;
        this.notificationService = notificationService;
    }

    public BookingDto createBooking(CreateBookingRequest request, Long renterId) {
        User renter = userRepository.findById(renterId)
                .orElseThrow(() -> new ResourceNotFoundException("Renter not found with id: " + renterId));

        Billboard billboard = billboardRepository.findById(request.getBillboardId())
                .orElseThrow(() -> new ResourceNotFoundException("Billboard not found with id: " + request.getBillboardId()));

        if (billboard.getStatus() != BillboardStatus.APPROVED) {
            throw new BadRequestException("You can only book approved billboards");
        }

        LocalDateTime start = request.getStartDate();
        LocalDateTime end = request.getEndDate();

        if (start.isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Thời gian bắt đầu không được ở quá khứ");
        }

        if (start.isAfter(end) || start.isEqual(end)) {
            throw new BadRequestException("Thời gian bắt đầu phải trước thời gian kết thúc");
        }

        // Tránh giờ lẻ: phút và giây phải bằng 00
        if (start.getMinute() != 0 || start.getSecond() != 0 ||
            end.getMinute() != 0 || end.getSecond() != 0) {
            throw new BadRequestException("Thời gian đặt chỗ phải chọn theo giờ chẵn (phút và giây bằng 0)");
        }

        // Check if date is blocked by owner in BillboardAvailability
        List<BillboardAvailability> availabilities = availabilityRepository
                .findByBillboardIdAndAvailableDateBetween(billboard.getId(), start.toLocalDate(), end.toLocalDate());
        for (BillboardAvailability avail : availabilities) {
            if (avail.getStatus() == AvailabilityStatus.BLOCKED) {
                throw new BadRequestException("Bảng quảng cáo đã bị khóa vào ngày " + avail.getAvailableDate());
            }
        }

        // Check overlapping bookings
        long overlaps = bookingRepository.countOverlappingBookings(billboard.getId(), start, end);
        if (overlaps > 0) {
            throw new BadRequestException("Khung giờ bạn chọn đã bị trùng lịch đặt chỗ khác.");
        }

        long hoursCount = ChronoUnit.HOURS.between(start, end);
        BigDecimal dailyPrice = billboard.getPricePerDay();
        // Keep 10 decimals precision during division to avoid premature rounding errors
        BigDecimal hourlyPrice = dailyPrice.divide(BigDecimal.valueOf(24), 10, RoundingMode.HALF_UP);
        BigDecimal totalPriceRaw = hourlyPrice.multiply(BigDecimal.valueOf(hoursCount));
        
        // Round subtotal to nearest 1,000 VND
        BigDecimal totalPrice = totalPriceRaw.divide(BigDecimal.valueOf(1000), 0, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(1000));
        
        BigDecimal surchargeRaw = billboard.getLocationSurcharge() != null ? 
                billboard.getLocationSurcharge() : BigDecimal.ZERO;
        BigDecimal surcharge = surchargeRaw.divide(BigDecimal.valueOf(1000), 0, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(1000));
        
        BigDecimal beforeFee = totalPrice.add(surcharge);
        
        // 5% Platform Commission, rounded to nearest 1,000 VND
        BigDecimal serviceFee = beforeFee.multiply(BigDecimal.valueOf(0.05))
                .divide(BigDecimal.valueOf(1000), 0, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(1000));

        // Calculate Premium Surcharge (only for 15x20 package)
        String packageChoice = request.getSpotPackage() != null ? request.getSpotPackage() : "30x15";
        BigDecimal premiumSurcharge = BigDecimal.ZERO;
        if ("15x20".equalsIgnoreCase(packageChoice)) {
            BigDecimal premiumSurchargePerDayRaw = billboard.getPremiumSurcharge() != null ? 
                    billboard.getPremiumSurcharge() : BigDecimal.ZERO;
            BigDecimal premiumSurchargeHourly = premiumSurchargePerDayRaw.divide(BigDecimal.valueOf(24), 10, RoundingMode.HALF_UP);
            BigDecimal premiumSurchargeRaw = premiumSurchargeHourly.multiply(BigDecimal.valueOf(hoursCount));
            premiumSurcharge = premiumSurchargeRaw.divide(BigDecimal.valueOf(1000), 0, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(1000));
        }
        
        BigDecimal finalAmount = beforeFee.add(serviceFee).add(premiumSurcharge);

        Booking booking = Booking.builder()
                .renter(renter)
                .billboard(billboard)
                .startDate(start)
                .endDate(end)
                .totalPrice(totalPrice)
                .serviceFee(serviceFee)
                .locationSurcharge(surcharge)
                .spotPackage(packageChoice)
                .premiumSurcharge(premiumSurcharge)
                .finalAmount(finalAmount)
                .status(BookingStatus.PENDING)
                .note(request.getNote())
                .build();

        Booking saved = bookingRepository.save(booking);

        // Notify owner of new booking request
        notificationService.createNotification(
                saved.getBillboard().getOwner(),
                "Yêu cầu thuê bảng mới",
                "Bạn nhận được yêu cầu thuê màn hình LED #" + saved.getId() + " (" + saved.getBillboard().getTitle() + ") từ " + saved.getRenter().getFullName(),
                NotificationType.BOOKING_CREATED,
                saved,
                null
        );

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

        Booking saved = bookingRepository.save(booking);

        // Notify owner of cancellation
        notificationService.createNotification(
                saved.getBillboard().getOwner(),
                "Yêu cầu đặt bảng bị hủy",
                "Yêu cầu thuê màn hình LED #" + saved.getId() + " (" + saved.getBillboard().getTitle() + ") đã bị hủy bởi " + saved.getRenter().getFullName(),
                NotificationType.BOOKING_CANCELLED,
                saved,
                null
        );

        return mapToDto(saved);
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
        Booking saved = bookingRepository.save(booking);

        // Send BOOKING_ACCEPTED notification to renter
        notificationService.createNotification(
                saved.getRenter(),
                "Yêu cầu đặt bảng được chấp nhận",
                "Yêu cầu đặt màn hình LED #" + saved.getId() + " (" + saved.getBillboard().getTitle() + ") đã được chấp nhận. Vui lòng thanh toán đơn hàng.",
                NotificationType.BOOKING_ACCEPTED,
                saved,
                null
        );

        return mapToDto(saved);
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
        Booking saved = bookingRepository.save(booking);

        // Send BOOKING_REJECTED notification to renter
        notificationService.createNotification(
                saved.getRenter(),
                "Yêu cầu đặt bảng bị từ chối",
                "Yêu cầu đặt màn hình LED #" + saved.getId() + " (" + saved.getBillboard().getTitle() + ") đã bị từ chối bởi chủ sở hữu.",
                NotificationType.BOOKING_REJECTED,
                saved,
                null
        );

        return mapToDto(saved);
    }

    private void releaseAvailabilityDates(Booking booking) {
        // Bookings are tracked dynamically, no physical availability change needed
    }

    public List<BookedSlotDto> getBookedSlots(Long billboardId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);

        List<Booking> bookings = bookingRepository.findActiveBookingsForBillboardOnDate(
                billboardId, startOfDay, endOfDay
        );

        List<BookedSlotDto> slots = new ArrayList<>();
        for (Booking b : bookings) {
            LocalDateTime start = b.getStartDate();
            LocalDateTime end = b.getEndDate();

            LocalDateTime clampStart = start.isBefore(startOfDay) ? startOfDay : start;
            LocalDateTime clampEnd = end.isAfter(endOfDay) ? endOfDay : end;

            int startHour = clampStart.getHour();
            int endHour = clampEnd.getHour();
            if (clampEnd.toLocalDate().isAfter(date)) {
                endHour = 24;
            } else if (clampEnd.getMinute() > 0 || clampEnd.getSecond() > 0) {
                endHour = clampEnd.getHour() + 1;
            }

            slots.add(new BookedSlotDto(startHour, endHour));
        }
        return slots;
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
                .billboard(billboardService.mapToLightDto(entity.getBillboard()))
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .totalPrice(entity.getTotalPrice())
                .serviceFee(entity.getServiceFee())
                .locationSurcharge(entity.getLocationSurcharge())
                .finalAmount(entity.getFinalAmount())
                .status(entity.getStatus())
                .note(entity.getNote())
                .spotPackage(entity.getSpotPackage())
                .premiumSurcharge(entity.getPremiumSurcharge())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
