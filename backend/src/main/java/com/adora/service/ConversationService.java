package com.adora.service;

import com.adora.dto.*;
import com.adora.entity.*;
import com.adora.exception.BadRequestException;
import com.adora.exception.ResourceNotFoundException;
import com.adora.messaging.ChatMessagePublisher;
import com.adora.repository.*;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final BillboardRepository billboardRepository;
    private final ChatMessagePublisher chatMessagePublisher;

    public ConversationService(
            ConversationRepository conversationRepository,
            MessageRepository messageRepository,
            UserRepository userRepository,
            BookingRepository bookingRepository,
            BillboardRepository billboardRepository,
            @Lazy ChatMessagePublisher chatMessagePublisher) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.billboardRepository = billboardRepository;
        this.chatMessagePublisher = chatMessagePublisher;
    }

    public void assertCanAccess(Long conversationId, Long userId, Role role) {
        loadAuthorized(conversationId, userId, role);
    }

    public List<ConversationDto> listForUser(Long userId, Role role) {
        List<Conversation> conversations = role == Role.ADMIN
                ? conversationRepository.findAllForAdmin()
                : conversationRepository.findForRenterOrOwner(userId);

        return conversations.stream()
                .map(c -> toSummaryDto(c, userId, role, false))
                .collect(Collectors.toList());
    }

    public ConversationDto getDetail(Long conversationId, Long userId, Role role) {
        Conversation conversation = loadAuthorized(conversationId, userId, role);
        applyMarkRead(conversation, userId, role);
        return toDetailDto(conversation, userId, role);
    }

    public ConversationDto createConversation(CreateConversationRequest request, Long userId, Role role) {
        User actor = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        User renter;
        User owner;
        Booking booking = null;
        Billboard billboard = null;

        if (request.getBookingId() != null) {
            booking = bookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
            renter = booking.getRenter();
            owner = booking.getBillboard().getOwner();
            billboard = booking.getBillboard();
            assertParticipant(actor, renter, owner, role);
        } else if (request.getBillboardId() != null) {
            billboard = billboardRepository.findById(request.getBillboardId())
                    .orElseThrow(() -> new ResourceNotFoundException("Billboard not found"));
            owner = billboard.getOwner();
            if (role == Role.RENTER) {
                renter = actor;
            } else if (role == Role.OWNER) {
                renter = resolveRenter(request.getRenterId());
                if (!owner.getId().equals(actor.getId())) {
                    throw new BadRequestException("You can only create conversations for your billboards");
                }
            } else {
                renter = resolveRenter(request.getRenterId());
            }
        } else if (role == Role.RENTER) {
            renter = actor;
            owner = resolveOwner(request.getOwnerId());
        } else if (role == Role.OWNER) {
            owner = actor;
            renter = resolveRenter(request.getRenterId());
        } else {
            renter = resolveRenter(request.getRenterId());
            owner = resolveOwner(request.getOwnerId());
        }

        if (renter.getRole() != Role.RENTER) {
            throw new BadRequestException("Renter participant must have RENTER role");
        }
        if (owner.getRole() != Role.OWNER) {
            throw new BadRequestException("Owner participant must have OWNER role");
        }

        final Booking linkedBooking = booking;
        final Billboard linkedBillboard = billboard;

        Conversation conversation = findExisting(renter.getId(), owner.getId(), linkedBooking, linkedBillboard)
                .orElseGet(() -> conversationRepository.save(Conversation.builder()
                        .renter(renter)
                        .owner(owner)
                        .booking(linkedBooking)
                        .billboard(linkedBillboard)
                        .renterLastReadAt(LocalDateTime.now())
                        .ownerLastReadAt(LocalDateTime.now())
                        .adminLastReadAt(LocalDateTime.now())
                        .build()));

        if (request.getInitialMessage() != null && !request.getInitialMessage().isBlank()) {
            appendMessage(conversation, actor, request.getInitialMessage().trim());
        }

        return toDetailDto(conversation, userId, role);
    }

    public MessageDto sendMessage(Long conversationId, SendMessageRequest request, Long userId, Role role) {
        Conversation conversation = loadAuthorized(conversationId, userId, role);
        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (role == Role.RENTER && !conversation.getRenter().getId().equals(userId)) {
            throw new BadRequestException("Access denied");
        }
        if (role == Role.OWNER && !conversation.getOwner().getId().equals(userId)) {
            throw new BadRequestException("Access denied");
        }

        Message message = appendMessage(conversation, sender, request.getContent().trim());
        applyMarkRead(conversation, userId, role);
        return toMessageDto(message, userId);
    }

    public ConversationDto markAsRead(Long conversationId, Long userId, Role role) {
        Conversation conversation = loadAuthorized(conversationId, userId, role);
        applyMarkRead(conversation, userId, role);
        return toSummaryDto(conversation, userId, role, false);
    }

    private Message appendMessage(Conversation conversation, User sender, String content) {
        Message message = messageRepository.save(Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(content)
                .build());

        String preview = content.length() > 200 ? content.substring(0, 200) + "…" : content;
        conversation.setLastMessagePreview(preview);
        conversation.setLastMessageAt(message.getCreatedAt());
        conversationRepository.save(conversation);

        MessageDto broadcast = toMessageDto(message, sender.getId());
        broadcast.setMine(false);
        chatMessagePublisher.publishNewMessage(conversation.getId(), broadcast);
        chatMessagePublisher.publishInboxRefresh(conversation.getRenter().getEmail());
        chatMessagePublisher.publishInboxRefresh(conversation.getOwner().getEmail());

        return message;
    }

    private void applyMarkRead(Conversation conversation, Long userId, Role role) {
        LocalDateTime now = LocalDateTime.now();
        if (role == Role.ADMIN) {
            conversation.setAdminLastReadAt(now);
        } else if (conversation.getRenter().getId().equals(userId)) {
            conversation.setRenterLastReadAt(now);
        } else if (conversation.getOwner().getId().equals(userId)) {
            conversation.setOwnerLastReadAt(now);
        }
        conversationRepository.save(conversation);
    }

    private Conversation loadAuthorized(Long conversationId, Long userId, Role role) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        if (role == Role.ADMIN) {
            return conversation;
        }
        if (!conversation.getRenter().getId().equals(userId)
                && !conversation.getOwner().getId().equals(userId)) {
            throw new BadRequestException("Access denied to this conversation");
        }
        return conversation;
    }

    private java.util.Optional<Conversation> findExisting(
            Long renterId, Long ownerId, Booking booking, Billboard billboard) {
        if (booking != null) {
            return conversationRepository.findByRenterIdAndOwnerIdAndBookingId(
                    renterId, ownerId, booking.getId());
        }
        if (billboard != null) {
            return conversationRepository.findByRenterIdAndOwnerIdAndBookingIsNullAndBillboardId(
                    renterId, ownerId, billboard.getId());
        }
        return conversationRepository.findByRenterIdAndOwnerIdAndBookingIsNullAndBillboardIsNull(
                renterId, ownerId);
    }

    private void assertParticipant(User actor, User renter, User owner, Role role) {
        if (role == Role.ADMIN) return;
        if (role == Role.RENTER && !renter.getId().equals(actor.getId())) {
            throw new BadRequestException("You can only access your own bookings");
        }
        if (role == Role.OWNER && !owner.getId().equals(actor.getId())) {
            throw new BadRequestException("You can only access bookings for your billboards");
        }
    }

    private User resolveOwner(Long ownerId) {
        if (ownerId == null) {
            throw new BadRequestException("ownerId is required");
        }
        return userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));
    }

    private User resolveRenter(Long renterId) {
        if (renterId == null) {
            throw new BadRequestException("renterId is required");
        }
        return userRepository.findById(renterId)
                .orElseThrow(() -> new ResourceNotFoundException("Renter not found"));
    }

    private ConversationDto toSummaryDto(Conversation c, Long viewerId, Role viewerRole, boolean includeMessages) {
        ConversationDto dto = baseDto(c, viewerId, viewerRole);
        if (includeMessages) {
            dto.setMessages(loadMessages(c.getId(), viewerId));
        }
        return dto;
    }

    private ConversationDto toDetailDto(Conversation c, Long viewerId, Role viewerRole) {
        ConversationDto dto = baseDto(c, viewerId, viewerRole);
        dto.setMessages(loadMessages(c.getId(), viewerId));
        return dto;
    }

    private ConversationDto baseDto(Conversation c, Long viewerId, Role viewerRole) {
        UserDto renterDto = toUserDto(c.getRenter());
        UserDto ownerDto = toUserDto(c.getOwner());
        UserDto peer = viewerRole == Role.ADMIN
                ? null
                : (c.getRenter().getId().equals(viewerId) ? ownerDto : renterDto);

        return ConversationDto.builder()
                .id(c.getId())
                .renter(renterDto)
                .owner(ownerDto)
                .peer(peer)
                .bookingId(c.getBooking() != null ? c.getBooking().getId() : null)
                .bookingStatus(c.getBooking() != null ? c.getBooking().getStatus().name() : null)
                .billboardId(c.getBillboard() != null ? c.getBillboard().getId()
                        : (c.getBooking() != null ? c.getBooking().getBillboard().getId() : null))
                .billboardTitle(resolveBillboardTitle(c))
                .lastMessagePreview(c.getLastMessagePreview())
                .lastMessageAt(c.getLastMessageAt())
                .unreadCount(countUnread(c, viewerId, viewerRole))
                .createdAt(c.getCreatedAt())
                .build();
    }

    private String resolveBillboardTitle(Conversation c) {
        if (c.getBillboard() != null) {
            return c.getBillboard().getTitle();
        }
        if (c.getBooking() != null && c.getBooking().getBillboard() != null) {
            return c.getBooking().getBillboard().getTitle();
        }
        return null;
    }

    private int countUnread(Conversation c, Long viewerId, Role viewerRole) {
        if (c.getLastMessageAt() == null) return 0;
        LocalDateTime lastRead = null;
        if (viewerRole == Role.ADMIN) {
            lastRead = c.getAdminLastReadAt();
        } else if (c.getRenter().getId().equals(viewerId)) {
            lastRead = c.getRenterLastReadAt();
        } else if (c.getOwner().getId().equals(viewerId)) {
            lastRead = c.getOwnerLastReadAt();
        }
        if (lastRead == null) return 1;
        return c.getLastMessageAt().isAfter(lastRead) ? 1 : 0;
    }

    private List<MessageDto> loadMessages(Long conversationId, Long viewerId) {
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId).stream()
                .map(m -> toMessageDto(m, viewerId))
                .collect(Collectors.toList());
    }

    private MessageDto toMessageDto(Message m, Long viewerId) {
        return MessageDto.builder()
                .id(m.getId())
                .conversationId(m.getConversation().getId())
                .senderId(m.getSender().getId())
                .senderName(m.getSender().getFullName())
                .senderRole(m.getSender().getRole())
                .content(m.getContent())
                .createdAt(m.getCreatedAt())
                .mine(m.getSender().getId().equals(viewerId))
                .build();
    }

    private UserDto toUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.getStatus())
                .companyName(user.getCompanyName())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
