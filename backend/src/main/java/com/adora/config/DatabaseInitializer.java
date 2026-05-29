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

            Billboard b5 = Billboard.builder()
                    .owner(owner)
                    .category(highwayCat)
                    .title("Mỹ Khê Beach LED")
                    .description("Màn hình LED ven biển Mỹ Khê, tiếp cận du khách quốc tế và cộng đồng resort cao cấp.")
                    .address("Võ Nguyên Giáp, Ngũ Hành Sơn")
                    .city("Đà Nẵng")
                    .district("Ngũ Hành Sơn")
                    .latitude(16.003)
                    .longitude(108.263)
                    .width(8.0)
                    .height(3.0)
                    .resolution("1920x1080")
                    .brightness("5500 nits")
                    .refreshRate("3840Hz")
                    .screenType("Outdoor LED")
                    .operatingHours("14h/ngày")
                    .pricePerDay(BigDecimal.valueOf(1400000))
                    .pricePerMonth(BigDecimal.valueOf(42000000))
                    .locationSurcharge(BigDecimal.valueOf(1.0))
                    .status(BillboardStatus.APPROVED)
                    .dailyViews(65000)
                    .isFeatured(false)
                    .build();
            b5.addImage(BillboardImage.builder().imageUrl("https://images.unsplash.com/photo-1766324488354-a189b706d3e2?w=1080").isThumbnail(true).build());

            Billboard b6 = Billboard.builder()
                    .owner(owner)
                    .category(streetCat)
                    .title("01 Trần Phú, Hải Châu")
                    .description("Bảng quảng cáo LED ngoài trời nằm trên đường Trần Phú - một trong những trục đường chính sầm uất nhất trung tâm Hải Châu.")
                    .address("01 Trần Phú, Hải Châu")
                    .city("Đà Nẵng")
                    .district("Hải Châu")
                    .latitude(16.0805)
                    .longitude(108.2230)
                    .width(10.0)
                    .height(4.0)
                    .resolution("1920x1080")
                    .brightness("6000 nits")
                    .refreshRate("3840Hz")
                    .screenType("Outdoor LED")
                    .operatingHours("16h/ngày")
                    .pricePerDay(BigDecimal.valueOf(1750000))
                    .pricePerMonth(BigDecimal.valueOf(52000000))
                    .locationSurcharge(BigDecimal.valueOf(1.05))
                    .status(BillboardStatus.APPROVED)
                    .dailyViews(75000)
                    .isFeatured(false)
                    .build();
            b6.addImage(BillboardImage.builder().imageUrl("https://images.unsplash.com/photo-1768812785179-ab5add1e2e1c?w=1080").isThumbnail(true).build());

            Billboard b7 = Billboard.builder()
                    .owner(owner)
                    .category(streetCat)
                    .title("Hàn River Digital")
                    .description("Bảng quảng cáo Led kỹ thuật số cao cấp ngay khu vực Cầu Sông Hàn, thu hút trọn vẹn luồng giao thông qua lại giữa quận Hải Châu và Sơn Trà.")
                    .address("Đường Bạch Đằng, Hải Châu")
                    .city("Đà Nẵng")
                    .district("Hải Châu")
                    .latitude(16.0720)
                    .longitude(108.2268)
                    .width(12.0)
                    .height(6.0)
                    .resolution("1920x1080")
                    .brightness("6500 nits")
                    .refreshRate("3840Hz")
                    .screenType("Outdoor LED")
                    .operatingHours("16h/ngày")
                    .pricePerDay(BigDecimal.valueOf(2600000))
                    .pricePerMonth(BigDecimal.valueOf(78000000))
                    .locationSurcharge(BigDecimal.valueOf(1.1))
                    .status(BillboardStatus.APPROVED)
                    .dailyViews(120000)
                    .isFeatured(false)
                    .build();
            b7.addImage(BillboardImage.builder().imageUrl("https://images.unsplash.com/photo-1770259406469-b83c307b2dca?w=1080").isThumbnail(true).build());

            Billboard b8 = Billboard.builder()
                    .owner(owner)
                    .category(streetCat)
                    .title("Liên Chiểu Gateway")
                    .description("Bảng quảng cáo đón đầu tại cửa ngõ phía Bắc thành phố, trục đường chính Tôn Đức Thắng tiếp cận lượng lớn xe khách và sinh viên các trường đại học.")
                    .address("Đường Tôn Đức Thắng, Hòa Minh, Liên Chiểu")
                    .city("Đà Nẵng")
                    .district("Liên Chiểu")
                    .latitude(16.0690)
                    .longitude(108.1620)
                    .width(8.0)
                    .height(4.0)
                    .resolution("1280x720")
                    .brightness("5000 nits")
                    .refreshRate("3840Hz")
                    .screenType("Outdoor LED")
                    .operatingHours("16h/ngày")
                    .pricePerDay(BigDecimal.valueOf(1300000))
                    .pricePerMonth(BigDecimal.valueOf(38000000))
                    .locationSurcharge(BigDecimal.valueOf(1.0))
                    .status(BillboardStatus.APPROVED)
                    .dailyViews(50000)
                    .isFeatured(false)
                    .build();
            b8.addImage(BillboardImage.builder().imageUrl("https://images.unsplash.com/photo-1585504303098-9785dc784742?w=1080").isThumbnail(true).build());

            Billboard b9 = Billboard.builder()
                    .owner(owner)
                    .category(streetCat)
                    .title("Cẩm Lệ Center LED")
                    .description("Tọa lạc tại trung tâm quận Cẩm Lệ, tiếp cận luồng giao thông chính qua các nút giao lớn kết nối các khu đô thị mới.")
                    .address("Đường Ông Ích Đường, Khuê Trung, Cẩm Lệ")
                    .city("Đà Nẵng")
                    .district("Cẩm Lệ")
                    .latitude(16.0210)
                    .longitude(108.2030)
                    .width(10.0)
                    .height(5.0)
                    .resolution("1280x720")
                    .brightness("5000 nits")
                    .refreshRate("3840Hz")
                    .screenType("Outdoor LED")
                    .operatingHours("16h/ngày")
                    .pricePerDay(BigDecimal.valueOf(1500000))
                    .pricePerMonth(BigDecimal.valueOf(45000000))
                    .locationSurcharge(BigDecimal.valueOf(1.0))
                    .status(BillboardStatus.APPROVED)
                    .dailyViews(60000)
                    .isFeatured(false)
                    .build();
            b9.addImage(BillboardImage.builder().imageUrl("https://images.unsplash.com/photo-1745725427643-8994370391e6?w=1080").isThumbnail(true).build());

            List<Billboard> billboardsToSave = List.of(b1, b2, b3, b4, b5, b6, b7, b8, b9);
            for (Billboard b : billboardsToSave) {
                b.setFormattedAddress(b.getAddress() + ", " + b.getCity());
                b.setAddressDetail("");
                b.setWard("");
            }
            billboardRepository.saveAll(billboardsToSave);
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

        // 10. Seed new billboards for surrounding districts
        seedNewBillboards();
    }

    private void patchBillboardMapData() {
        record MapPatch(double lat, double lng, String videoUrl) {}
        java.util.Map<String, MapPatch> patches = java.util.Map.of(
                "Cầu Rồng", new MapPatch(16.0614, 108.2275, "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"),
                "Bạch Đằng", new MapPatch(16.0708, 108.2483, "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"),
                "Nguyễn Văn Linh", new MapPatch(16.0545, 108.2020, null),
                "Vincom", new MapPatch(16.0678, 108.2208, "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"),
                "Trần Phú", new MapPatch(16.0805, 108.2230, null)
        );

        for (Billboard b : billboardRepository.findAll()) {
            boolean changed = false;
            if (b.getFormattedAddress() == null) {
                b.setFormattedAddress(b.getAddress() + ", " + b.getCity());
                b.setAddressDetail("");
                b.setWard("");
                changed = true;
            }
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

    private void seedNewBillboards() {
        User owner = userRepository.findByEmail("owner@adora.com").orElse(null);
        if (owner == null) return;

        List<BillboardCategory> categories = categoryRepository.findAll();
        if (categories.isEmpty()) return;

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

        List<Billboard> existing = billboardRepository.findAll();

        // 1. Sơn Trà - High
        createIfNotExist(existing, owner, buildingCat, "Vòng xoay Phạm Văn Đồng LED",
                "Màn hình LED lớn tại vòng xoay Phạm Văn Đồng - Ngô Quyền, đón đầu lượng giao thông từ cầu Sông Hàn ra bãi biển Mỹ Khê.",
                "Vòng xoay Phạm Văn Đồng - Ngô Quyền, An Hải Bắc, Sơn Trà, Đà Nẵng", "Sơn Trà",
                16.0740, 108.2445, 12.0, 6.0, "1920x1080", "6000 nits", "3840Hz", "Outdoor LED",
                "16h/ngày", 3200000, 95000000, 1.1, 110000,
                "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080");

        // 2. Sơn Trà - Low
        createIfNotExist(existing, owner, streetCat, "Võ Văn Kiệt Pedestrian LED",
                "Bảng Led quảng cáo tầm thấp tại dải phân cách đường Võ Văn Kiệt, tiếp cận người đi bộ và lưu lượng xe đi ra biển Mỹ Khê.",
                "Đường Võ Văn Kiệt, Phước Mỹ, Sơn Trà, Đà Nẵng", "Sơn Trà",
                16.0645, 108.2415, 8.0, 4.0, "1280x720", "5000 nits", "3840Hz", "Street LED",
                "16h/ngày", 1400000, 42000000, 1.0, 45000,
                "https://images.unsplash.com/photo-1626785774573-4b799315345d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080");

        // 3. Thanh Khê - High
        createIfNotExist(existing, owner, highwayCat, "Ngã Tư Điện Biên Phủ LED",
                "Bảng quảng cáo LED ngoài trời tại nút giao thông ngã tư Điện Biên Phủ - Nguyễn Tri Phương, nơi có mật độ giao thông cực kỳ cao.",
                "Ngã tư Điện Biên Phủ - Nguyễn Tri Phương, Chính Gián, Thanh Khê, Đà Nẵng", "Thanh Khê",
                16.0655, 108.1970, 14.0, 7.0, "1920x1080", "6500 nits", "3840Hz", "Outdoor LED",
                "16h/ngày", 3000000, 88000000, 1.05, 115000,
                "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080");

        // 4. Thanh Khê - Low
        createIfNotExist(existing, owner, streetCat, "Nguyễn Tất Thành Street Screen",
                "Màn hình LED dọc tuyến đường ven biển Nguyễn Tất Thành, phù hợp cho các chiến dịch quảng bá địa phương.",
                "Đường Nguyễn Tất Thành, Xuân Hà, Thanh Khê, Đà Nẵng", "Thanh Khê",
                16.0758, 108.1835, 8.0, 4.0, "1280x720", "5000 nits", "3840Hz", "Street LED",
                "16h/ngày", 1300000, 38000000, 1.0, 35000,
                "https://images.unsplash.com/photo-1506744038136-46273834b3fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080");

        // 5. Ngũ Hành Sơn - High
        createIfNotExist(existing, owner, highwayCat, "Võ Nguyên Giáp Beachfront LED",
                "Vị trí đắc địa mặt tiền biển Võ Nguyên Giáp, tiếp cận lượng lớn khách du lịch trong nước và quốc tế.",
                "Đường Võ Nguyên Giáp, Khuê Mỹ, Ngũ Hành Sơn, Đà Nẵng", "Ngũ Hành Sơn",
                16.0544, 108.2477, 12.0, 6.0, "1920x1080", "6000 nits", "3840Hz", "Outdoor LED",
                "16h/ngày", 3100000, 90000000, 1.1, 95000,
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080");

        // 6. Ngũ Hành Sơn - Low
        createIfNotExist(existing, owner, streetCat, "Lê Văn Hiến Street Screen",
                "Màn hình LED kỹ thuật số nằm trên trục đường chính Lê Văn Hiến kết nối Đà Nẵng và Hội An.",
                "Đường Lê Văn Hiến, Hòa Hải, Ngũ Hành Sơn, Đà Nẵng", "Ngũ Hành Sơn",
                15.9920, 108.2610, 8.0, 4.0, "1280x720", "5000 nits", "3840Hz", "Street LED",
                "14h/ngày", 1200000, 35000000, 1.0, 30000,
                "https://images.unsplash.com/photo-1519046904884-53103b34b206?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080");

        // 7. Liên Chiểu - High
        createIfNotExist(existing, owner, highwayCat, "Tôn Đức Thắng Junction LED",
                "Nằm ngay trục đường giao thông huyết mạch Tôn Đức Thắng, gần bến xe trung tâm thành phố Đà Nẵng.",
                "Đường Tôn Đức Thắng, Hòa Minh, Liên Chiểu, Đà Nẵng", "Liên Chiểu",
                16.0615, 108.1685, 10.0, 5.0, "1920x1080", "6000 nits", "3840Hz", "Outdoor LED",
                "16h/ngày", 2200000, 65000000, 1.05, 75000,
                "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080");

        // 8. Liên Chiểu - Low
        createIfNotExist(existing, owner, streetCat, "Nguyễn Lương Bằng Campus Screen",
                "Màn hình quảng cáo trước khu đô thị công nghệ cao Nguyễn Lương Bằng, gần các trường đại học lớn.",
                "Đường Nguyễn Lương Bằng, Hòa Khánh Bắc, Liên Chiểu, Đà Nẵng", "Liên Chiểu",
                16.0750, 108.1520, 8.0, 4.0, "1280x720", "5000 nits", "3840Hz", "Street LED",
                "16h/ngày", 950000, 28000000, 1.0, 25000,
                "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080");

        // 9. Cẩm Lệ - High
        createIfNotExist(existing, owner, buildingCat, "Nguyễn Hữu Thọ Avenue LED",
                "Màn hình LED lớn ốp tường tại đại lộ Nguyễn Hữu Thọ, tiếp cận luồng giao thông từ các quận phía Nam vào trung tâm.",
                "Đường Nguyễn Hữu Thọ, Khuê Trung, Cẩm Lệ, Đà Nẵng", "Cẩm Lệ",
                16.0270, 108.2095, 10.0, 5.0, "1920x1080", "5500 nits", "3840Hz", "Building LED",
                "18h/ngày", 2000000, 60000000, 1.05, 70000,
                "https://images.unsplash.com/photo-1472214222555-d404758b1c42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080");

        // 10. Cẩm Lệ - Low
        createIfNotExist(existing, owner, streetCat, "Cách Mạng Tháng Tám Highway Screen",
                "Bảng quảng cáo LED tầm trung trên quốc lộ Cách Mạng Tháng Tám hướng đi cầu vượt Hòa Cầm.",
                "Đường Cách Mạng Tháng Tám, Hòa Thọ Đông, Cẩm Lệ, Đà Nẵng", "Cẩm Lệ",
                16.0290, 108.2160, 10.0, 5.0, "1280x720", "5000 nits", "3840Hz", "Street LED",
                "16h/ngày", 1000000, 30000000, 1.0, 40000,
                "https://images.unsplash.com/photo-1469474968028-56623f02e42e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080");
    }

    private void createIfNotExist(List<Billboard> existing, User owner, BillboardCategory category,
                                  String title, String description, String address, String district,
                                  Double latitude, Double longitude, Double width, Double height,
                                  String resolution, String brightness, String refreshRate, String screenType,
                                  String operatingHours, long pricePerDay, long pricePerMonth, double surcharge,
                                  int dailyViews, String imageUrl) {
        boolean exists = existing.stream().anyMatch(b -> b.getTitle().equalsIgnoreCase(title));
        if (!exists) {
            Billboard b = Billboard.builder()
                    .owner(owner)
                    .category(category)
                    .title(title)
                    .description(description)
                    .address(address)
                    .formattedAddress(address)
                    .addressDetail("")
                    .ward("")
                    .city("Đà Nẵng")
                    .district(district)
                    .latitude(latitude)
                    .longitude(longitude)
                    .width(width)
                    .height(height)
                    .resolution(resolution)
                    .brightness(brightness)
                    .refreshRate(refreshRate)
                    .screenType(screenType)
                    .operatingHours(operatingHours)
                    .pricePerDay(BigDecimal.valueOf(pricePerDay))
                    .pricePerMonth(BigDecimal.valueOf(pricePerMonth))
                    .locationSurcharge(BigDecimal.valueOf(surcharge))
                    .status(BillboardStatus.APPROVED)
                    .dailyViews(dailyViews)
                    .isFeatured(false)
                    .build();
            b.addImage(BillboardImage.builder().imageUrl(imageUrl).isThumbnail(true).build());
            billboardRepository.save(b);
        }
    }
}
