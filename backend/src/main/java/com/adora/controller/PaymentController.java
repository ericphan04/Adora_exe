package com.adora.controller;

import com.adora.dto.ApiResponse;
import com.adora.dto.CreatePaymentRequest;
import com.adora.dto.PaymentDto;
import com.adora.entity.Role;
import com.adora.security.UserPrincipal;
import com.adora.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.List;
import java.util.Map;

@RestController
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/api/renter/payments")
    public ResponseEntity<ApiResponse<String>> createPaymentUrl(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreatePaymentRequest request,
            HttpServletRequest httpServletRequest) {
        String paymentUrl = paymentService.createPaymentUrl(request, userPrincipal.getId(), httpServletRequest);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("Payment redirect URL generated successfully")
                .data(paymentUrl)
                .build());
    }

    @GetMapping("/api/renter/payments")
    public ResponseEntity<ApiResponse<List<PaymentDto>>> getRenterPayments(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<PaymentDto> payments = paymentService.getRenterPayments(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.<List<PaymentDto>>builder()
                .success(true)
                .message("Fetched renter payments successfully")
                .data(payments)
                .build());
    }

    @GetMapping("/api/renter/payments/{id}")
    public ResponseEntity<ApiResponse<PaymentDto>> getRenterPaymentById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        PaymentDto payment = paymentService.getPaymentById(id, userPrincipal.getId(), Role.RENTER);
        return ResponseEntity.ok(ApiResponse.<PaymentDto>builder()
                .success(true)
                .message("Fetched payment details successfully")
                .data(payment)
                .build());
    }

    @GetMapping("/api/admin/payments")
    public ResponseEntity<ApiResponse<List<PaymentDto>>> getAllPayments() {
        List<PaymentDto> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(ApiResponse.<List<PaymentDto>>builder()
                .success(true)
                .message("Fetched all payments successfully")
                .data(payments)
                .build());
    }

    // Public Callback Endpoint called by VNPay
    @GetMapping("/api/payments/callback")
    public RedirectView handleVnPayCallback(@RequestParam Map<String, String> params) {
        try {
            PaymentDto payment = paymentService.processCallback(params);
            // Redirect user back to frontend checkout status page
            return new RedirectView("http://localhost:5173/payment/status?success=true&bookingId=" + payment.getBookingId());
        } catch (Exception e) {
            // Redirect with success=false if signature or process fails
            return new RedirectView("http://localhost:5173/payment/status?success=false&error=" + e.getMessage());
        }
    }
}
