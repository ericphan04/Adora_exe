package com.adora.dto;

import com.adora.entity.AvailabilityStatus;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillboardAvailabilityDto {
    private Long id;
    private LocalDate availableDate;
    private AvailabilityStatus status;
}
