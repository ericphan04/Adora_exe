package com.adora.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "landing_page_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LandingPageConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hero_title", nullable = false, columnDefinition = "TEXT")
    private String heroTitle;

    @Column(name = "hero_subtitle", nullable = false, columnDefinition = "TEXT")
    private String heroSubtitle;

    @Column(name = "stat_reach", nullable = false)
    private String statReach;

    @Column(name = "stat_panels", nullable = false)
    private String statPanels;

    @Column(name = "stat_campaigns", nullable = false)
    private String statCampaigns;

    @Column(name = "promo_text", nullable = false, columnDefinition = "TEXT")
    private String promoText;

    @Column(name = "visual_proof_title", nullable = false, columnDefinition = "TEXT")
    private String visualProofTitle;

    @Column(name = "visual_proof_desc", nullable = false, columnDefinition = "TEXT")
    private String visualProofDesc;

    @Column(name = "visual_proof_image", nullable = false, columnDefinition = "TEXT")
    private String visualProofImage;
}
