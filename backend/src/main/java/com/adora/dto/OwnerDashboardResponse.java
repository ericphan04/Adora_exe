package com.adora.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerDashboardResponse {
    private Integer totalBillboards;
    private Double fillRate;
    private BigDecimal monthlyRevenue;
    private Integer pendingRequests;
    private List<Map<String, Object>> revenueTrend;
    private List<BookingDto> recentBookingRequests;
}
