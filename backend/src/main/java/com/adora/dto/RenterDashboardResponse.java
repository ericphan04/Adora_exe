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
public class RenterDashboardResponse {
    private Integer activeCampaigns;
    private BigDecimal totalSpending;
    private List<BookingDto> upcomingBookings;
    private List<BillboardDto> savedBillboards;
    private List<BookingDto> recentBookings;
    private List<Map<String, Object>> campaignPerformance;
}
