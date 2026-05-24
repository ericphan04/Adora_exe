package com.adora.service;

import com.adora.dto.NotificationDto;
import com.adora.entity.*;
import com.adora.exception.ResourceNotFoundException;
import com.adora.repository.NotificationRepository;
import com.adora.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;

    @Value("${app.email.enabled:false}")
    private boolean emailEnabled;

    @Value("${app.email.from:adoraledvn@gmail.com}")
    private String emailFrom;

    @Value("${vnp.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public NotificationService(NotificationRepository notificationRepository,
                                UserRepository userRepository,
                                JavaMailSender mailSender) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.mailSender = mailSender;
    }

    // ====================================================
    // PUBLIC: Called by PaymentService after callback
    // ====================================================

    /**
     * Send notifications to both renter and owner when payment succeeds.
     */
    public void sendPaymentSuccessNotifications(Payment payment) {
        Booking booking = payment.getBooking();
        User renter = booking.getRenter();
        User owner = booking.getBillboard().getOwner();
        String billboardTitle = booking.getBillboard().getTitle();
        java.text.NumberFormat numFormat = java.text.NumberFormat.getNumberInstance(new java.util.Locale("vi", "VN"));
        String amountStr = numFormat.format(payment.getAmount());
        String ownerRevenueStr = numFormat.format(payment.getOwnerRevenue());

        // --- Renter Notification ---
        String renterTitle = "✅ Thanh toán thành công";
        String renterMsg = String.format(
                "Thanh toán %s VNĐ cho bảng \"%s\" (Mã đặt #%d) đã được xác nhận.",
                amountStr, billboardTitle, booking.getId()
        );
        saveNotification(renter, NotificationType.PAYMENT_SUCCESS, renterTitle, renterMsg,
                booking.getId(), payment.getId());

        // --- Owner Notification ---
        String ownerTitle = "💰 Đã nhận thanh toán";
        String ownerMsg = String.format(
                "Khách hàng %s đã thanh toán thành công cho bảng \"%s\" (Mã đặt #%d). " +
                "Doanh thu của bạn: %s VNĐ.",
                renter.getFullName(), billboardTitle, booking.getId(),
                ownerRevenueStr
        );
        saveNotification(owner, NotificationType.BOOKING_PAID, ownerTitle, ownerMsg,
                booking.getId(), payment.getId());

        // --- Send Emails ---
        if (emailEnabled) {
            sendPaymentSuccessEmailToRenter(renter, payment, booking, billboardTitle);
            sendPaymentSuccessEmailToOwner(owner, renter, payment, booking, billboardTitle);
        } else {
            System.out.println("[EMAIL DISABLED] Would send payment success email to: " + renter.getEmail());
            System.out.println("[EMAIL DISABLED] Would send booking paid email to: " + owner.getEmail());
        }
    }

    /**
     * Send failure notification to renter when payment fails.
     */
    public void sendPaymentFailedNotification(Payment payment) {
        Booking booking = payment.getBooking();
        User renter = booking.getRenter();
        String billboardTitle = booking.getBillboard().getTitle();

        String title = "❌ Thanh toán thất bại";
        String msg = String.format(
                "Thanh toán cho bảng \"%s\" (Mã đặt #%d) đã thất bại hoặc bị hủy. " +
                "Vui lòng thử lại hoặc liên hệ hỗ trợ.",
                billboardTitle, booking.getId()
        );
        saveNotification(renter, NotificationType.PAYMENT_FAILED, title, msg,
                booking.getId(), payment.getId());

        if (emailEnabled) {
            sendPaymentFailedEmailToRenter(renter, payment, booking, billboardTitle);
        } else {
            System.out.println("[EMAIL DISABLED] Would send payment failed email to: " + renter.getEmail());
        }
    }

    // ====================================================
    // PUBLIC: REST API methods
    // ====================================================

    @Transactional(readOnly = true)
    public List<NotificationDto> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public void markAsRead(Long notificationId, Long userId) {
        notificationRepository.markAsReadByIdAndUserId(notificationId, userId);
    }

    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    // ====================================================
    // PRIVATE: Helpers
    // ====================================================

    private void saveNotification(User user, NotificationType type, String title,
                                   String message, Long bookingId, Long paymentId) {
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .bookingId(bookingId)
                .paymentId(paymentId)
                .read(false)
                .build();
        notificationRepository.save(notification);
    }

    private NotificationDto mapToDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .userId(n.getUser().getId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .bookingId(n.getBookingId())
                .paymentId(n.getPaymentId())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }

    // ====================================================
    // PRIVATE: Email Senders
    // ====================================================

    private void sendPaymentSuccessEmailToRenter(User renter, Payment payment, Booking booking, String billboardTitle) {
        try {
            String subject = "[ADORA] ✅ Xác nhận thanh toán thành công - Đơn #" + booking.getId();
            String html = buildPaymentSuccessEmailForRenter(renter, payment, booking, billboardTitle);
            sendHtmlEmail(renter.getEmail(), subject, html);
        } catch (Exception e) {
            System.err.println("Failed to send payment success email to renter: " + e.getMessage());
        }
    }

    private void sendPaymentSuccessEmailToOwner(User owner, User renter, Payment payment, Booking booking, String billboardTitle) {
        try {
            String subject = "[ADORA] 💰 Thông báo nhận thanh toán - Đơn #" + booking.getId();
            String html = buildPaymentSuccessEmailForOwner(owner, renter, payment, booking, billboardTitle);
            sendHtmlEmail(owner.getEmail(), subject, html);
        } catch (Exception e) {
            System.err.println("Failed to send payment success email to owner: " + e.getMessage());
        }
    }

    private void sendPaymentFailedEmailToRenter(User renter, Payment payment, Booking booking, String billboardTitle) {
        try {
            String subject = "[ADORA] ❌ Thanh toán thất bại - Đơn #" + booking.getId();
            String html = buildPaymentFailedEmail(renter, payment, booking, billboardTitle);
            sendHtmlEmail(renter.getEmail(), subject, html);
        } catch (Exception e) {
            System.err.println("Failed to send payment failed email to renter: " + e.getMessage());
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(emailFrom, "ADORA LED Billboard");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        mailSender.send(message);
        System.out.println("[EMAIL] Sent to " + to + " | Subject: " + subject);
    }

    // ====================================================
    // PRIVATE: HTML Email Templates
    // ====================================================

    private String buildPaymentSuccessEmailForRenter(User renter, Payment payment, Booking booking, String billboardTitle) {
        String bookingUrl = frontendBaseUrl + "/advertiser/bookings";
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style='font-family:Inter,Arial,sans-serif;background:#f0f9ff;margin:0;padding:20px'>" +
               "<div style='max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)'>" +
               "<div style='background:linear-gradient(135deg,#1D4ED8,#0891B2);padding:32px;text-align:center'>" +
               "<h1 style='color:white;margin:0;font-size:24px;font-weight:800'>ADORA</h1>" +
               "<p style='color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:13px'>LED Billboard Rental Marketplace</p></div>" +
               "<div style='padding:32px'>" +
               "<div style='text-align:center;margin-bottom:24px'>" +
               "<div style='width:64px;height:64px;background:#dcfce7;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px'>" +
               "<span style='font-size:32px'>✅</span></div>" +
               "<h2 style='color:#1D4ED8;margin:0 0 8px;font-size:20px'>Thanh Toán Thành Công!</h2>" +
               "<p style='color:#6B7A8D;margin:0;font-size:14px'>Xin chào " + renter.getFullName() + ", giao dịch của bạn đã được xác nhận.</p></div>" +
               "<div style='background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:24px'>" +
               "<h3 style='color:#1A2332;font-size:14px;margin:0 0 16px;font-weight:600'>Chi Tiết Đơn Đặt</h3>" +
               "<table style='width:100%;border-collapse:collapse;font-size:13px'>" +
               "<tr><td style='color:#6B7A8D;padding:6px 0'>Mã đơn</td><td style='color:#1A2332;font-weight:600;text-align:right'>#ADR-" + booking.getId() + "</td></tr>" +
               "<tr><td style='color:#6B7A8D;padding:6px 0'>Bảng quảng cáo</td><td style='color:#1A2332;font-weight:600;text-align:right'>" + billboardTitle + "</td></tr>" +
               "<tr><td style='color:#6B7A8D;padding:6px 0'>Thời gian</td><td style='color:#1A2332;font-weight:600;text-align:right'>" + booking.getStartDate() + " → " + booking.getEndDate() + "</td></tr>" +
               "<tr><td style='color:#6B7A8D;padding:6px 0'>Mã giao dịch</td><td style='color:#1A2332;font-weight:600;text-align:right;font-size:11px'>" + payment.getTransactionCode() + "</td></tr>" +
               "<tr style='border-top:2px solid #e3e8ef'><td style='color:#1D4ED8;padding:12px 0 6px;font-weight:700;font-size:15px'>Tổng thanh toán</td>" +
               "<td style='color:#1D4ED8;font-weight:800;font-size:18px;text-align:right;padding:12px 0 6px'>" + payment.getAmount().toPlainString() + " ₫</td></tr>" +
               "</table></div>" +
               "<div style='text-align:center;margin-bottom:24px'>" +
               "<a href='" + bookingUrl + "' style='display:inline-block;background:linear-gradient(135deg,#1D4ED8,#0891B2);color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:14px'>Xem Đơn Đặt Của Tôi →</a></div>" +
               "<p style='color:#6B7A8D;font-size:12px;text-align:center;margin:0'>Cảm ơn bạn đã sử dụng ADORA. Liên hệ support nếu cần hỗ trợ.</p></div>" +
               "<div style='background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e3e8ef'>" +
               "<p style='color:#9ca3af;font-size:11px;margin:0'>© 2026 ADORA LED Billboard Marketplace. All rights reserved.</p></div>" +
               "</div></body></html>";
    }

    private String buildPaymentSuccessEmailForOwner(User owner, User renter, Payment payment, Booking booking, String billboardTitle) {
        String dashboardUrl = frontendBaseUrl + "/owner/bookings";
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style='font-family:Inter,Arial,sans-serif;background:#f0f9ff;margin:0;padding:20px'>" +
               "<div style='max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)'>" +
               "<div style='background:linear-gradient(135deg,#1D4ED8,#0891B2);padding:32px;text-align:center'>" +
               "<h1 style='color:white;margin:0;font-size:24px;font-weight:800'>ADORA</h1>" +
               "<p style='color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:13px'>LED Billboard Rental Marketplace</p></div>" +
               "<div style='padding:32px'>" +
               "<div style='text-align:center;margin-bottom:24px'>" +
               "<div style='width:64px;height:64px;background:#dcfce7;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px'>" +
               "<span style='font-size:32px'>💰</span></div>" +
               "<h2 style='color:#1D4ED8;margin:0 0 8px;font-size:20px'>Đã Nhận Thanh Toán!</h2>" +
               "<p style='color:#6B7A8D;margin:0;font-size:14px'>Xin chào " + owner.getFullName() + ", khách hàng đã thanh toán cho đơn đặt của bạn.</p></div>" +
               "<div style='background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:24px'>" +
               "<h3 style='color:#1A2332;font-size:14px;margin:0 0 16px;font-weight:600'>Chi Tiết Giao Dịch</h3>" +
               "<table style='width:100%;border-collapse:collapse;font-size:13px'>" +
               "<tr><td style='color:#6B7A8D;padding:6px 0'>Khách hàng</td><td style='color:#1A2332;font-weight:600;text-align:right'>" + renter.getFullName() + "</td></tr>" +
               "<tr><td style='color:#6B7A8D;padding:6px 0'>Email</td><td style='color:#1A2332;font-weight:600;text-align:right'>" + renter.getEmail() + "</td></tr>" +
               "<tr><td style='color:#6B7A8D;padding:6px 0'>Bảng quảng cáo</td><td style='color:#1A2332;font-weight:600;text-align:right'>" + billboardTitle + "</td></tr>" +
               "<tr><td style='color:#6B7A8D;padding:6px 0'>Thời gian</td><td style='color:#1A2332;font-weight:600;text-align:right'>" + booking.getStartDate() + " → " + booking.getEndDate() + "</td></tr>" +
               "<tr><td style='color:#6B7A8D;padding:6px 0'>Tổng giao dịch</td><td style='color:#1A2332;font-weight:600;text-align:right'>" + payment.getAmount().toPlainString() + " ₫</td></tr>" +
               "<tr><td style='color:#6B7A8D;padding:6px 0'>Phí nền tảng (5%)</td><td style='color:#ef4444;font-weight:600;text-align:right'>- " + payment.getPlatformCommission().toPlainString() + " ₫</td></tr>" +
               "<tr style='border-top:2px solid #e3e8ef'><td style='color:#16a34a;padding:12px 0 6px;font-weight:700;font-size:15px'>Doanh thu của bạn</td>" +
               "<td style='color:#16a34a;font-weight:800;font-size:18px;text-align:right;padding:12px 0 6px'>" + payment.getOwnerRevenue().toPlainString() + " ₫</td></tr>" +
               "</table></div>" +
               "<div style='text-align:center;margin-bottom:24px'>" +
               "<a href='" + dashboardUrl + "' style='display:inline-block;background:linear-gradient(135deg,#1D4ED8,#0891B2);color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:14px'>Xem Dashboard →</a></div>" +
               "</div><div style='background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e3e8ef'>" +
               "<p style='color:#9ca3af;font-size:11px;margin:0'>© 2026 ADORA LED Billboard Marketplace. All rights reserved.</p></div></div></body></html>";
    }

    private String buildPaymentFailedEmail(User renter, Payment payment, Booking booking, String billboardTitle) {
        String retryUrl = frontendBaseUrl + "/advertiser/bookings";
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style='font-family:Inter,Arial,sans-serif;background:#f0f9ff;margin:0;padding:20px'>" +
               "<div style='max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)'>" +
               "<div style='background:linear-gradient(135deg,#1D4ED8,#0891B2);padding:32px;text-align:center'>" +
               "<h1 style='color:white;margin:0;font-size:24px;font-weight:800'>ADORA</h1>" +
               "<p style='color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:13px'>LED Billboard Rental Marketplace</p></div>" +
               "<div style='padding:32px'>" +
               "<div style='text-align:center;margin-bottom:24px'>" +
               "<div style='width:64px;height:64px;background:#fee2e2;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px'>" +
               "<span style='font-size:32px'>❌</span></div>" +
               "<h2 style='color:#dc2626;margin:0 0 8px;font-size:20px'>Thanh Toán Thất Bại</h2>" +
               "<p style='color:#6B7A8D;margin:0;font-size:14px'>Xin chào " + renter.getFullName() + ", giao dịch của bạn chưa được hoàn tất.</p></div>" +
               "<div style='background:#fff5f5;border:1px solid #fecaca;border-radius:12px;padding:20px;margin-bottom:24px'>" +
               "<h3 style='color:#dc2626;font-size:14px;margin:0 0 12px;font-weight:600'>Thông Tin Đơn Đặt</h3>" +
               "<table style='width:100%;border-collapse:collapse;font-size:13px'>" +
               "<tr><td style='color:#6B7A8D;padding:4px 0'>Mã đơn</td><td style='color:#1A2332;font-weight:600;text-align:right'>#ADR-" + booking.getId() + "</td></tr>" +
               "<tr><td style='color:#6B7A8D;padding:4px 0'>Bảng quảng cáo</td><td style='color:#1A2332;font-weight:600;text-align:right'>" + billboardTitle + "</td></tr>" +
               "<tr><td style='color:#6B7A8D;padding:4px 0'>Số tiền</td><td style='color:#dc2626;font-weight:600;text-align:right'>" + payment.getAmount().toPlainString() + " ₫</td></tr>" +
               "</table></div>" +
               "<p style='color:#6B7A8D;font-size:13px;text-align:center;margin-bottom:24px'>Đơn đặt vẫn còn hiệu lực. Bạn có thể thử thanh toán lại trong trang quản lý đặt chỗ.</p>" +
               "<div style='text-align:center;margin-bottom:24px'>" +
               "<a href='" + retryUrl + "' style='display:inline-block;background:linear-gradient(135deg,#dc2626,#ef4444);color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:14px'>Thử Lại Thanh Toán →</a></div>" +
               "</div><div style='background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e3e8ef'>" +
               "<p style='color:#9ca3af;font-size:11px;margin:0'>© 2026 ADORA LED Billboard Marketplace. All rights reserved.</p></div></div></body></html>";
    }
}
