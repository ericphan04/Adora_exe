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
public class AdminDashboardResponse {
    private Integer totalUsers;
    private Integer totalBillboards;
    private BigDecimal totalGMV;
    private BigDecimal commissionRevenue;
    private Integer pendingBillboards;
    private Integer pendingReports;
    private List<Map<String, Object>> gmvChart;
    private List<Map<String, Object>> bookingChart;
}
