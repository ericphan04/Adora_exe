package com.adora.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateBillboardRequest {

    private Long categoryId;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "District is required")
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

    @NotNull(message = "Price per day is required")
    @Positive(message = "Price per day must be positive")
    private BigDecimal pricePerDay;

    private BigDecimal pricePerMonth;
    private BigDecimal locationSurcharge;

    private List<String> features;
}
