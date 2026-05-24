package com.adora.controller;

import com.adora.dto.ApiResponse;
import com.adora.dto.CreateReviewRequest;
import com.adora.dto.ReviewDto;
import com.adora.security.UserPrincipal;
import com.adora.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/api/renter/reviews")
    public ResponseEntity<ApiResponse<ReviewDto>> createReview(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateReviewRequest request) {
        ReviewDto review = reviewService.createReview(request, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.<ReviewDto>builder()
                .success(true)
                .message("Review created successfully")
                .data(review)
                .build());
    }
}
