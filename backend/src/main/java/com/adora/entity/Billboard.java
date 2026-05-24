package com.adora.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "billboards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Billboard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private BillboardCategory category;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String district;

    private Double latitude;
    private Double longitude;

    @Column(name = "demo_video_url")
    private String demoVideoUrl;

    private Double width;
    private Double height;

    private String resolution;
    private String brightness;

    @Column(name = "refresh_rate")
    private String refreshRate;

    @Column(name = "screen_type")
    private String screenType;

    @Column(name = "operating_hours")
    private String operatingHours;

    @Column(name = "price_per_day", nullable = false)
    private BigDecimal pricePerDay;

    @Column(name = "price_per_month")
    private BigDecimal pricePerMonth;

    @Column(name = "location_surcharge")
    private BigDecimal locationSurcharge;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BillboardStatus status;

    @Column(name = "daily_views")
    private Integer dailyViews;

    @Column(name = "is_featured")
    private Boolean isFeatured;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "billboard", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BillboardImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "billboard", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BillboardFeature> features = new ArrayList<>();

    @OneToMany(mappedBy = "billboard", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BillboardAvailability> availabilities = new ArrayList<>();

    public void addImage(BillboardImage image) {
        images.add(image);
        image.setBillboard(this);
    }

    public void removeImage(BillboardImage image) {
        images.remove(image);
        image.setBillboard(null);
    }

    public void addFeature(BillboardFeature feature) {
        features.add(feature);
        feature.setBillboard(this);
    }

    public void addAvailability(BillboardAvailability availability) {
        availabilities.add(availability);
        availability.setBillboard(this);
    }
}
