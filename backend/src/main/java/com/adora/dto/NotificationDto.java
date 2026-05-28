package com.adora.dto;

import com.adora.entity.NotificationType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {
    private Long id;
    private String title;
    private String message;
    private NotificationType type;
    private Long bookingId;
    private Long paymentId;
    private boolean isRead;
    private LocalDateTime createdAt;
}
