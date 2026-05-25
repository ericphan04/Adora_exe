package com.adora.dto;

import com.adora.entity.BillboardStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillboardDto {
    private Long id;
    private UserDto owner;
    private BillboardCategoryDto category;
    private String title;
    private String description;
    private String address;
    private String city;
    private String district;
    private Double latitude;
    private Double longitude;
    private String demoVideoUrl;
    private Double width;
    private Double height;
    private String resolution;
    private String brightness;
    private String refreshRate;
    private String screenType;
    private String operatingHours;
    private BigDecimal pricePerDay;
    private BigDecimal pricePerMonth;
    private BigDecimal locationSurcharge;
    private BillboardStatus status;
    private Integer dailyViews;
    private Boolean isFeatured;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<BillboardImageDto> images;
    private List<BillboardFeatureDto> features;
    private List<BillboardAvailabilityDto> availabilities;
}
