package com.adora.dto;

import com.adora.entity.Role;
import com.adora.entity.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
    private UserStatus status;
    private String avatarUrl;
    private String companyName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
