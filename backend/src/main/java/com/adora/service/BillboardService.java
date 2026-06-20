package com.adora.service;

import com.adora.dto.*;
import com.adora.entity.*;
import com.adora.exception.BadRequestException;
import com.adora.exception.ResourceNotFoundException;
import com.adora.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class BillboardService {

    private final BillboardRepository billboardRepository;
    private final BillboardCategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final BillboardImageRepository imageRepository;
    private final BillboardAvailabilityRepository availabilityRepository;
    private final BillboardFeatureRepository featureRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final ConversationRepository conversationRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationRepository notificationRepository;

    public BillboardService(BillboardRepository billboardRepository,
                            BillboardCategoryRepository categoryRepository,
                            UserRepository userRepository,
                            BillboardImageRepository imageRepository,
                            BillboardAvailabilityRepository availabilityRepository,
                            BillboardFeatureRepository featureRepository,
                            BookingRepository bookingRepository,
                            ReviewRepository reviewRepository,
                            ConversationRepository conversationRepository,
                            PaymentRepository paymentRepository,
                            NotificationRepository notificationRepository) {
        this.billboardRepository = billboardRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.imageRepository = imageRepository;
        this.availabilityRepository = availabilityRepository;
        this.featureRepository = featureRepository;
        this.bookingRepository = bookingRepository;
        this.reviewRepository = reviewRepository;
        this.conversationRepository = conversationRepository;
        this.paymentRepository = paymentRepository;
        this.notificationRepository = notificationRepository;
    }

    public List<BillboardDto> getAllPublicBillboards(
            String keyword, String city, String district,
            java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice,
            Long categoryId, Boolean featured, String feature) {
        
        String formattedKeyword = null;
        if (keyword != null && !keyword.trim().isEmpty()) {
            formattedKeyword = "%" + keyword.trim().toLowerCase() + "%";
        }
        
        String lowerCity = (city != null && !city.trim().isEmpty()) ? city.trim().toLowerCase() : null;
        String lowerDistrict = (district != null && !district.trim().isEmpty()) ? district.trim().toLowerCase() : null;
        String lowerFeature = (feature != null && !feature.trim().isEmpty()) ? feature.trim().toLowerCase() : null;
        
        List<Billboard> billboards = billboardRepository.searchBillboards(
                BillboardStatus.APPROVED, categoryId, lowerCity, lowerDistrict, minPrice, maxPrice, featured, formattedKeyword, lowerFeature
        );
        return billboards.stream().map(this::mapToLightDto).collect(Collectors.toList());
    }

    public List<BillboardDto> getFeaturedBillboards() {
        List<Billboard> billboards = billboardRepository.searchBillboards(
                BillboardStatus.APPROVED, null, null, null, null, null, true, null, null
        );
        return billboards.stream().map(this::mapToLightDto).collect(Collectors.toList());
    }

    public BillboardDto getBillboardById(Long id) {
        Billboard billboard = billboardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Billboard not found with id: " + id));
        return mapToDto(billboard);
    }

    public List<BillboardDto> getBillboardsByOwner(Long ownerId) {
        List<Billboard> billboards = billboardRepository.findByOwnerId(ownerId);
        return billboards.stream().map(this::mapToLightDto).collect(Collectors.toList());
    }

    public List<BillboardDto> getAdminBillboards(BillboardStatus status) {
        List<Billboard> billboards = status != null ? 
                billboardRepository.findByStatus(status) : billboardRepository.findAll();
        return billboards.stream().map(this::mapToLightDto).collect(Collectors.toList());
    }

    public BillboardDto createBillboard(CreateBillboardRequest request, Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + ownerId));

        BillboardCategory category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
        }

        Billboard billboard = Billboard.builder()
                .owner(owner)
                .category(category)
                .title(request.getTitle())
                .description(request.getDescription())
                .address(request.getAddress())
                .formattedAddress(request.getFormattedAddress())
                .addressDetail(request.getAddressDetail())
                .ward(request.getWard())
                .city(request.getCity())
                .district(request.getDistrict())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .demoVideoUrl(request.getDemoVideoUrl())
                .width(request.getWidth())
                .height(request.getHeight())
                .resolution(request.getResolution())
                .brightness(request.getBrightness())
                .refreshRate(request.getRefreshRate())
                .screenType(request.getScreenType())
                .operatingHours(request.getOperatingHours())
                .pricePerDay(request.getPricePerDay())
                .pricePerMonth(request.getPricePerMonth())
                .locationSurcharge(request.getLocationSurcharge() != null ? request.getLocationSurcharge() : java.math.BigDecimal.ZERO)
                .premiumSurcharge(request.getPremiumSurcharge() != null ? request.getPremiumSurcharge() : java.math.BigDecimal.ZERO)
                .status(BillboardStatus.PENDING)
                .dailyViews(0)
                .isFeatured(false)
                .build();


        Billboard savedBillboard = billboardRepository.save(billboard);

        if (request.getFeatures() != null) {
            for (String featName : request.getFeatures()) {
                BillboardFeature feature = BillboardFeature.builder()
                        .billboard(savedBillboard)
                        .name(featName)
                        .build();
                featureRepository.save(feature);
                savedBillboard.addFeature(feature);
            }
        }

        return mapToDto(savedBillboard);
    }

    public BillboardDto updateBillboard(Long id, UpdateBillboardRequest request, Long ownerId) {
        Billboard billboard = billboardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Billboard not found with id: " + id));

        if (!billboard.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You can only update your own billboard");
        }

        BillboardCategory category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
        }

        billboard.setCategory(category);
        billboard.setTitle(request.getTitle());
        billboard.setDescription(request.getDescription());
        billboard.setAddress(request.getAddress());
        billboard.setFormattedAddress(request.getFormattedAddress());
        billboard.setAddressDetail(request.getAddressDetail());
        billboard.setWard(request.getWard());
        billboard.setCity(request.getCity());
        billboard.setDistrict(request.getDistrict());
        billboard.setLatitude(request.getLatitude());
        billboard.setLongitude(request.getLongitude());
        billboard.setDemoVideoUrl(request.getDemoVideoUrl());
        billboard.setWidth(request.getWidth());
        billboard.setHeight(request.getHeight());
        billboard.setResolution(request.getResolution());
        billboard.setBrightness(request.getBrightness());
        billboard.setRefreshRate(request.getRefreshRate());
        billboard.setScreenType(request.getScreenType());
        billboard.setOperatingHours(request.getOperatingHours());
        billboard.setPricePerDay(request.getPricePerDay());
        billboard.setPricePerMonth(request.getPricePerMonth());
        billboard.setLocationSurcharge(request.getLocationSurcharge() != null ? request.getLocationSurcharge() : java.math.BigDecimal.ZERO);
        billboard.setPremiumSurcharge(request.getPremiumSurcharge() != null ? request.getPremiumSurcharge() : java.math.BigDecimal.ZERO);


        // Update features
        featureRepository.deleteAll(billboard.getFeatures());
        billboard.getFeatures().clear();
        if (request.getFeatures() != null) {
            for (String featName : request.getFeatures()) {
                BillboardFeature feature = BillboardFeature.builder()
                        .billboard(billboard)
                        .name(featName)
                        .build();
                featureRepository.save(feature);
                billboard.addFeature(feature);
            }
        }

        Billboard saved = billboardRepository.save(billboard);
        return mapToDto(saved);
    }

    public void deleteBillboard(Long id, Long ownerId) {
        Billboard billboard = billboardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Billboard not found with id: " + id));

        if (ownerId != null && !billboard.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You can only delete your own billboard");
        }

        // 1. Tìm tất cả bookings liên quan đến billboard
        List<Booking> bookings = bookingRepository.findByBillboardId(id);

        // Nếu là Owner xóa, kiểm tra xem có hợp đồng đang hoạt động/tương lai không
        if (ownerId != null) {
            boolean hasActiveBookings = bookings.stream().anyMatch(b -> 
                b.getStatus() != BookingStatus.CANCELLED && 
                b.getStatus() != BookingStatus.REJECTED && 
                b.getStatus() != BookingStatus.COMPLETED &&
                b.getEndDate().isAfter(LocalDateTime.now())
            );
            if (hasActiveBookings) {
                throw new BadRequestException("Không thể xóa bảng quảng cáo do đang có hợp đồng hoạt động hoặc đã lên lịch. Vui lòng gửi yêu cầu gỡ bảng lên Admin duyệt.");
            }
        }

        List<Long> bookingIds = bookings.stream().map(Booking::getId).collect(Collectors.toList());

        if (!bookingIds.isEmpty()) {
            // 2. Tìm tất cả payments liên quan đến các bookings này
            List<Payment> payments = paymentRepository.findByBookingIdIn(bookingIds);
            List<Long> paymentIds = payments.stream().map(Payment::getId).collect(Collectors.toList());

            // 3. Xóa các notifications tham chiếu tới bookings hoặc payments này
            List<Notification> notifications = new ArrayList<>();
            notifications.addAll(notificationRepository.findByBookingIdIn(bookingIds));
            if (!paymentIds.isEmpty()) {
                notifications.addAll(notificationRepository.findByPaymentIdIn(paymentIds));
            }
            List<Notification> uniqueNotifications = notifications.stream().distinct().collect(Collectors.toList());
            notificationRepository.deleteAll(uniqueNotifications);

            // 4. Xóa các payments
            paymentRepository.deleteAll(payments);
        }

        // 5. Xóa reviews (tham chiếu booking_id + billboard_id)
        List<com.adora.entity.Review> reviews = reviewRepository.findByBillboardId(id);
        reviewRepository.deleteAll(reviews);

        // 6. Xóa conversations (cascade tự xóa messages bên trong) liên quan đến billboard hoặc các bookings của billboard
        List<com.adora.entity.Conversation> conversations = new ArrayList<>();
        conversations.addAll(conversationRepository.findByBillboardId(id));
        if (!bookingIds.isEmpty()) {
            conversations.addAll(conversationRepository.findByBookingIdIn(bookingIds));
        }
        List<com.adora.entity.Conversation> uniqueConversations = conversations.stream().distinct().collect(Collectors.toList());
        conversationRepository.deleteAll(uniqueConversations);

        // 7. Xóa bookings
        bookingRepository.deleteAll(bookings);

        // 8. Xóa billboard (cascade xóa images, features, availabilities)
        billboardRepository.delete(billboard);
    }

    public BillboardDto requestDeletion(Long id, Long ownerId) {
        Billboard billboard = billboardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Billboard not found with id: " + id));

        if (!billboard.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You can only request deletion for your own billboard");
        }

        billboard.setStatus(BillboardStatus.PENDING_DELETION);
        return mapToDto(billboardRepository.save(billboard));
    }

    public BillboardDto addImage(Long id, AddImageRequest request, Long ownerId) {
        Billboard billboard = billboardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Billboard not found with id: " + id));

        if (!billboard.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You can only manage your own billboard images");
        }

        if (Boolean.TRUE.equals(request.getIsThumbnail())) {
            // Uncheck other thumbnails
            for (BillboardImage img : billboard.getImages()) {
                if (Boolean.TRUE.equals(img.getIsThumbnail())) {
                    img.setIsThumbnail(false);
                    imageRepository.save(img);
                }
            }
        }

        BillboardImage image = BillboardImage.builder()
                .billboard(billboard)
                .imageUrl(request.getImageUrl())
                .isThumbnail(request.getIsThumbnail() != null ? request.getIsThumbnail() : false)
                .build();

        imageRepository.save(image);
        billboard.addImage(image);

        return mapToDto(billboard);
    }

    public BillboardDto deleteImage(Long billboardId, Long imageId, Long ownerId) {
        Billboard billboard = billboardRepository.findById(billboardId)
                .orElseThrow(() -> new ResourceNotFoundException("Billboard not found with id: " + billboardId));

        if (!billboard.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You can only manage your own billboard images");
        }

        BillboardImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Image not found with id: " + imageId));

        if (!image.getBillboard().getId().equals(billboardId)) {
            throw new BadRequestException("Image does not belong to this billboard");
        }

        boolean wasThumbnail = Boolean.TRUE.equals(image.getIsThumbnail());

        billboard.removeImage(image);
        imageRepository.delete(image);

        // If we deleted the thumbnail, set the first remaining image as the thumbnail
        if (wasThumbnail && !billboard.getImages().isEmpty()) {
            BillboardImage firstImg = billboard.getImages().get(0);
            firstImg.setIsThumbnail(true);
            imageRepository.save(firstImg);
        }

        return mapToDto(billboardRepository.save(billboard));
    }

    public BillboardDto setThumbnail(Long billboardId, Long imageId, Long ownerId) {
        Billboard billboard = billboardRepository.findById(billboardId)
                .orElseThrow(() -> new ResourceNotFoundException("Billboard not found with id: " + billboardId));

        if (!billboard.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You can only manage your own billboard images");
        }

        BillboardImage targetImage = imageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Image not found with id: " + imageId));

        if (!targetImage.getBillboard().getId().equals(billboardId)) {
            throw new BadRequestException("Image does not belong to this billboard");
        }

        for (BillboardImage img : billboard.getImages()) {
            img.setIsThumbnail(img.getId().equals(imageId));
            imageRepository.save(img);
        }

        return mapToDto(billboardRepository.save(billboard));
    }

    public BillboardDto setAvailability(Long id, SetAvailabilityRequest request, Long ownerId) {
        Billboard billboard = billboardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Billboard not found with id: " + id));

        if (!billboard.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You can only manage your own billboard availability");
        }

        LocalDate start = request.getStartDate();
        LocalDate end = request.getEndDate();

        if (start.isAfter(end)) {
            throw new BadRequestException("Start date must be before or equal to end date");
        }

        List<BillboardAvailability> existing = availabilityRepository.findByBillboardIdAndAvailableDateBetween(id, start, end);
        availabilityRepository.deleteAll(existing);
        billboard.getAvailabilities().removeAll(existing);

        LocalDate current = start;
        while (!current.isAfter(end)) {
            BillboardAvailability availability = BillboardAvailability.builder()
                    .billboard(billboard)
                    .availableDate(current)
                    .status(request.getStatus())
                    .build();
            availabilityRepository.save(availability);
            billboard.addAvailability(availability);
            current = current.plusDays(1);
        }

        return mapToDto(billboard);
    }

    public BillboardDto updateStatus(Long id, BillboardStatus status) {
        Billboard billboard = billboardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Billboard not found with id: " + id));
        billboard.setStatus(status);
        return mapToDto(billboardRepository.save(billboard));
    }

    public BillboardDto mapToDto(Billboard entity) {
        if (entity == null) return null;

        UserDto ownerDto = null;
        if (entity.getOwner() != null) {
            ownerDto = UserDto.builder()
                    .id(entity.getOwner().getId())
                    .fullName(entity.getOwner().getFullName())
                    .email(entity.getOwner().getEmail())
                    .phone(entity.getOwner().getPhone())
                    .role(entity.getOwner().getRole())
                    .status(entity.getOwner().getStatus())
                    .avatarUrl(entity.getOwner().getAvatarUrl())
                    .companyName(entity.getOwner().getCompanyName())
                    .build();
        }

        BillboardCategoryDto catDto = null;
        if (entity.getCategory() != null) {
            catDto = BillboardCategoryDto.builder()
                    .id(entity.getCategory().getId())
                    .name(entity.getCategory().getName())
                    .description(entity.getCategory().getDescription())
                    .createdAt(entity.getCategory().getCreatedAt())
                    .build();
        }

        List<BillboardImageDto> imgDtos = new ArrayList<>();
        if (entity.getImages() != null) {
            imgDtos = entity.getImages().stream()
                    .map(img -> BillboardImageDto.builder()
                            .id(img.getId())
                            .imageUrl(img.getImageUrl())
                            .isThumbnail(img.getIsThumbnail())
                            .build())
                    .sorted((a, b) -> {
                        boolean aThumb = a.getIsThumbnail() != null && a.getIsThumbnail();
                        boolean bThumb = b.getIsThumbnail() != null && b.getIsThumbnail();
                        if (aThumb && !bThumb) return -1;
                        if (!aThumb && bThumb) return 1;
                        if (a.getId() != null && b.getId() != null) {
                            return a.getId().compareTo(b.getId());
                        }
                        return 0;
                    })
                    .collect(Collectors.toList());
        }

        List<BillboardFeatureDto> featDtos = new ArrayList<>();
        if (entity.getFeatures() != null) {
            featDtos = entity.getFeatures().stream()
                    .map(feat -> BillboardFeatureDto.builder()
                            .id(feat.getId())
                            .name(feat.getName())
                            .build())
                    .collect(Collectors.toList());
        }

        List<BillboardAvailabilityDto> availDtos = new ArrayList<>();
        if (entity.getAvailabilities() != null) {
            availDtos = entity.getAvailabilities().stream()
                    .map(avail -> BillboardAvailabilityDto.builder()
                            .id(avail.getId())
                            .availableDate(avail.getAvailableDate())
                            .status(avail.getStatus())
                            .build())
                    .collect(Collectors.toList());
        }

        // Dynamically compute fully-booked dates (24 hours booked)
        if (entity.getId() != null && bookingRepository != null) {
            List<Booking> activeBookings = bookingRepository.findActiveBookingsForBillboardOnDate(
                    entity.getId(), 
                    LocalDate.now().atStartOfDay(), 
                    LocalDate.now().plusYears(1).atTime(23, 59, 59)
            );
            
            java.util.Map<LocalDate, Integer> bookedHours = new java.util.HashMap<>();
            for (Booking b : activeBookings) {
                LocalDateTime start = b.getStartDate();
                LocalDateTime end = b.getEndDate();
                LocalDate startD = start.toLocalDate();
                LocalDate endD = end.toLocalDate();

                if (startD.equals(endD)) {
                    long hours = java.time.temporal.ChronoUnit.HOURS.between(start, end);
                    bookedHours.put(startD, bookedHours.getOrDefault(startD, 0) + (int) hours);
                } else {
                    long hours1 = java.time.temporal.ChronoUnit.HOURS.between(start, startD.plusDays(1).atStartOfDay());
                    bookedHours.put(startD, bookedHours.getOrDefault(startD, 0) + (int) hours1);
                    
                    LocalDate curr = startD.plusDays(1);
                    while (curr.isBefore(endD)) {
                        bookedHours.put(curr, bookedHours.getOrDefault(curr, 0) + 24);
                        curr = curr.plusDays(1);
                    }

                    long hoursLast = java.time.temporal.ChronoUnit.HOURS.between(endD.atStartOfDay(), end);
                    bookedHours.put(endD, bookedHours.getOrDefault(endD, 0) + (int) hoursLast);
                }
            }

            for (java.util.Map.Entry<LocalDate, Integer> entry : bookedHours.entrySet()) {
                if (entry.getValue() >= 24) {
                    boolean exists = availDtos.stream().anyMatch(a -> a.getAvailableDate().equals(entry.getKey()));
                    if (!exists) {
                        availDtos.add(BillboardAvailabilityDto.builder()
                                .availableDate(entry.getKey())
                                .status(com.adora.entity.AvailabilityStatus.BOOKED)
                                .build());
                    }
                }
            }
        }

        return BillboardDto.builder()
                .id(entity.getId())
                .owner(ownerDto)
                .category(catDto)
                .title(entity.getTitle())
                .description(entity.getDescription())
                .address(entity.getAddress())
                .formattedAddress(entity.getFormattedAddress())
                .addressDetail(entity.getAddressDetail())
                .ward(entity.getWard())
                .city(entity.getCity())
                .district(entity.getDistrict())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .demoVideoUrl(entity.getDemoVideoUrl())
                .width(entity.getWidth())
                .height(entity.getHeight())
                .resolution(entity.getResolution())
                .brightness(entity.getBrightness())
                .refreshRate(entity.getRefreshRate())
                .screenType(entity.getScreenType())
                .operatingHours(entity.getOperatingHours())
                .pricePerDay(entity.getPricePerDay())
                .pricePerMonth(entity.getPricePerMonth())
                .locationSurcharge(entity.getLocationSurcharge())
                .premiumSurcharge(entity.getPremiumSurcharge())
                .status(entity.getStatus())

                .dailyViews(entity.getDailyViews())
                .isFeatured(entity.getIsFeatured())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .images(imgDtos)
                .features(featDtos)
                .availabilities(availDtos)
                .build();
    }

    public BillboardDto mapToLightDto(Billboard entity) {
        if (entity == null) return null;

        UserDto ownerDto = null;
        if (entity.getOwner() != null) {
            ownerDto = UserDto.builder()
                    .id(entity.getOwner().getId())
                    .fullName(entity.getOwner().getFullName())
                    .build();
        }

        List<BillboardImageDto> imgDtos = new ArrayList<>();
        if (entity.getImages() != null) {
            imgDtos = entity.getImages().stream()
                    .map(img -> BillboardImageDto.builder()
                            .id(img.getId())
                            .imageUrl(img.getImageUrl())
                            .isThumbnail(img.getIsThumbnail())
                            .build())
                    .sorted((a, b) -> {
                        boolean aThumb = a.getIsThumbnail() != null && a.getIsThumbnail();
                        boolean bThumb = b.getIsThumbnail() != null && b.getIsThumbnail();
                        if (aThumb && !bThumb) return -1;
                        if (!aThumb && bThumb) return 1;
                        if (a.getId() != null && b.getId() != null) {
                            return a.getId().compareTo(b.getId());
                        }
                        return 0;
                    })
                    .collect(Collectors.toList());
        }

        return BillboardDto.builder()
                .id(entity.getId())
                .owner(ownerDto)
                .category(null)
                .title(entity.getTitle())
                .description(entity.getDescription())
                .address(entity.getAddress())
                .formattedAddress(entity.getFormattedAddress())
                .addressDetail(entity.getAddressDetail())
                .ward(entity.getWard())
                .city(entity.getCity())
                .district(entity.getDistrict())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .demoVideoUrl(entity.getDemoVideoUrl())
                .width(entity.getWidth())
                .height(entity.getHeight())
                .resolution(entity.getResolution())
                .brightness(entity.getBrightness())
                .refreshRate(entity.getRefreshRate())
                .screenType(entity.getScreenType())
                .operatingHours(entity.getOperatingHours())
                .pricePerDay(entity.getPricePerDay())
                .pricePerMonth(entity.getPricePerMonth())
                .locationSurcharge(entity.getLocationSurcharge())
                .premiumSurcharge(entity.getPremiumSurcharge())
                .status(entity.getStatus())

                .dailyViews(entity.getDailyViews())
                .isFeatured(entity.getIsFeatured())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .images(imgDtos)
                .features(new ArrayList<>())
                .availabilities(new ArrayList<>())
                .build();
    }
}

