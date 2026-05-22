package com.adora.dto;

import com.adora.entity.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDto {
    private Long id;
    private Long bookingId;
    private BigDecimal amount;
    private String paymentMethod;
    private PaymentStatus paymentStatus;
    private String transactionCode;
    private BigDecimal platformCommission;
    private BigDecimal ownerRevenue;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
}
