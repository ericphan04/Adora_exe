package com.adora.controller;

import com.adora.dto.ApiResponse;
import com.adora.dto.CreateReportRequest;
import com.adora.dto.ReportDto;
import com.adora.entity.ReportStatus;
import com.adora.security.UserPrincipal;
import com.adora.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping("/api/reports")
    public ResponseEntity<ApiResponse<ReportDto>> createReport(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateReportRequest request) {
        ReportDto report = reportService.createReport(request, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.<ReportDto>builder()
                .success(true)
                .message("Report submitted successfully")
                .data(report)
                .build());
    }

    @GetMapping("/api/admin/reports")
    public ResponseEntity<ApiResponse<List<ReportDto>>> getAllReports(
            @RequestParam(required = false) ReportStatus status) {
        List<ReportDto> reports = reportService.getAllReports(status);
        return ResponseEntity.ok(ApiResponse.<List<ReportDto>>builder()
                .success(true)
                .message("Fetched reports successfully")
                .data(reports)
                .build());
    }

    @PatchMapping("/api/admin/reports/{id}/resolve")
    public ResponseEntity<ApiResponse<ReportDto>> resolveReport(@PathVariable Long id) {
        ReportDto report = reportService.updateReportStatus(id, ReportStatus.RESOLVED);
        return ResponseEntity.ok(ApiResponse.<ReportDto>builder()
                .success(true)
                .message("Report marked as resolved")
                .data(report)
                .build());
    }

    @PatchMapping("/api/admin/reports/{id}/reject")
    public ResponseEntity<ApiResponse<ReportDto>> rejectReport(@PathVariable Long id) {
        ReportDto report = reportService.updateReportStatus(id, ReportStatus.REJECTED);
        return ResponseEntity.ok(ApiResponse.<ReportDto>builder()
                .success(true)
                .message("Report rejected")
                .data(report)
                .build());
    }
}
