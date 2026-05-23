package com.adora.service;

import com.adora.dto.LoginRequest;
import com.adora.dto.LoginResponse;
import com.adora.dto.RegisterRequest;
import com.adora.dto.UserDto;
import com.adora.entity.User;
import com.adora.entity.UserStatus;
import com.adora.exception.BadRequestException;
import com.adora.repository.UserRepository;
import com.adora.security.JwtTokenProvider;
import com.adora.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.adora.dto.GoogleLoginRequest;
import com.adora.entity.Role;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Autowired
    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public UserDto register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email address is already in use");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .status(UserStatus.ACTIVE) // Default status as active based on API sample
                .companyName(request.getCompanyName())
                .build();

        User savedUser = userRepository.save(user);

        return convertToUserDto(savedUser);
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();

        LoginResponse.UserSummary userSummary = LoginResponse.UserSummary.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();

        return LoginResponse.builder()
                .token(jwt)
                .user(userSummary)
                .build();
    }

    @Transactional
    public LoginResponse googleLogin(GoogleLoginRequest request) {
        String googleUserInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo?access_token=" + request.getToken();
        RestTemplate restTemplate = new RestTemplate();
        Map<String, Object> googleResponse;

        try {
            googleResponse = restTemplate.getForObject(googleUserInfoUrl, Map.class);
        } catch (Exception e) {
            throw new BadRequestException("Invalid Google access token");
        }

        if (googleResponse == null || !googleResponse.containsKey("email")) {
            throw new BadRequestException("Failed to retrieve user info from Google");
        }

        String email = (String) googleResponse.get("email");
        String name = (String) googleResponse.get("name");
        String picture = (String) googleResponse.get("picture");

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = User.builder()
                    .fullName(name != null ? name : "Google User")
                    .email(email)
                    .phone("")
                    .passwordHash(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                    .role(Role.RENTER)
                    .status(UserStatus.ACTIVE)
                    .avatarUrl(picture)
                    .build();
            user = userRepository.save(user);
        }

        UserPrincipal userPrincipal = new UserPrincipal(user);
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userPrincipal, null, userPrincipal.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        LoginResponse.UserSummary userSummary = LoginResponse.UserSummary.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();

        return LoginResponse.builder()
                .token(jwt)
                .user(userSummary)
                .build();
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
