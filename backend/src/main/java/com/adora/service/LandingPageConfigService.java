package com.adora.service;

import com.adora.entity.LandingPageConfig;
import com.adora.repository.LandingPageConfigRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class LandingPageConfigService {

    private final LandingPageConfigRepository configRepository;

    public LandingPageConfigService(LandingPageConfigRepository configRepository) {
        this.configRepository = configRepository;
    }

    public LandingPageConfig getConfig() {
        return configRepository.findAll().stream()
                .findFirst()
                .orElseGet(this::createDefaultConfig);
    }

    public LandingPageConfig updateConfig(LandingPageConfig newConfig) {
        LandingPageConfig existing = configRepository.findAll().stream()
                .findFirst()
                .orElse(null);

        if (existing == null) {
            return configRepository.save(newConfig);
        }

        existing.setHeroTitle(newConfig.getHeroTitle());
        existing.setHeroSubtitle(newConfig.getHeroSubtitle());
        existing.setStatReach(newConfig.getStatReach());
        existing.setStatPanels(newConfig.getStatPanels());
        existing.setStatCampaigns(newConfig.getStatCampaigns());
        existing.setPromoText(newConfig.getPromoText());
        existing.setVisualProofTitle(newConfig.getVisualProofTitle());
        existing.setVisualProofDesc(newConfig.getVisualProofDesc());
        existing.setVisualProofImage(newConfig.getVisualProofImage());

        return configRepository.save(existing);
    }

    private LandingPageConfig createDefaultConfig() {
        LandingPageConfig defaultConfig = LandingPageConfig.builder()
                .heroTitle("Thống trị bầu trời với\nQuảng cáo LED Kỹ thuật số")
                .heroSubtitle("Nền tảng DOOH hàng đầu giúp doanh nghiệp tiếp cận hàng triệu khách hàng mục tiêu thông qua mạng lưới màn hình LED cao cấp trên toàn quốc.")
                .statReach("12.500.000+")
                .statPanels("450+")
                .statCampaigns("128+")
                .promoText("Được tin tưởng bởi hơn 5.000 nhà quảng cáo trên cả nước")
                .visualProofTitle("Vị trí đắc địa, Tầm nhìn vô hạn")
                .visualProofDesc("Chúng tôi không chỉ cung cấp không gian quảng cáo; chúng tôi kiến tạo những điểm chạm thị giác đẳng cấp giúp thương hiệu của bạn tỏa sáng giữa không gian đô thị nhộn nhịp.")
                .visualProofImage("https://images.unsplash.com/photo-1585504303098-9785dc784742?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMRUQlMjBiaWxsYm9hcmQlMjBkaWdpdGFsJTIwY2l0eSUyMG5pZ2h0fGVufDF8fHx8MTc3MjU0NjU5M3ww&ixlib=rb-4.1.0&q=80&w=1080")
                .build();
        return configRepository.save(defaultConfig);
    }
}
