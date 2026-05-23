package com.adora.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WsChatSendPayload {
    private Long conversationId;
    private String content;
}
