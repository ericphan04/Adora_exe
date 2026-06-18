package com.adora.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookedSlotDto {
    private int startHour;
    private int endHour;
}
