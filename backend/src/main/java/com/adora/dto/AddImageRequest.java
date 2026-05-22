package com.adora.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddImageRequest {

    @NotBlank(message = "Image URL is required")
    private String imageUrl;

    private Boolean isThumbnail;
}
