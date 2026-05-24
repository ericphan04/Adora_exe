package com.adora.controller;

import com.adora.dto.WsChatSendPayload;
import com.adora.entity.Role;
import com.adora.security.UserPrincipal;
import com.adora.service.ConversationService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class ChatWsController {

    private final ConversationService conversationService;

    public ChatWsController(ConversationService conversationService) {
        this.conversationService = conversationService;
    }

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload WsChatSendPayload payload, Principal principal) {
        if (payload == null || payload.getConversationId() == null || payload.getContent() == null) {
            return;
        }
        UserPrincipal user = (UserPrincipal) ((org.springframework.security.core.Authentication) principal)
                .getPrincipal();
        Role role = user.getUser().getRole();
        conversationService.sendMessage(
                payload.getConversationId(),
                new com.adora.dto.SendMessageRequest(payload.getContent().trim()),
                user.getId(),
                role);
    }
}
