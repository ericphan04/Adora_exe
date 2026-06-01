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

        // For savedBillboards, return an empty list as they are managed via client-side LocalStorage
        List<BillboardDto> savedBillboards = new ArrayList<>();

        List<BookingDto> recentBookings = bookingRepository.findTop5ByRenterIdOrderByCreatedAtDesc(renterId).stream()
                .map(bookingService::mapToDto)
                .collect(Collectors.toList());

        // Construct campaign performance data dynamically using renter's bookings
        List<Booking> bookings = bookingRepository.findByRenterId(renterId);
        List<Map<String, Object>> performance = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int i = 4; i >= 0; i--) {
            LocalDate monthStart = today.minusMonths(i).withDayOfMonth(1);
            LocalDate monthEnd = monthStart.withDayOfMonth(monthStart.lengthOfMonth());
            String monthLabel = monthStart.getMonth().getDisplayName(java.time.format.TextStyle.SHORT, Locale.ENGLISH);

            long views = 0;
            long clicks = 0;
            BigDecimal spent = BigDecimal.ZERO;

            for (Booking booking : bookings) {
                if (booking.getStatus() == BookingStatus.PAID || 
                    booking.getStatus() == BookingStatus.RUNNING || 
                    booking.getStatus() == BookingStatus.COMPLETED) {

                    LocalDate start = booking.getStartDate();
                    LocalDate end = booking.getEndDate();

                    // Check overlap between [start, end] and [monthStart, monthEnd]
                    LocalDate overlapStart = start.isAfter(monthStart) ? start : monthStart;
                    LocalDate overlapEnd = end.isBefore(monthEnd) ? end : monthEnd;

                    if (!overlapStart.isAfter(overlapEnd)) {
                        // There is an overlap! Calculate number of active days in this month
                        long days = java.time.temporal.ChronoUnit.DAYS.between(overlapStart, overlapEnd) + 1;
                        long dailyViews = booking.getBillboard() != null ? booking.getBillboard().getDailyViews() : 1000;
                        views += dailyViews * days;

                        // Prorate spent (finalAmount) based on total days
                        long totalDays = java.time.temporal.ChronoUnit.DAYS.between(start, end) + 1;
                        if (totalDays > 0) {
                            BigDecimal dailyRate = booking.getFinalAmount().divide(BigDecimal.valueOf(totalDays), 2, java.math.RoundingMode.HALF_UP);
                            spent = spent.add(dailyRate.multiply(BigDecimal.valueOf(days)));
                        }
                    }
                }
            }
            clicks = Math.round(views * 0.02); // Simulate a 2% CTR (click-through rate)

            Map<String, Object> dataPoint = new HashMap<>();
            dataPoint.put("month", monthLabel);
            dataPoint.put("views", views);
            dataPoint.put("clicks", clicks);
            dataPoint.put("spent", spent);
            performance.add(dataPoint);
        }

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
