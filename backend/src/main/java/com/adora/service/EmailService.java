package com.adora.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
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
}
