package com.adora.service;

import com.adora.dto.UserDto;
import com.adora.entity.Role;
import com.adora.entity.User;
import com.adora.entity.UserStatus;
import com.adora.exception.ResourceNotFoundException;
import com.adora.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return convertToUserDto(user);
    }

    @Transactional(readOnly = true)
    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return convertToUserDto(user);
    }

    @Transactional(readOnly = true)
    public List<UserDto> searchUsers(String keyword, Role role, UserStatus status) {
        // Prepare keyword parameter for search
        String formattedKeyword = null;
        if (keyword != null && !keyword.trim().isEmpty()) {
            formattedKeyword = "%" + keyword.trim().toLowerCase() + "%";
        }
        
        List<User> users = userRepository.searchUsers(formattedKeyword, role, status);
        return users.stream()
                .map(this::convertToUserDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto updateUserStatus(Long id, UserStatus status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        user.setStatus(status);
        User updatedUser = userRepository.save(user);
        return convertToUserDto(updatedUser);
    }

    @Transactional
    public UserDto updateProfile(Long id, com.adora.dto.UpdateProfileRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getCompanyName() != null) {
            user.setCompanyName(request.getCompanyName());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        
        User updatedUser = userRepository.save(user);
        return convertToUserDto(updatedUser);
    }

    private UserDto convertToUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.getStatus())
                .companyName(user.getCompanyName())
                .avatarUrl(user.getAvatarUrl())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
