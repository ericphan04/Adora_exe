package com.adora.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillboardCategoryDto {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
}
