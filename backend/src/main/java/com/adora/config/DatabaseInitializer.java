package com.adora.config;

import com.adora.entity.*;
import com.adora.repository.*;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DatabaseInitializer implements ApplicationRunner {

    private final BillboardCategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final BillboardRepository billboardRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final ReviewRepository reviewRepository;
    private final ReportRepository reportRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseInitializer(
            BillboardCategoryRepository categoryRepository,
            UserRepository userRepository,
            BillboardRepository billboardRepository,
            BookingRepository bookingRepository,
            PaymentRepository paymentRepository,
            ReviewRepository reviewRepository,
            ReportRepository reportRepository,
            ConversationRepository conversationRepository,
            MessageRepository messageRepository,
            PasswordEncoder passwordEncoder) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.billboardRepository = billboardRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.reviewRepository = reviewRepository;
        this.reportRepository = reportRepository;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        // 1. Seed Categories
        if (categoryRepository.count() == 0) {
            List<BillboardCategory> defaultCategories = List.of(
                    BillboardCategory.builder()
                            .name("Highways & Expressways")
                            .description("High-visibility digital billboards located along major highways and expressways.")
                            .build(),
                    BillboardCategory.builder()
                            .name("Shopping Malls & Retail")
                            .description("Screens located inside or outside popular shopping centers, retail stores, and dining areas.")
                            .build(),
                    BillboardCategory.builder()
                            .name("Building Facades & Landmarks")
                            .description("Giant LED screens mounted on iconic building walls or historical landmarks.")
                            .build(),
                    BillboardCategory.builder()
                            .name("Transit Hubs & Airports")
                            .description("Screens at subway stations, bus terminals, train stations, and airports capturing daily travelers.")
                            .build(),
                    BillboardCategory.builder()
                            .name("Street Furniture & Bus Shelters")
                            .description("Smaller digital screens at bus shelters, kiosks, and street corridors for pedestrian targeting.")
                            .build()
            );
            categoryRepository.saveAll(defaultCategories);
        }

        // 2. Ensure Seed Users exist (Admin, Owner, Renter)
        User admin = userRepository.findByEmail("admin@adora.com").orElse(null);
        if (admin == null) {
            admin = User.builder()
                    .fullName("Lê Văn Admin")
                    .email("admin@adora.com")
                    .phone("0909090909")
                    .passwordHash(passwordEncoder.encode("password"))
                    .role(Role.ADMIN)
                    .status(UserStatus.ACTIVE)
                    .avatarUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100")
                    .build();
            admin = userRepository.save(admin);
        }

        User owner = userRepository.findByEmail("owner@adora.com").orElse(null);
        if (owner == null) {
            owner = User.builder()
                    .fullName("Trần Văn Owner")
                    .email("owner@adora.com")
                    .phone("0123456789")
                    .passwordHash(passwordEncoder.encode("password"))
                    .role(Role.OWNER)
                    .status(UserStatus.ACTIVE)
                    .companyName("LED Media")
                    .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100")
                    .build();
            owner = userRepository.save(owner);
        }

        User renter = userRepository.findByEmail("renter@adora.com").orElse(null);
        if (renter == null) {
            renter = User.builder()
                    .fullName("Nguyễn Văn Renter")
                    .email("renter@adora.com")
                    .phone("0987654321")
                    .passwordHash(passwordEncoder.encode("password"))
                    .role(Role.RENTER)
                    .status(UserStatus.ACTIVE)
                    .companyName("Ad Agency")
                    .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100")
                    .build();
            renter = userRepository.save(renter);
        }

        // 3. Seed Billboards
        if (billboardRepository.count() == 0) {
            List<BillboardCategory> categories = categoryRepository.findAll();
            BillboardCategory highwayCat = categories.stream()
                    .filter(c -> c.getName().contains("Highways"))
                    .findFirst()
                    .orElse(categories.get(0));
            BillboardCategory buildingCat = categories.stream()
                    .filter(c -> c.getName().contains("Building"))
                    .findFirst()
                    .orElse(categories.get(0));
            BillboardCategory streetCat = categories.stream()
                    .filter(c -> c.getName().contains("Street"))
                    .findFirst()
                    .orElse(categories.get(0));
            BillboardCategory mallCat = categories.stream()
                    .filter(c -> c.getName().contains("Shopping"))
                    .findFirst()
                    .orElse(categories.get(0));

            Billboard b1 = Billboard.builder()
                    .owner(owner)
                    .category(highwayCat)
                    .title("Cầu Rồng LED")
                    .description("Bảng quảng cáo vị trí đắc địa tại Cầu Rồng Đà Nẵng, lưu lượng giao thông cực kỳ đông đúc cả ngày lẫn đêm.")
                    .address("Đường 2/9, Hải Châu")
                    .city("Đà Nẵng")
                    .district("Hải Châu")
                    .latitude(16.0614)
                    .longitude(108.2275)
                    .demoVideoUrl("https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4")
                    .width(14.0)
                    .height(6.0)
                    .resolution("1920x1080")
                    .brightness("6500 nits")
                    .refreshRate("3840Hz")
                    .screenType("Outdoor LED")
                    .operatingHours("16h/ngày")
                    .pricePerDay(BigDecimal.valueOf(3000000))
                    .pricePerMonth(BigDecimal.valueOf(85000000))
                    .locationSurcharge(BigDecimal.valueOf(1.1))
                    .status(BillboardStatus.APPROVED)
                    .dailyViews(120000)
                    .isFeatured(true)
                    .build();
            b1.addImage(BillboardImage.builder().imageUrl("https://images.unsplash.com/photo-1585504303098-9785dc784742?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080").isThumbnail(true).build());
            b1.addFeature(BillboardFeature.builder().name("Độ sáng cao").build());
            b1.addFeature(BillboardFeature.builder().name("Chống nước IP65").build());

            Billboard b2 = Billboard.builder()
                    .owner(owner)
                    .category(buildingCat)
                    .title("Bạch Đằng Digital")
                    .description("Bảng quảng cáo ven sông Bạch Đằng hướng nhìn trực diện sông Hàn, phù hợp các chiến dịch thương hiệu cao cấp.")
                    .address("Đường Bạch Đằng, Sơn Trà")
                    .city("Đà Nẵng")
                    .district("Sơn Trà")
                    .latitude(16.0708)
                    .longitude(108.2483)
                    .demoVideoUrl("https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4")
                    .width(10.0)
                    .height(4.0)
                    .resolution("1920x1080")
                    .brightness("6000 nits")
                    .refreshRate("3840Hz")
                    .screenType("Outdoor LED")
                    .operatingHours("16h/ngày")
                    .pricePerDay(BigDecimal.valueOf(2000000))
                    .pricePerMonth(BigDecimal.valueOf(55000000))
                    .locationSurcharge(BigDecimal.valueOf(1.05))
                    .status(BillboardStatus.APPROVED)
                    .dailyViews(80000)
                    .isFeatured(true)
                    .build();
            b2.addImage(BillboardImage.builder().imageUrl("https://images.unsplash.com/photo-1745725427643-8994370391e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080").isThumbnail(true).build());
            b2.addFeature(BillboardFeature.builder().name("Góc nhìn rộng").build());

            Billboard b3 = Billboard.builder()
                    .owner(owner)
                    .category(streetCat)
                    .title("Nguyễn Văn Linh Screen")
                    .description("Nằm ngay ngã ba Nguyễn Văn Linh và Nguyễn Tri Phương, đón đầu luồng giao thông từ sân bay vào trung tâm thành phố.")
                    .address("Đường Nguyễn Văn Linh, Thanh Khê")
                    .city("Đà Nẵng")
                    .district("Thanh Khê")
                    .latitude(16.0545)
                    .longitude(108.2020)
                    .width(12.0)
                    .height(5.0)
                    .resolution("1280x720")
                    .brightness("5000 nits")
                    .refreshRate("3840Hz")
                    .screenType("Outdoor LED")
                    .operatingHours("16h/ngày")
                    .pricePerDay(BigDecimal.valueOf(2500000))
                    .pricePerMonth(BigDecimal.valueOf(68000000))
                    .locationSurcharge(BigDecimal.valueOf(1.0))
                    .status(BillboardStatus.APPROVED)
                    .dailyViews(110000)
                    .isFeatured(true)
                    .build();
            b3.addImage(BillboardImage.builder().imageUrl("https://images.unsplash.com/photo-1765908310161-1005cf85586d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080").isThumbnail(true).build());
            b3.addFeature(BillboardFeature.builder().name("Camera đo traffic").build());

            Billboard b4 = Billboard.builder()
                    .owner(owner)
                    .category(mallCat)
                    .title("Vincom Plaza LED")
                    .description("Màn hình LED lớn ốp tường Vincom Plaza Hải Châu, tiếp cận hàng ngàn lượt mua sắm và vui chơi giải trí hàng ngày.")
                    .address("Ngô Quyền, An Hải Bắc, Hải Châu")
                    .city("Đà Nẵng")
                    .district("Hải Châu")
                    .latitude(16.0678)
                    .longitude(108.2208)
                    .demoVideoUrl("https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4")
                    .width(16.0)
                    .height(8.0)
                    .resolution("1920x1080")
                    .brightness("5500 nits")
                    .refreshRate("3840Hz")
                    .screenType("Building LED")
                    .operatingHours("18h/ngày")
                    .pricePerDay(BigDecimal.valueOf(4000000))
                    .pricePerMonth(BigDecimal.valueOf(120000000))
                    .locationSurcharge(BigDecimal.valueOf(1.15))
                    .status(BillboardStatus.PENDING)
                    .dailyViews(150000)
                    .isFeatured(false)
                    .build();
            b4.addImage(BillboardImage.builder().imageUrl("https://images.unsplash.com/photo-1766324488354-a189b706d3e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080").isThumbnail(true).build());

            billboardRepository.saveAll(List.of(b1, b2, b3, b4));
        }

        // 4. Seed Bookings
        if (bookingRepository.count() == 0) {
            List<Billboard> billboards = billboardRepository.findAll();
            Billboard b1 = billboards.stream().filter(b -> b.getTitle().contains("Cầu Rồng")).findFirst().orElse(billboards.get(0));
            Billboard b2 = billboards.stream().filter(b -> b.getTitle().contains("Bạch Đằng")).findFirst().orElse(billboards.get(0));
            Billboard b3 = billboards.stream().filter(b -> b.getTitle().contains("Nguyễn Văn Linh")).findFirst().orElse(billboards.get(0));

            Booking booking1 = Booking.builder()
                    .renter(renter)
                    .billboard(b1)
                    .startDate(LocalDate.of(2026, 3, 1))
                    .endDate(LocalDate.of(2026, 3, 31))
                    .totalPrice(BigDecimal.valueOf(85000000))
                    .serviceFee(BigDecimal.valueOf(4250000))
                    .locationSurcharge(BigDecimal.valueOf(10000000))
                    .finalAmount(BigDecimal.valueOf(99250000))
                    .status(BookingStatus.PAID)
                    .note("Chiến dịch quảng bá thương hiệu Cầu Rồng")
                    .build();

            Booking booking2 = Booking.builder()
                    .renter(renter)
                    .billboard(b2)
                    .startDate(LocalDate.of(2026, 3, 15))
                    .endDate(LocalDate.of(2026, 4, 15))
                    .totalPrice(BigDecimal.valueOf(55000000))
                    .serviceFee(BigDecimal.valueOf(2750000))
                    .locationSurcharge(BigDecimal.valueOf(5000000))
                    .finalAmount(BigDecimal.valueOf(62750000))
                    .status(BookingStatus.PENDING)
                    .note("Chiến dịch quảng cáo thời trang hè")
                    .build();

            Booking booking3 = Booking.builder()
                    .renter(renter)
                    .billboard(b3)
                    .startDate(LocalDate.of(2026, 4, 1))
                    .endDate(LocalDate.of(2026, 4, 30))
                    .totalPrice(BigDecimal.valueOf(68000000))
                    .serviceFee(BigDecimal.valueOf(3400000))
                    .locationSurcharge(BigDecimal.valueOf(8000000))
                    .finalAmount(BigDecimal.valueOf(79400000))
                    .status(BookingStatus.ACCEPTED)
                    .note("Chiến dịch ra mắt dòng sản phẩm mới")
                    .build();

            bookingRepository.saveAll(List.of(booking1, booking2, booking3));

            // Set availability dates for booking 1
            for (LocalDate date = booking1.getStartDate(); !date.isAfter(booking1.getEndDate()); date = date.plusDays(1)) {
                b1.addAvailability(BillboardAvailability.builder()
                        .availableDate(date)
                        .status(AvailabilityStatus.BOOKED)
                        .build());
            }
            billboardRepository.save(b1);
        }

        // 5. Seed Payments
        if (paymentRepository.count() == 0) {
            List<Booking> bookings = bookingRepository.findAll();
            Booking booking1 = bookings.stream().filter(b -> b.getStatus() == BookingStatus.PAID).findFirst().orElse(null);
            if (booking1 != null) {
                Payment payment1 = Payment.builder()
                        .booking(booking1)
                        .amount(booking1.getFinalAmount())
                        .paymentMethod("VNPAY")
                        .paymentStatus(PaymentStatus.SUCCESS)
                        .transactionCode("VNPAY-832103")
                        .platformCommission(booking1.getServiceFee())
                        .ownerRevenue(booking1.getFinalAmount().subtract(booking1.getServiceFee()))
                        .paidAt(LocalDateTime.now().minusDays(15))
                        .build();
                paymentRepository.save(payment1);
            }
        }

        // 6. Seed Reviews
        if (reviewRepository.count() == 0) {
            List<Booking> bookings = bookingRepository.findAll();
            Booking booking1 = bookings.stream().filter(b -> b.getStatus() == BookingStatus.PAID).findFirst().orElse(null);
            if (booking1 != null) {
                Review review1 = Review.builder()
                        .booking(booking1)
                        .renter(booking1.getRenter())
                        .billboard(booking1.getBillboard())
                        .rating(5)
                        .comment("Vị trí tuyệt vời với lưu lượng giao thông rất cao. Chất lượng hiển thị của màn hình LED xuất sắc, đúng như cam kết ban đầu.")
                        .build();
                reviewRepository.save(review1);
            }
        }

        // 7. Seed Dispute Reports
        if (reportRepository.count() == 0) {
            List<Billboard> billboards = billboardRepository.findAll();
            if (!billboards.isEmpty()) {
                Billboard b1 = billboards.get(0);
                Report report1 = Report.builder()
                        .reporter(renter)
                        .targetType("BILLBOARD")
                        .targetId(b1.getId())
                        .reason("Màn hình LED bị lỗi hiển thị sọc ngang trong ngày 10-11/03, gây ảnh hưởng đến hiệu quả hiển thị của banner chiến dịch.")
                        .status(ReportStatus.PENDING)
                        .build();
                reportRepository.save(report1);
            }
        }

        // 8. Seed sample conversations (renter ↔ owner)
        if (conversationRepository.count() == 0) {
            List<Booking> bookings = bookingRepository.findAll();
            if (!bookings.isEmpty()) {
                Booking bk = bookings.get(0);
                LocalDateTime now = LocalDateTime.now();
                Conversation conv = conversationRepository.save(Conversation.builder()
                        .renter(renter)
                        .owner(owner)
                        .booking(bk)
                        .billboard(bk.getBillboard())
                        .renterLastReadAt(now.minusHours(1))
                        .ownerLastReadAt(now)
                        .adminLastReadAt(now)
                        .build());

                Message m1 = messageRepository.save(Message.builder()
                        .conversation(conv)
                        .sender(renter)
                        .content("Chào anh, em muốn hỏi thêm về lịch hiển thị bảng " + bk.getBillboard().getTitle() + ".")
                        .build());
                Message m2 = messageRepository.save(Message.builder()
                        .conversation(conv)
                        .sender(owner)
                        .content("Chào bạn, bên mình còn khung giờ tối 18h–22h. Bạn cần thêm thông tin gì không?")
                        .build());

                conv.setLastMessagePreview(m2.getContent());
                conv.setLastMessageAt(m2.getCreatedAt());
                conversationRepository.save(conv);
            }
        }

        // 9. Backfill map coordinates & demo videos for existing billboards
        patchBillboardMapData();
    }

    private void patchBillboardMapData() {
        record MapPatch(double lat, double lng, String videoUrl) {}
        java.util.Map<String, MapPatch> patches = java.util.Map.of(
                "Cầu Rồng", new MapPatch(16.0614, 108.2275, "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"),
                "Bạch Đằng", new MapPatch(16.0708, 108.2483, "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"),
                "Nguyễn Văn Linh", new MapPatch(16.0545, 108.2020, null),
                "Vincom", new MapPatch(16.0678, 108.2208, "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4")
        );

        for (Billboard b : billboardRepository.findAll()) {
            boolean changed = false;
            if (b.getLatitude() == null || b.getLongitude() == null) {
                for (var entry : patches.entrySet()) {
                    if (b.getTitle().contains(entry.getKey())) {
                        b.setLatitude(entry.getValue().lat());
                        b.setLongitude(entry.getValue().lng());
                        if (b.getDemoVideoUrl() == null && entry.getValue().videoUrl() != null) {
                            b.setDemoVideoUrl(entry.getValue().videoUrl());
                        }
                        changed = true;
                        break;
                    }
                }
            }
            if (b.getDemoVideoUrl() == null) {
                for (var entry : patches.entrySet()) {
                    if (b.getTitle().contains(entry.getKey()) && entry.getValue().videoUrl() != null) {
                        b.setDemoVideoUrl(entry.getValue().videoUrl());
                        changed = true;
                        break;
                    }
                }
            }
            if (changed) {
                billboardRepository.save(b);
            }
        }
    }
}
