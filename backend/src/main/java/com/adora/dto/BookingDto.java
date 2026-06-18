package com.adora.dto;

import com.adora.entity.BookingStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDto {
    private Long id;
    private UserDto renter;
    private BillboardDto billboard;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private BigDecimal totalPrice;
    private BigDecimal serviceFee;
    private BigDecimal locationSurcharge;
    private BigDecimal finalAmount;
    private BookingStatus status;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
