package com.adora.controller;

import com.adora.dto.ApiResponse;
import com.adora.dto.BillboardDto;
import com.adora.entity.BillboardStatus;
import com.adora.service.BillboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/billboards")
public class AdminBillboardController {

    private final BillboardService billboardService;

    public AdminBillboardController(BillboardService billboardService) {
        this.billboardService = billboardService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BillboardDto>>> getAllBillboards() {
        List<BillboardDto> billboards = billboardService.getAdminBillboards(null);
        return ResponseEntity.ok(ApiResponse.<List<BillboardDto>>builder()
                .success(true)
                .message("Fetched all billboards successfully")
                .data(billboards)
                .build());
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<BillboardDto>>> getPendingBillboards() {
        List<BillboardDto> billboards = billboardService.getAdminBillboards(BillboardStatus.PENDING);
        return ResponseEntity.ok(ApiResponse.<List<BillboardDto>>builder()
                .success(true)
                .message("Fetched pending billboards successfully")
                .data(billboards)
                .build());
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<BillboardDto>> approveBillboard(@PathVariable Long id) {
        BillboardDto billboard = billboardService.updateStatus(id, BillboardStatus.APPROVED);
        return ResponseEntity.ok(ApiResponse.<BillboardDto>builder()
                .success(true)
                .message("Billboard approved successfully")
                .data(billboard)
                .build());
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<BillboardDto>> rejectBillboard(@PathVariable Long id) {
        BillboardDto billboard = billboardService.updateStatus(id, BillboardStatus.REJECTED);
        return ResponseEntity.ok(ApiResponse.<BillboardDto>builder()
                .success(true)
                .message("Billboard rejected successfully")
                .data(billboard)
                .build());
    }

    @PatchMapping("/{id}/hide")
    public ResponseEntity<ApiResponse<BillboardDto>> hideBillboard(@PathVariable Long id) {
        BillboardDto billboard = billboardService.updateStatus(id, BillboardStatus.HIDDEN);
        return ResponseEntity.ok(ApiResponse.<BillboardDto>builder()
                .success(true)
                .message("Billboard hidden successfully")
                .data(billboard)
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBillboard(@PathVariable Long id) {
        billboardService.deleteBillboard(id, null);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Billboard deleted successfully")
                .build());
    }
}
