package com.adora.service;

import com.adora.dto.NotificationDto;
import com.adora.entity.*;
import com.adora.exception.BadRequestException;
import com.adora.exception.ResourceNotFoundException;
import com.adora.repository.NotificationRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository,
                               EmailService emailService,
                               @Lazy SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.emailService = emailService;
        this.messagingTemplate = messagingTemplate;
    }

    public NotificationDto createNotification(User user, String title, String message, NotificationType type, Booking booking, Payment payment) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .booking(booking)
                .payment(payment)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        Notification saved = notificationRepository.save(notification);
        NotificationDto dto = mapToDto(saved);

        // 1. Push real-time notification to the user via WebSocket
        try {
            messagingTemplate.convertAndSendToUser(
                    user.getEmail(),
                    "/queue/notifications",
                    dto
            );
        } catch (Exception e) {
            // Silently capture websocket exceptions to avoid breaking core process flows
        }

        // 2. Trigger asynchronous HTML email sending
        try {
            String email = user.getEmail();
            String name = user.getFullName();
            String amountStr = booking != null ? booking.getFinalAmount().stripTrailingZeros().toPlainString() : "0";
            String billboardTitle = booking != null && booking.getBillboard() != null ? booking.getBillboard().getTitle() : "Màn hình LED";

            switch (type) {
                case PAYMENT_SUCCESS:
                    if (booking != null && payment != null) {
                        emailService.sendPaymentSuccessEmail(email, name, booking.getId(), amountStr, billboardTitle, payment.getTransactionCode());
                    }
                    break;
                case PAYMENT_FAILED:
                    if (booking != null) {
                        emailService.sendPaymentFailedEmail(email, name, booking.getId(), amountStr, billboardTitle);
                    }
                    break;
                case BOOKING_PAID:
                    // Under BOOKING_PAID, 'user' is the Billboard Owner, and renter is who paid
                    if (booking != null) {
                        String renterName = booking.getRenter() != null ? booking.getRenter().getFullName() : "Khách hàng";
                        emailService.sendBookingPaidEmail(email, name, renterName, booking.getId(), amountStr, billboardTitle);
                    }
                    break;
                case BOOKING_ACCEPTED:
                    if (booking != null) {
                        emailService.sendBookingAcceptedEmail(email, name, booking.getId(), billboardTitle);
                    }
                    break;
                case BOOKING_REJECTED:
                    if (booking != null) {
                        emailService.sendBookingRejectedEmail(email, name, booking.getId(), billboardTitle);
                    }
                    break;
                case BOOKING_CREATED:
                    if (booking != null) {
                        String renterName = booking.getRenter() != null ? booking.getRenter().getFullName() : "Khách hàng";
                        emailService.sendBookingCreatedEmail(email, name, renterName, booking.getId(), billboardTitle);
                    }
                    break;
                case BOOKING_CANCELLED:
                    if (booking != null) {
                        String renterName = booking.getRenter() != null ? booking.getRenter().getFullName() : "Khách hàng";
                        emailService.sendBookingCancelledEmail(email, name, renterName, booking.getId(), billboardTitle);
                    }
                    break;
            }
        } catch (Exception e) {
            // Capture email exceptions so core transitions are never blocked
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public NotificationDto markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not have permission to modify this notification");
        }

        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);
        return mapToDto(saved);
    }

    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }

    public NotificationDto mapToDto(Notification entity) {
        if (entity == null) return null;
        return NotificationDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .type(entity.getType())
                .bookingId(entity.getBooking() != null ? entity.getBooking().getId() : null)
                .paymentId(entity.getPayment() != null ? entity.getPayment().getId() : null)
                .isRead(entity.isRead())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
