package com.adora.controller;

import com.adora.dto.*;
import com.adora.entity.Role;
import com.adora.security.UserPrincipal;
import com.adora.service.ConversationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ConversationController {

    private final ConversationService conversationService;

    public ConversationController(ConversationService conversationService) {
        this.conversationService = conversationService;
    }

    // --- RENTER ---

    @GetMapping("/api/renter/conversations")
    public ResponseEntity<ApiResponse<List<ConversationDto>>> renterList(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ok(conversationService.listForUser(principal.getId(), Role.RENTER));
    }

    @GetMapping("/api/renter/conversations/{id}")
    public ResponseEntity<ApiResponse<ConversationDto>> renterDetail(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ok(conversationService.getDetail(id, principal.getId(), Role.RENTER));
    }

    @PostMapping("/api/renter/conversations")
    public ResponseEntity<ApiResponse<ConversationDto>> renterCreate(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody CreateConversationRequest request) {
        return ok(conversationService.createConversation(request, principal.getId(), Role.RENTER));
    }

    @PostMapping("/api/renter/conversations/{id}/messages")
    public ResponseEntity<ApiResponse<MessageDto>> renterSend(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody SendMessageRequest request) {
        return okMessage(conversationService.sendMessage(id, request, principal.getId(), Role.RENTER));
    }

    @PatchMapping("/api/renter/conversations/{id}/read")
    public ResponseEntity<ApiResponse<ConversationDto>> renterRead(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ok(conversationService.markAsRead(id, principal.getId(), Role.RENTER));
    }

    // --- OWNER ---

    @GetMapping("/api/owner/conversations")
    public ResponseEntity<ApiResponse<List<ConversationDto>>> ownerList(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ok(conversationService.listForUser(principal.getId(), Role.OWNER));
    }

    @GetMapping("/api/owner/conversations/{id}")
    public ResponseEntity<ApiResponse<ConversationDto>> ownerDetail(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ok(conversationService.getDetail(id, principal.getId(), Role.OWNER));
    }

    @PostMapping("/api/owner/conversations")
    public ResponseEntity<ApiResponse<ConversationDto>> ownerCreate(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody CreateConversationRequest request) {
        return ok(conversationService.createConversation(request, principal.getId(), Role.OWNER));
    }

    @PostMapping("/api/owner/conversations/{id}/messages")
    public ResponseEntity<ApiResponse<MessageDto>> ownerSend(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody SendMessageRequest request) {
        return okMessage(conversationService.sendMessage(id, request, principal.getId(), Role.OWNER));
    }

    @PatchMapping("/api/owner/conversations/{id}/read")
    public ResponseEntity<ApiResponse<ConversationDto>> ownerRead(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ok(conversationService.markAsRead(id, principal.getId(), Role.OWNER));
    }

    // --- ADMIN ---

    @GetMapping("/api/admin/conversations")
    public ResponseEntity<ApiResponse<List<ConversationDto>>> adminList(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ok(conversationService.listForUser(principal.getId(), Role.ADMIN));
    }

    @GetMapping("/api/admin/conversations/{id}")
    public ResponseEntity<ApiResponse<ConversationDto>> adminDetail(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ok(conversationService.getDetail(id, principal.getId(), Role.ADMIN));
    }

    @PostMapping("/api/admin/conversations/{id}/messages")
    public ResponseEntity<ApiResponse<MessageDto>> adminSend(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody SendMessageRequest request) {
        return okMessage(conversationService.sendMessage(id, request, principal.getId(), Role.ADMIN));
    }

    @PatchMapping("/api/admin/conversations/{id}/read")
    public ResponseEntity<ApiResponse<ConversationDto>> adminRead(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ok(conversationService.markAsRead(id, principal.getId(), Role.ADMIN));
    }

    private <T> ResponseEntity<ApiResponse<T>> ok(T data) {
        return ResponseEntity.ok(ApiResponse.<T>builder()
                .success(true)
                .message("Success")
                .data(data)
                .build());
    }

    private ResponseEntity<ApiResponse<MessageDto>> okMessage(MessageDto data) {
        return ResponseEntity.ok(ApiResponse.<MessageDto>builder()
                .success(true)
                .message("Message sent")
                .data(data)
                .build());
    }
}
