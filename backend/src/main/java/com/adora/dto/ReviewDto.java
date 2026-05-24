package com.adora.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDto {
    private Long id;
    private Long bookingId;
    private UserDto renter;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
