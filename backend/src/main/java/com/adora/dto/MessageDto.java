package com.adora.dto;

import com.adora.entity.Role;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageDto {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderName;
    private Role senderRole;
    private String content;
    private LocalDateTime createdAt;
    private boolean mine;
}
