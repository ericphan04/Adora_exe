package com.adora.controller;

import com.adora.dto.AdminDashboardResponse;
import com.adora.dto.ApiResponse;
import com.adora.dto.OwnerDashboardResponse;
import com.adora.dto.RenterDashboardResponse;
import com.adora.security.UserPrincipal;
import com.adora.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/api/renter/dashboard")
    public ResponseEntity<ApiResponse<RenterDashboardResponse>> getRenterDashboard(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        RenterDashboardResponse dashboard = dashboardService.getRenterDashboard(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.<RenterDashboardResponse>builder()
                .success(true)
                .message("Fetched renter dashboard successfully")
                .data(dashboard)
                .build());
    }

    @GetMapping("/api/owner/dashboard")
    public ResponseEntity<ApiResponse<OwnerDashboardResponse>> getOwnerDashboard(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        OwnerDashboardResponse dashboard = dashboardService.getOwnerDashboard(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.<OwnerDashboardResponse>builder()
                .success(true)
                .message("Fetched owner dashboard successfully")
                .data(dashboard)
                .build());
    }

    @GetMapping("/api/admin/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getAdminDashboard() {
        AdminDashboardResponse dashboard = dashboardService.getAdminDashboard();
        return ResponseEntity.ok(ApiResponse.<AdminDashboardResponse>builder()
                .success(true)
                .message("Fetched admin dashboard successfully")
                .data(dashboard)
                .build());
    }
}
