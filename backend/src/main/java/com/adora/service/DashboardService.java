package com.adora.service;

import com.adora.dto.*;
import com.adora.entity.*;
import com.adora.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final UserRepository userRepository;
    private final BillboardRepository billboardRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final ReportRepository reportRepository;
    private final BookingService bookingService;
    private final BillboardService billboardService;
    private final BillboardAvailabilityRepository availabilityRepository;

    public DashboardService(UserRepository userRepository,
                            BillboardRepository billboardRepository,
                            BookingRepository bookingRepository,
                            PaymentRepository paymentRepository,
                            ReportRepository reportRepository,
                            BookingService bookingService,
                            BillboardService billboardService,
                            BillboardAvailabilityRepository availabilityRepository) {
        this.userRepository = userRepository;
        this.billboardRepository = billboardRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.reportRepository = reportRepository;
        this.bookingService = bookingService;
        this.billboardService = billboardService;
        this.availabilityRepository = availabilityRepository;
    }

    public RenterDashboardResponse getRenterDashboard(Long renterId) {
        long activeCampaigns = bookingRepository.countByRenterIdAndStatusIn(
                renterId, List.of(BookingStatus.PAID, BookingStatus.RUNNING));

        BigDecimal totalSpending = paymentRepository.sumSpendingByRenterId(renterId);

        List<BookingDto> upcomingBookings = bookingRepository.findByRenterIdAndStatusInAndStartDateAfter(
                renterId, List.of(BookingStatus.ACCEPTED, BookingStatus.PAID), LocalDate.now()).stream()
                .map(bookingService::mapToDto)
                .collect(Collectors.toList());

        // For savedBillboards, fallback to returning 2 featured billboards
        List<BillboardDto> savedBillboards = billboardRepository.findFirst2ByStatusAndIsFeatured(BillboardStatus.APPROVED, true).stream()
                .map(billboardService::mapToLightDto)
                .collect(Collectors.toList());

        List<BookingDto> recentBookings = bookingRepository.findTop5ByRenterIdOrderByCreatedAtDesc(renterId).stream()
                .map(bookingService::mapToDto)
                .collect(Collectors.toList());

        // Construct mock campaign performance data for the frontend charts
        List<Map<String, Object>> performance = List.of(
                Map.of("month", "Jan", "views", 12000, "clicks", 450, "spent", 250),
                Map.of("month", "Feb", "views", 19000, "clicks", 800, "spent", 400),
                Map.of("month", "Mar", "views", 32000, "clicks", 1200, "spent", 650),
                Map.of("month", "Apr", "views", 54000, "clicks", 2100, "spent", 1200),
                Map.of("month", "May", "views", 78000, "clicks", 3400, "spent", 2100)
        );

        return RenterDashboardResponse.builder()
                .activeCampaigns((int) activeCampaigns)
                .totalSpending(totalSpending)
                .upcomingBookings(upcomingBookings)
                .savedBillboards(savedBillboards)
                .recentBookings(recentBookings)
                .campaignPerformance(performance)
                .build();
    }

    public OwnerDashboardResponse getOwnerDashboard(Long ownerId) {
        int totalBillboards = (int) billboardRepository.countByOwnerId(ownerId);

        // Calculate fill rate (ratio of booked slots in calendar) via optimized DB count queries
        long totalSlots = availabilityRepository.countTotalSlotsByOwnerId(ownerId);
        long bookedSlots = availabilityRepository.countBookedSlotsByOwnerId(ownerId);
        double fillRate = totalSlots > 0 ? ((double) bookedSlots / totalSlots) * 100 : 0.0;

        BigDecimal monthlyRevenue = paymentRepository.sumRevenueByOwnerId(ownerId);

        long pendingRequests = bookingRepository.countByBillboardOwnerIdAndStatus(ownerId, BookingStatus.PENDING);

        List<BookingDto> recentBookingRequests = bookingRepository.findTop5ByBillboardOwnerIdAndStatusOrderByCreatedAtDesc(ownerId, BookingStatus.PENDING).stream()
                .map(bookingService::mapToDto)
                .collect(Collectors.toList());

        // Construct mock revenue trend for owner
        List<Map<String, Object>> trend = List.of(
                Map.of("month", "Jan", "revenue", monthlyRevenue.multiply(BigDecimal.valueOf(0.6)).setScale(2, BigDecimal.ROUND_HALF_UP)),
                Map.of("month", "Feb", "revenue", monthlyRevenue.multiply(BigDecimal.valueOf(0.8)).setScale(2, BigDecimal.ROUND_HALF_UP)),
                Map.of("month", "Mar", "revenue", monthlyRevenue)
        );

        return OwnerDashboardResponse.builder()
                .totalBillboards(totalBillboards)
                .fillRate(fillRate)
                .monthlyRevenue(monthlyRevenue)
                .pendingRequests((int) pendingRequests)
                .revenueTrend(trend)
                .recentBookingRequests(recentBookingRequests)
                .build();
    }

    public AdminDashboardResponse getAdminDashboard() {
        int totalUsers = (int) userRepository.count();
        int totalBillboards = (int) billboardRepository.count();

        BigDecimal totalGMV = paymentRepository.sumAmountByStatus(PaymentStatus.SUCCESS);
        BigDecimal commissionRevenue = paymentRepository.sumCommissionByStatus(PaymentStatus.SUCCESS);

        int pendingBillboards = (int) billboardRepository.countByStatus(BillboardStatus.PENDING);
        int pendingReports = (int) reportRepository.countByStatus(ReportStatus.PENDING);

        // Construct mock charts for admin GMV and booking counts
        List<Map<String, Object>> gmvChart = List.of(
                Map.of("month", "Jan", "gmv", totalGMV.multiply(BigDecimal.valueOf(0.5)).setScale(2, BigDecimal.ROUND_HALF_UP)),
                Map.of("month", "Feb", "gmv", totalGMV.multiply(BigDecimal.valueOf(0.8)).setScale(2, BigDecimal.ROUND_HALF_UP)),
                Map.of("month", "Mar", "gmv", totalGMV)
        );

        List<Map<String, Object>> bookingChart = List.of(
                Map.of("month", "Jan", "bookings", 12),
                Map.of("month", "Feb", "bookings", 24),
                Map.of("month", "Mar", "bookings", 38)
        );

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalBillboards(totalBillboards)
                .totalGMV(totalGMV)
                .commissionRevenue(commissionRevenue)
                .pendingBillboards(pendingBillboards)
                .pendingReports(pendingReports)
                .gmvChart(gmvChart)
                .bookingChart(bookingChart)
                .build();
    }
}
