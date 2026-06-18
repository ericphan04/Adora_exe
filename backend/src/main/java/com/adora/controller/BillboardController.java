package com.adora.controller;

import com.adora.dto.ApiResponse;
import com.adora.dto.BillboardDto;
import com.adora.dto.ReviewDto;
import com.adora.dto.BookedSlotDto;
import com.adora.service.BillboardService;
import com.adora.service.ReviewService;
import com.adora.service.BookingService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/billboards")
public class BillboardController {

    private final BillboardService billboardService;
    private final ReviewService reviewService;
    private final BookingService bookingService;

    public BillboardController(BillboardService billboardService, ReviewService reviewService, BookingService bookingService) {
        this.billboardService = billboardService;
        this.reviewService = reviewService;
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BillboardDto>>> getAllBillboards(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) String feature) {
        
        List<BillboardDto> billboards = billboardService.getAllPublicBillboards(
                keyword, city, district, minPrice, maxPrice, categoryId, featured, feature
        );
        return ResponseEntity.ok(ApiResponse.<List<BillboardDto>>builder()
                .success(true)
                .message("Fetched billboards successfully")
                .data(billboards)
                .build());
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<BillboardDto>>> getFeaturedBillboards() {
        List<BillboardDto> billboards = billboardService.getFeaturedBillboards();
        return ResponseEntity.ok(ApiResponse.<List<BillboardDto>>builder()
                .success(true)
                .message("Fetched featured billboards successfully")
                .data(billboards)
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BillboardDto>> getBillboardById(@PathVariable Long id) {
        BillboardDto billboard = billboardService.getBillboardById(id);
        return ResponseEntity.ok(ApiResponse.<BillboardDto>builder()
                .success(true)
                .message("Fetched billboard detail successfully")
                .data(billboard)
                .build());
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<ApiResponse<List<ReviewDto>>> getBillboardReviews(@PathVariable Long id) {
        List<ReviewDto> reviews = reviewService.getReviewsByBillboardId(id);
        return ResponseEntity.ok(ApiResponse.<List<ReviewDto>>builder()
                .success(true)
                .message("Fetched reviews successfully")
                .data(reviews)
                .build());
    }

    @GetMapping("/{id}/booked-slots")
    public ResponseEntity<ApiResponse<List<BookedSlotDto>>> getBookedSlots(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<BookedSlotDto> slots = bookingService.getBookedSlots(id, date);
        return ResponseEntity.ok(ApiResponse.<List<BookedSlotDto>>builder()
                .success(true)
                .message("Fetched booked slots successfully")
                .data(slots)
                .build());
    }
}
