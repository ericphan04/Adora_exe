package com.adora.service;

import com.adora.dto.CreateReviewRequest;
import com.adora.dto.ReviewDto;
import com.adora.dto.UserDto;
import com.adora.entity.Booking;
import com.adora.entity.BookingStatus;
import com.adora.entity.Review;
import com.adora.entity.User;
import com.adora.exception.BadRequestException;
import com.adora.exception.ResourceNotFoundException;
import com.adora.repository.BookingRepository;
import com.adora.repository.ReviewRepository;
import com.adora.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         BookingRepository bookingRepository,
                         UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    public ReviewDto createReview(CreateReviewRequest request, Long renterId) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + request.getBookingId()));

        if (!booking.getRenter().getId().equals(renterId)) {
            throw new BadRequestException("You can only review your own bookings");
        }

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new BadRequestException("Review can only be created after booking is COMPLETED. Current status: " + booking.getStatus());
        }

        User renter = booking.getRenter();

        Review review = Review.builder()
                .booking(booking)
                .renter(renter)
                .billboard(booking.getBillboard())
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review saved = reviewRepository.save(review);
        return mapToDto(saved);
    }

    public List<ReviewDto> getReviewsByBillboardId(Long billboardId) {
        return reviewRepository.findByBillboardId(billboardId).stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    private ReviewDto mapToDto(Review entity) {
        if (entity == null) return null;
        return ReviewDto.builder()
                .id(entity.getId())
                .bookingId(entity.getBooking().getId())
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
                .rating(entity.getRating())
                .comment(entity.getComment())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
