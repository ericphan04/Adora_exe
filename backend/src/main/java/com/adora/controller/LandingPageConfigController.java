package com.adora.controller;

import com.adora.dto.ApiResponse;
import com.adora.entity.LandingPageConfig;
import com.adora.service.LandingPageConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class LandingPageConfigController {

    private final LandingPageConfigService configService;

    public LandingPageConfigController(LandingPageConfigService configService) {
        this.configService = configService;
    }

    @GetMapping("/api/landing-page/config")
    public ResponseEntity<ApiResponse<LandingPageConfig>> getLandingPageConfig() {
        LandingPageConfig config = configService.getConfig();
        return ResponseEntity.ok(ApiResponse.<LandingPageConfig>builder()
                .success(true)
                .message("Fetched landing page config successfully")
                .data(config)
                .build());
    }

    @PutMapping("/api/admin/landing-page/config")
    public ResponseEntity<ApiResponse<LandingPageConfig>> updateLandingPageConfig(
            @RequestBody LandingPageConfig config) {
        LandingPageConfig updated = configService.updateConfig(config);
        return ResponseEntity.ok(ApiResponse.<LandingPageConfig>builder()
                .success(true)
                .message("Updated landing page config successfully")
                .data(updated)
                .build());
    }
}
