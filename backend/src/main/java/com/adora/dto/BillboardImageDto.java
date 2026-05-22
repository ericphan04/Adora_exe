package com.adora.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillboardImageDto {
    private Long id;
    private String imageUrl;
    private Boolean isThumbnail;
}
