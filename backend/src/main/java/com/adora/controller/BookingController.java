package com.adora.controller;

import com.adora.dto.ApiResponse;
import com.adora.dto.BookingDto;
import com.adora.dto.CreateBookingRequest;
import com.adora.entity.Role;
import com.adora.security.UserPrincipal;
import com.adora.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // --- RENTER BOOKING ENDPOINTS ---

    @PostMapping("/api/renter/bookings")
    public ResponseEntity<ApiResponse<BookingDto>> createBooking(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateBookingRequest request) {
        BookingDto booking = bookingService.createBooking(request, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.<BookingDto>builder()
                .success(true)
                .message("Booking request created successfully")
                .data(booking)
                .build());
    }

    @GetMapping("/api/renter/bookings")
    public ResponseEntity<ApiResponse<List<BookingDto>>> getRenterBookings(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<BookingDto> bookings = bookingService.getRenterBookings(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.<List<BookingDto>>builder()
                .success(true)
                .message("Fetched renter bookings successfully")
                .data(bookings)
                .build());
    }

    @GetMapping("/api/renter/bookings/{id}")
    public ResponseEntity<ApiResponse<BookingDto>> getRenterBookingById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        BookingDto booking = bookingService.getBookingById(id, userPrincipal.getId(), Role.RENTER);
        return ResponseEntity.ok(ApiResponse.<BookingDto>builder()
                .success(true)
                .message("Fetched booking detail successfully")
                .data(booking)
                .build());
    }

    @PatchMapping("/api/renter/bookings/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingDto>> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        BookingDto booking = bookingService.cancelBooking(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.<BookingDto>builder()
                .success(true)
                .message("Booking cancelled successfully")
                .data(booking)
                .build());
    }

    // --- OWNER BOOKING ENDPOINTS ---

    @GetMapping("/api/owner/bookings")
    public ResponseEntity<ApiResponse<List<BookingDto>>> getOwnerBookings(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<BookingDto> bookings = bookingService.getOwnerBookings(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.<List<BookingDto>>builder()
                .success(true)
                .message("Fetched owner bookings successfully")
                .data(bookings)
                .build());
    }

    @PatchMapping("/api/owner/bookings/{id}/accept")
    public ResponseEntity<ApiResponse<BookingDto>> acceptBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        BookingDto booking = bookingService.acceptBooking(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.<BookingDto>builder()
                .success(true)
                .message("Booking accepted successfully")
                .data(booking)
                .build());
    }

    @PatchMapping("/api/owner/bookings/{id}/reject")
    public ResponseEntity<ApiResponse<BookingDto>> rejectBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        BookingDto booking = bookingService.rejectBooking(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.<BookingDto>builder()
                .success(true)
                .message("Booking rejected successfully")
                .data(booking)
                .build());
    }

    // --- ADMIN BOOKING ENDPOINTS ---

    @GetMapping("/api/admin/bookings")
    public ResponseEntity<ApiResponse<List<BookingDto>>> getAllBookings() {
        List<BookingDto> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(ApiResponse.<List<BookingDto>>builder()
                .success(true)
                .message("Fetched all bookings successfully")
                .data(bookings)
                .build());
    }

    @GetMapping("/api/admin/bookings/{id}")
    public ResponseEntity<ApiResponse<BookingDto>> getAdminBookingById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        BookingDto booking = bookingService.getBookingById(id, userPrincipal.getId(), Role.ADMIN);
        return ResponseEntity.ok(ApiResponse.<BookingDto>builder()
                .success(true)
                .message("Fetched booking detail successfully")
                .data(booking)
                .build());
    }
}
