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
    private Long userId;
    private NotificationType type;
    private String title;
    private String message;
    private Long bookingId;
    private Long paymentId;
    private boolean read;
    private LocalDateTime createdAt;
}
