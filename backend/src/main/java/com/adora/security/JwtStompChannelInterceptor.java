package com.adora.security;

import com.adora.entity.Role;
import com.adora.exception.BadRequestException;
import com.adora.service.ConversationService;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

@Component
public class JwtStompChannelInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;
    private final ConversationService conversationService;

    public JwtStompChannelInterceptor(
            JwtTokenProvider jwtTokenProvider,
            CustomUserDetailsService userDetailsService,
            @Lazy ConversationService conversationService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
        this.conversationService = conversationService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            authenticate(accessor);
        } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            ensureAuthenticated(accessor);
            authorizeSubscribe(accessor);
        } else if (StompCommand.SEND.equals(accessor.getCommand())) {
            ensureAuthenticated(accessor);
        }

        return message;
    }

    private void authenticate(StompHeaderAccessor accessor) {
        String token = resolveToken(accessor);
        if (token == null || !jwtTokenProvider.validateToken(token)) {
            throw new BadRequestException("Invalid or missing WebSocket token");
        }
        String email = jwtTokenProvider.getEmailFromJWT(token);
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        accessor.setUser(auth);
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private void ensureAuthenticated(StompHeaderAccessor accessor) {
        if (accessor.getUser() == null) {
            throw new BadRequestException("WebSocket not authenticated");
        }
    }

    private void authorizeSubscribe(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        if (destination == null) {
            return;
        }
        if (destination.startsWith("/topic/conversation.")) {
            String idPart = destination.substring("/topic/conversation.".length());
            try {
                Long conversationId = Long.parseLong(idPart);
                UserPrincipal principal = getPrincipal(accessor);
                Role role = principal.getUser().getRole();
                conversationService.assertCanAccess(conversationId, principal.getId(), role);
            } catch (NumberFormatException e) {
                throw new BadRequestException("Invalid conversation topic");
            }
        }
    }

    private UserPrincipal getPrincipal(StompHeaderAccessor accessor) {
        if (accessor.getUser() instanceof UsernamePasswordAuthenticationToken auth) {
            return (UserPrincipal) auth.getPrincipal();
        }
        throw new BadRequestException("WebSocket principal missing");
    }

    private String resolveToken(StompHeaderAccessor accessor) {
        String authHeader = accessor.getFirstNativeHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        String tokenParam = accessor.getFirstNativeHeader("token");
        return tokenParam;
    }
}
