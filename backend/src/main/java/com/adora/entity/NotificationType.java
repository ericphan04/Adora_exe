package com.adora.entity;

/**
 * Types of payment/booking notifications in the system.
 */
public enum NotificationType {
    PAYMENT_SUCCESS,    // Renter: payment confirmed
    PAYMENT_FAILED,     // Renter: payment failed
    BOOKING_PAID,       // Owner: renter has paid for their booking
    BOOKING_ACCEPTED,   // Renter: owner accepted booking (future use)
    BOOKING_REJECTED,   // Renter: owner rejected booking (future use)
}
