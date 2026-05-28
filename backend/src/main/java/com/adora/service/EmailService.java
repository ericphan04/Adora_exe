package com.adora.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String toEmail, String code) {
        String subject = "Xac thuc tai khoan ADORA";
        String body = "Ma xac thuc ADORA cua ban la: " + code + "\n" +
                "Ma nay co hieu luc trong vong 5 phut. Vui long khong chia se ma nay voi bat ky ai.";

        if (mailUsername == null || mailUsername.trim().isEmpty() || mailUsername.contains("MAIL_USERNAME")) {
            logger.info("==================================================");
            logger.info("[SMTP NOT CONFIGURED] Verification Code for email {} is {}", toEmail, code);
            logger.info("==================================================");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailUsername);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            logger.info("Verification email sent successfully to {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send email to {}. Error: {}", toEmail, e.getMessage());
            logger.info("==================================================");
            logger.info("[FALLBACK] Verification Code for email {} is {}", toEmail, code);
            logger.info("==================================================");
        }
    }

    @Async
    public void sendPaymentSuccessEmail(String toEmail, String renterName, Long bookingId, String finalAmount, String billboardName, String transactionCode) {
        String subject = "[ADORA] Xác nhận thanh toán thành công - Đơn đặt #" + bookingId;
        String htmlContent = "<div style=\"font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);\">" +
                "  <div style=\"background: linear-gradient(135deg, #1D4ED8, #3B82F6); padding: 32px 24px; text-align: center; color: white;\">" +
                "    <h1 style=\"margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;\">ADORA MARKETPLACE</h1>" +
                "    <p style=\"margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;\">Giao dịch thanh toán thành công</p>" +
                "  </div>" +
                "  <div style=\"padding: 32px 24px; color: #1e293b; line-height: 1.6; background-color: #ffffff;\">" +
                "    <p style=\"margin-top: 0; font-size: 16px;\">Xin chào <strong>" + renterName + "</strong>,</p>" +
                "    <p style=\"font-size: 15px;\">Tuyệt vời! Giao dịch thanh toán cho đơn đặt màn hình LED <strong>#ADR-" + bookingId + "</strong> đã được hệ thống ghi nhận thành công.</p>" +
                "    <div style=\"background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 20px; margin: 24px 0;\">" +
                "      <h3 style=\"margin-top: 0; color: #1D4ED8; font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; font-weight: 700;\">CHI TIẾT THANH TOÁN</h3>" +
                "      <table style=\"width: 100%; border-collapse: collapse; font-size: 14px;\">" +
                "        <tr><td style=\"padding: 8px 0; color: #64748b; width: 40%;\">Màn hình LED:</td><td style=\"padding: 8px 0; font-weight: 700; color: #0f172a;\">" + billboardName + "</td></tr>" +
                "        <tr><td style=\"padding: 8px 0; color: #64748b;\">Tổng số tiền:</td><td style=\"padding: 8px 0; font-weight: 800; color: #1D4ED8; font-size: 16px;\">" + finalAmount + " ₫</td></tr>" +
                "        <tr><td style=\"padding: 8px 0; color: #64748b;\">Mã giao dịch:</td><td style=\"padding: 8px 0; font-family: monospace; color: #0f172a;\">" + transactionCode + "</td></tr>" +
                "        <tr><td style=\"padding: 8px 0; color: #64748b;\">Phương thức:</td><td style=\"padding: 8px 0; color: #0f172a;\">VNPAY Online</td></tr>" +
                "      </table>" +
                "    </div>" +
                "    <p style=\"font-size: 14px; color: #64748b;\">Lịch hiển thị quảng cáo của bạn đã được cập nhật chính thức. Bạn có thể theo dõi và quản lý chiến dịch trong trang quản lý của ADORA.</p>" +
                "    <div style=\"text-align: center; margin: 36px 0 12px 0;\">" +
                "      <a href=\"http://localhost:5173/advertiser\" style=\"background-color: #1D4ED8; color: white; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px rgba(29, 78, 216, 0.15);\">Tru cập Trang Quản Lý</a>" +
                "    </div>" +
                "  </div>" +
                "  <div style=\"background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-t: 1px solid #f1f5f9;\">" +
                "    Đây là email tự động từ hệ thống ADORA. Vui lòng không phản hồi trực tiếp email này.<br/>" +
                "    © 2026 ADORA LED Billboard Rental Marketplace. All rights reserved." +
                "  </div>" +
                "</div>";

        sendHtmlEmailHelper(toEmail, subject, htmlContent);
    }

    @Async
    public void sendPaymentFailedEmail(String toEmail, String renterName, Long bookingId, String finalAmount, String billboardName) {
        String subject = "[ADORA] Thông báo thanh toán thất bại - Đơn đặt #" + bookingId;
        String htmlContent = "<div style=\"font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);\">" +
                "  <div style=\"background: linear-gradient(135deg, #EF4444, #F87171); padding: 32px 24px; text-align: center; color: white;\">" +
                "    <h1 style=\"margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;\">ADORA MARKETPLACE</h1>" +
                "    <p style=\"margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;\">Giao dịch thanh toán thất bại</p>" +
                "  </div>" +
                "  <div style=\"padding: 32px 24px; color: #1e293b; line-height: 1.6; background-color: #ffffff;\">" +
                "    <p style=\"margin-top: 0; font-size: 16px;\">Xin chào <strong>" + renterName + "</strong>,</p>" +
                "    <p style=\"font-size: 15px;\">Chúng tôi tiếc phải thông báo rằng giao dịch thanh toán cho đơn đặt màn hình LED <strong>#ADR-" + bookingId + "</strong> đã không thể hoàn tất thành công.</p>" +
                "    <div style=\"background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 12px; padding: 20px; margin: 24px 0;\">" +
                "      <h3 style=\"margin-top: 0; color: #EF4444; font-size: 15px; border-bottom: 1px solid #fecaca; padding-bottom: 8px; font-weight: 700;\">THÔNG TIN GIAO DỊCH LỖI</h3>" +
                "      <table style=\"width: 100%; border-collapse: collapse; font-size: 14px;\">" +
                "        <tr><td style=\"padding: 8px 0; color: #991b1b; width: 40%;\">Màn hình LED:</td><td style=\"padding: 8px 0; font-weight: 700; color: #7f1d1d;\">" + billboardName + "</td></tr>" +
                "        <tr><td style=\"padding: 8px 0; color: #991b1b;\">Số tiền yêu cầu:</td><td style=\"padding: 8px 0; font-weight: 800; color: #EF4444; font-size: 16px;\">" + finalAmount + " ₫</td></tr>" +
                "        <tr><td style=\"padding: 8px 0; color: #991b1b;\">Trạng thái:</td><td style=\"padding: 8px 0; font-weight: 700; color: #EF4444;\">Thất bại / Bị hủy</td></tr>" +
                "      </table>" +
                "    </div>" +
                "    <p style=\"font-size: 14px; color: #64748b;\">Nếu có sự cố phát sinh từ ngân hàng, vui lòng kiểm tra lại số dư tài khoản của bạn hoặc thử thanh toán lại trong trang cá nhân ADORA.</p>" +
                "    <div style=\"text-align: center; margin: 36px 0 12px 0;\">" +
                "      <a href=\"http://localhost:5173/advertiser\" style=\"background-color: #EF4444; color: white; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.15);\">Thanh Toán Lại</a>" +
                "    </div>" +
                "  </div>" +
                "  <div style=\"background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-t: 1px solid #f1f5f9;\">" +
                "    Đây là email tự động từ hệ thống ADORA. Vui lòng không phản hồi trực tiếp email này.<br/>" +
                "    © 2026 ADORA LED Billboard Rental Marketplace. All rights reserved." +
                "  </div>" +
                "</div>";

        sendHtmlEmailHelper(toEmail, subject, htmlContent);
    }

    @Async
    public void sendBookingPaidEmail(String toEmail, String ownerName, String renterName, Long bookingId, String finalAmount, String billboardName) {
        String subject = "[ADORA] Tin vui! Yêu cầu đặt bảng #" + bookingId + " đã được thanh toán";
        String htmlContent = "<div style=\"font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);\">" +
                "  <div style=\"background: linear-gradient(135deg, #10B981, #059669); padding: 32px 24px; text-align: center; color: white;\">" +
                "    <h1 style=\"margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;\">ADORA MARKETPLACE</h1>" +
                "    <p style=\"margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;\">Có giao dịch thanh toán doanh thu mới</p>" +
                "  </div>" +
                "  <div style=\"padding: 32px 24px; color: #1e293b; line-height: 1.6; background-color: #ffffff;\">" +
                "    <p style=\"margin-top: 0; font-size: 16px;\">Xin chào <strong>" + ownerName + "</strong>,</p>" +
                "    <p style=\"font-size: 15px;\">Chúng tôi xin thông báo nhà quảng cáo <strong>" + renterName + "</strong> đã hoàn tất thanh toán thành công cho đơn thuê bảng quảng cáo <strong>#ADR-" + bookingId + "</strong> của bạn.</p>" +
                "    <div style=\"background-color: #ecfdf5; border: 1px solid #d1fae5; border-radius: 12px; padding: 20px; margin: 24px 0;\">" +
                "      <h3 style=\"margin-top: 0; color: #059669; font-size: 15px; border-bottom: 1px solid #a7f3d0; padding-bottom: 8px; font-weight: 700;\">THÔNG TIN DOANH THU ĐƠN</h3>" +
                "      <table style=\"width: 100%; border-collapse: collapse; font-size: 14px;\">" +
                "        <tr><td style=\"padding: 8px 0; color: #065f46; width: 40%;\">Tên màn hình LED:</td><td style=\"padding: 8px 0; font-weight: 700; color: #064e3b;\">" + billboardName + "</td></tr>" +
                "        <tr><td style=\"padding: 8px 0; color: #065f46;\">Tổng giá trị đơn:</td><td style=\"padding: 8px 0; font-weight: 800; color: #059669; font-size: 16px;\">" + finalAmount + " ₫</td></tr>" +
                "        <tr><td style=\"padding: 8px 0; color: #065f46;\">Người thanh toán:</td><td style=\"padding: 8px 0; color: #064e3b;\">" + renterName + "</td></tr>" +
                "        <tr><td style=\"padding: 8px 0; color: #065f46;\">Chiết khấu hệ thống:</td><td style=\"padding: 8px 0; color: #6b7280;\">5%</td></tr>" +
                "      </table>" +
                "    </div>" +
                "    <p style=\"font-size: 14px; color: #64748b;\">Quý khách vui lòng chuẩn bị phát hình ảnh quảng cáo theo đúng thời gian trong lịch trình của đơn đặt bảng quảng cáo. Doanh thu của đơn hàng này đã được cộng vào tài khoản quản lý của bạn.</p>" +
                "    <div style=\"text-align: center; margin: 36px 0 12px 0;\">" +
                "      <a href=\"http://localhost:5173/owner\" style=\"background-color: #10B981; color: white; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.15);\">Truy cập Chủ Bảng</a>" +
                "    </div>" +
                "  </div>" +
                "  <div style=\"background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-t: 1px solid #f1f5f9;\">" +
                "    Đây là email tự động từ hệ thống ADORA. Vui lòng không phản hồi trực tiếp email này.<br/>" +
                "    © 2026 ADORA LED Billboard Rental Marketplace. All rights reserved." +
                "  </div>" +
                "</div>";

        sendHtmlEmailHelper(toEmail, subject, htmlContent);
    }

    @Async
    public void sendBookingAcceptedEmail(String toEmail, String renterName, Long bookingId, String billboardName) {
        String subject = "[ADORA] Yêu cầu đặt bảng #" + bookingId + " đã được CHẤP NHẬN";
        String htmlContent = "<div style=\"font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);\">" +
                "  <div style=\"background: linear-gradient(135deg, #1D4ED8, #3B82F6); padding: 32px 24px; text-align: center; color: white;\">" +
                "    <h1 style=\"margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;\">ADORA MARKETPLACE</h1>" +
                "    <p style=\"margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;\">Yêu cầu được chấp nhận</p>" +
                "  </div>" +
                "  <div style=\"padding: 32px 24px; color: #1e293b; line-height: 1.6; background-color: #ffffff;\">" +
                "    <p style=\"margin-top: 0; font-size: 16px;\">Xin chào <strong>" + renterName + "</strong>,</p>" +
                "    <p style=\"font-size: 15px;\">Tin vui! Chủ sở hữu màn hình LED <strong>" + billboardName + "</strong> đã chấp nhận yêu cầu thuê bảng <strong>#ADR-" + bookingId + "</strong> của bạn.</p>" +
                "    <p style=\"font-size: 15px; font-weight: 700; color: #1d4ed8; background-color: #eff6ff; padding: 12px; border-radius: 8px; border-left: 4px solid #1D4ED8;\">" +
                "      Vui lòng hoàn tất thanh toán trong vòng 24 giờ để chính thức giữ chỗ và kích hoạt lịch chiếu chiến dịch của bạn." +
                "    </p>" +
                "    <div style=\"text-align: center; margin: 36px 0 12px 0;\">" +
                "      <a href=\"http://localhost:5173/advertiser\" style=\"background-color: #1D4ED8; color: white; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px rgba(29, 78, 216, 0.15);\">Thanh Toán Ngay</a>" +
                "    </div>" +
                "  </div>" +
                "  <div style=\"background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-t: 1px solid #f1f5f9;\">" +
                "    © 2026 ADORA LED Billboard Rental Marketplace. All rights reserved." +
                "  </div>" +
                "</div>";

        sendHtmlEmailHelper(toEmail, subject, htmlContent);
    }

    @Async
    public void sendBookingRejectedEmail(String toEmail, String renterName, Long bookingId, String billboardName) {
        String subject = "[ADORA] Thông báo từ chối yêu cầu đặt bảng #" + bookingId;
        String htmlContent = "<div style=\"font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);\">" +
                "  <div style=\"background: linear-gradient(135deg, #475569, #64748b); padding: 32px 24px; text-align: center; color: white;\">" +
                "    <h1 style=\"margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;\">ADORA MARKETPLACE</h1>" +
                "    <p style=\"margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;\">Yêu cầu đặt bảng bị từ chối</p>" +
                "  </div>" +
                "  <div style=\"padding: 32px 24px; color: #1e293b; line-height: 1.6; background-color: #ffffff;\">" +
                "    <p style=\"margin-top: 0; font-size: 16px;\">Xin chào <strong>" + renterName + "</strong>,</p>" +
                "    <p style=\"font-size: 15px;\">Chúng tôi rất tiếc phải thông báo rằng yêu cầu thuê màn hình LED <strong>" + billboardName + "</strong> (Mã đơn đặt: <strong>#ADR-" + bookingId + "</strong>) đã bị từ chối bởi chủ bảng sở hữu.</p>" +
                "    <p style=\"font-size: 14px; color: #64748b;\">" +
                "      Số ngày đặt của bạn trên lịch hiển thị đã được giải phóng trở lại trạng thái sẵn sàng thuê. Bạn có thể tìm kiếm và thuê một màn hình LED tương tự khác phù hợp với chiến dịch của bạn trên ADORA." +
                "    </p>" +
                "    <div style=\"text-align: center; margin: 36px 0 12px 0;\">" +
                "      <a href=\"http://localhost:5173/billboards\" style=\"background-color: #475569; color: white; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px rgba(71, 85, 105, 0.15);\">Tìm Bảng Quảng Cáo Khác</a>" +
                "    </div>" +
                "  </div>" +
                "  <div style=\"background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-t: 1px solid #f1f5f9;\">" +
                "    © 2026 ADORA LED Billboard Rental Marketplace. All rights reserved." +
                "  </div>" +
                "</div>";

        sendHtmlEmailHelper(toEmail, subject, htmlContent);
    }

    private void sendHtmlEmailHelper(String toEmail, String subject, String htmlContent) {
        if (mailUsername == null || mailUsername.trim().isEmpty() || mailUsername.contains("MAIL_USERNAME")) {
            logger.info("==================================================");
            logger.info("[SMTP NOT CONFIGURED] HTML Email to {} | Subject: {}", toEmail, subject);
            logger.info("==================================================");
            return;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(mailUsername);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);
            logger.info("HTML Transactional Email sent successfully to {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send HTML email to {}. Error: {}", toEmail, e.getMessage());
        }
    }
}
