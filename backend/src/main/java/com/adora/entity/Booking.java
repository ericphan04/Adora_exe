package com.adora.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "renter_id", nullable = false)
    private User renter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "billboard_id", nullable = false)
    private Billboard billboard;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "total_price", nullable = false)
    private BigDecimal totalPrice;

    @Column(name = "service_fee", nullable = false)
    private BigDecimal serviceFee;

    @Column(name = "location_surcharge")
    private BigDecimal locationSurcharge;

    @Column(name = "final_amount", nullable = false)
    private BigDecimal finalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "spot_package")
    private String spotPackage;

    @Column(name = "premium_surcharge")
    private BigDecimal premiumSurcharge;


    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
