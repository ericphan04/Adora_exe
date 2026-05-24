package com.adora.controller;

import com.adora.dto.ApiResponse;
import com.adora.dto.UpdateStatusRequest;
import com.adora.dto.UserDto;
import com.adora.entity.Role;
import com.adora.entity.UserStatus;
import com.adora.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserService userService;

    @Autowired
    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "role", required = false) Role role,
            @RequestParam(value = "status", required = false) UserStatus status
    ) {
        List<UserDto> users = userService.searchUsers(keyword, role, status);
        ApiResponse<List<UserDto>> response = ApiResponse.success("Retrieve users successfully", users);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable("id") Long id) {
        UserDto user = userService.getUserById(id);
        ApiResponse<UserDto> response = ApiResponse.success("Retrieve user details successfully", user);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<UserDto>> updateUserStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateStatusRequest request
    ) {
        UserDto updatedUser = userService.updateUserStatus(id, request.getStatus());
        ApiResponse<UserDto> response = ApiResponse.success("Update user status successfully", updatedUser);
        return ResponseEntity.ok(response);
    }
}
