package com.adora.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationDto {
    private Long id;
    private UserDto renter;
    private UserDto owner;
    private Long bookingId;
    private String bookingStatus;
    private Long billboardId;
    private String billboardTitle;
    private String lastMessagePreview;
    private LocalDateTime lastMessageAt;
    private int unreadCount;
    private UserDto peer;
    private List<MessageDto> messages;
    private LocalDateTime createdAt;
}
