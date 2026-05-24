package com.adora.controller;

import com.adora.dto.ApiResponse;
import com.adora.dto.NotificationDto;
import com.adora.security.UserPrincipal;
import com.adora.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getMyNotifications(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<NotificationDto> notifications = notificationService.getUserNotifications(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Fetched notifications successfully", notifications));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getMyUnreadCount(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        long unreadCount = notificationService.getUnreadCount(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Fetched unread count successfully", unreadCount));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markNotificationAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        notificationService.markAsRead(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Marked notification as read", null));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllNotificationsAsRead(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        notificationService.markAllAsRead(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Marked all notifications as read", null));
    }
}
