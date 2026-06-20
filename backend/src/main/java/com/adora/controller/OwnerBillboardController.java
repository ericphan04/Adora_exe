package com.adora.controller;

import com.adora.dto.*;
import com.adora.security.UserPrincipal;
import com.adora.service.BillboardService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/owner/billboards")
public class OwnerBillboardController {

    private final BillboardService billboardService;

    public OwnerBillboardController(BillboardService billboardService) {
        this.billboardService = billboardService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BillboardDto>>> getOwnerBillboards(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<BillboardDto> billboards = billboardService.getBillboardsByOwner(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.<List<BillboardDto>>builder()
                .success(true)
                .message("Fetched owner billboards successfully")
                .data(billboards)
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BillboardDto>> createBillboard(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateBillboardRequest request) {
        BillboardDto billboard = billboardService.createBillboard(request, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.<BillboardDto>builder()
                .success(true)
                .message("Billboard created and pending approval")
                .data(billboard)
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BillboardDto>> updateBillboard(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateBillboardRequest request) {
        BillboardDto billboard = billboardService.updateBillboard(id, request, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.<BillboardDto>builder()
                .success(true)
                .message("Billboard updated successfully")
                .data(billboard)
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBillboard(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        billboardService.deleteBillboard(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Billboard deleted successfully")
                .build());
    }

    @PostMapping("/{id}/request-deletion")
    public ResponseEntity<ApiResponse<BillboardDto>> requestDeletion(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        BillboardDto billboard = billboardService.requestDeletion(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.<BillboardDto>builder()
                .success(true)
                .message("Request to delete billboard submitted to Admin")
                .data(billboard)
                .build());
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<ApiResponse<BillboardDto>> addBillboardImage(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody AddImageRequest request) {
        BillboardDto billboard = billboardService.addImage(id, request, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.<BillboardDto>builder()
                .success(true)
                .message("Image added successfully")
                .data(billboard)
                .build());
    }

    @DeleteMapping("/{id}/images/{imageId}")
    public ResponseEntity<ApiResponse<BillboardDto>> deleteBillboardImage(
            @PathVariable Long id,
            @PathVariable Long imageId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        BillboardDto billboard = billboardService.deleteImage(id, imageId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.<BillboardDto>builder()
                .success(true)
                .message("Image deleted successfully")
                .data(billboard)
                .build());
    }

    @PutMapping("/{id}/images/{imageId}/thumbnail")
    public ResponseEntity<ApiResponse<BillboardDto>> setBillboardThumbnail(
            @PathVariable Long id,
            @PathVariable Long imageId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        BillboardDto billboard = billboardService.setThumbnail(id, imageId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.<BillboardDto>builder()
                .success(true)
                .message("Thumbnail set successfully")
                .data(billboard)
                .build());
    }

    @PostMapping("/{id}/availability")
    public ResponseEntity<ApiResponse<BillboardDto>> setBillboardAvailability(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody SetAvailabilityRequest request) {
        BillboardDto billboard = billboardService.setAvailability(id, request, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.<BillboardDto>builder()
                .success(true)
                .message("Billboard availability updated successfully")
                .data(billboard)
                .build());
    }
}
