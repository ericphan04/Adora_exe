package com.adora.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateConversationRequest {
    private Long ownerId;
    private Long renterId;
    private Long bookingId;
    private Long billboardId;
    private String initialMessage;
}
