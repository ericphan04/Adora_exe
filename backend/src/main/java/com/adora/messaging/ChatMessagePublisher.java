package com.adora.messaging;

import com.adora.dto.MessageDto;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class ChatMessagePublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public ChatMessagePublisher(@Lazy SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publishNewMessage(Long conversationId, MessageDto message) {
        messagingTemplate.convertAndSend("/topic/conversation." + conversationId, message);
    }

    public void publishInboxRefresh(String userEmail) {
        messagingTemplate.convertAndSendToUser(
                userEmail,
                "/queue/inbox",
                Map.of("type", "INBOX_REFRESH"));
    }
}
