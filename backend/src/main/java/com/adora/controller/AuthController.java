package com.adora.controller;

import com.adora.dto.ApiResponse;
import com.adora.dto.LoginRequest;
import com.adora.dto.GoogleLoginRequest;
import com.adora.dto.LoginResponse;
import com.adora.dto.RegisterRequest;
import com.adora.dto.UserDto;
import com.adora.security.UserPrincipal;
import com.adora.service.AuthService;
import com.adora.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @Autowired
    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDto>> register(@Valid @RequestBody RegisterRequest request) {
        UserDto registeredUser = authService.register(request);
        ApiResponse<UserDto> response = ApiResponse.success("Register successfully", registeredUser);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse loginResponse = authService.login(request);
        ApiResponse<LoginResponse> response = ApiResponse.success("Login successfully", loginResponse);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<LoginResponse>> loginWithGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        LoginResponse loginResponse = authService.loginWithGoogle(request);
        ApiResponse<LoginResponse> response = ApiResponse.success("Google login successfully", loginResponse);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        UserDto currentUser = userService.getUserById(userPrincipal.getId());
        ApiResponse<UserDto> response = ApiResponse.success("Get current user successfully", currentUser);
        return ResponseEntity.ok(response);
    }
}
