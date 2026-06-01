package com.adora.service;

import com.adora.dto.ChangePasswordRequest;
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
import com.adora.dto.GoogleLoginRequest;
import com.adora.dto.VerifyEmailRequest;
import com.adora.dto.ResendCodeRequest;
import com.adora.dto.ForgotPasswordRequest;
import com.adora.dto.ResetPasswordRequest;
import com.adora.entity.VerificationCode;
import com.adora.repository.VerificationCodeRepository;
import com.adora.service.EmailService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Collections;

@Service
public class AuthService {

    @Value("${adora.google.client-id}")
    private String googleClientId;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final VerificationCodeRepository verificationCodeRepository;
    private final EmailService emailService;

    @Autowired
    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       VerificationCodeRepository verificationCodeRepository,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.verificationCodeRepository = verificationCodeRepository;
        this.emailService = emailService;
    }

    @Transactional
    public UserDto register(RegisterRequest request) {
        User user;
        
        if (userRepository.existsByEmail(request.getEmail())) {
            User existingUser = userRepository.findByEmail(request.getEmail()).orElse(null);
            if (existingUser != null && existingUser.getStatus() == UserStatus.PENDING) {
                // Update existing pending user info (in case they retry with typo corrections)
                existingUser.setFullName(request.getFullName());
                existingUser.setPhone(request.getPhone());
                existingUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
                existingUser.setRole(request.getRole());
                existingUser.setCompanyName(request.getCompanyName());
                user = userRepository.save(existingUser);
            } else {
                throw new BadRequestException("Email address is already in use");
            }
        } else {
            user = User.builder()
                    .fullName(request.getFullName())
                    .email(request.getEmail())
                    .phone(request.getPhone())
                    .passwordHash(passwordEncoder.encode(request.getPassword()))
                    .role(request.getRole())
                    .status(UserStatus.PENDING) // New accounts are created as PENDING
                    .companyName(request.getCompanyName())
                    .build();
            user = userRepository.save(user);
        }

        // Delete any existing verification codes for this email
        verificationCodeRepository.deleteByEmail(user.getEmail());

        // Generate 6-digit OTP code
        String code = String.format("%06d", new java.util.Random().nextInt(1000000));
        VerificationCode verificationCode = VerificationCode.builder()
                .email(user.getEmail())
                .code(code)
                .expiryTime(java.time.LocalDateTime.now().plusMinutes(5)) // 5 minutes validity
                .build();
        verificationCodeRepository.save(verificationCode);

        // Send email
        emailService.sendVerificationEmail(user.getEmail(), code);

        return convertToUserDto(user);
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
    public LoginResponse loginWithGoogle(GoogleLoginRequest request) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    new GsonFactory()
            )
            .setAudience(Collections.singletonList(googleClientId))
            .build();

            System.out.println("DEBUG: Configured Google Client ID in backend: [" + googleClientId + "]");
            try {
                String[] parts = request.getIdToken().split("\\.");
                if (parts.length > 1) {
                    String decodedPayload = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
                    System.out.println("DEBUG: Decoded Google Token Payload: " + decodedPayload);
                }
            } catch (Exception e) {
                System.out.println("DEBUG: Failed to decode token payload: " + e.getMessage());
            }

            GoogleIdToken idToken = verifier.verify(request.getIdToken());
            if (idToken == null) {
                System.err.println("ERROR: GoogleIdTokenVerifier.verify returned null. Verification failed.");
                throw new BadRequestException("Invalid Google ID Token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");

            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> {
                        User newUser = User.builder()
                                .fullName(name != null ? name : "Google User")
                                .email(email)
                                .phone("")
                                .passwordHash(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                                .role(com.adora.entity.Role.RENTER)
                                .status(UserStatus.ACTIVE)
                                .avatarUrl(pictureUrl)
                                .build();
                        return userRepository.save(newUser);
                    });

            if (user.getStatus() == UserStatus.PENDING) {
                user.setStatus(UserStatus.ACTIVE);
                user = userRepository.save(user);
            }

            if (user.getStatus() == UserStatus.BLOCKED) {
                throw new BadRequestException("User account is blocked");
            }

            UserPrincipal userPrincipal = new UserPrincipal(user);
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userPrincipal,
                    null,
                    userPrincipal.getAuthorities()
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

        } catch (Exception e) {
            throw new BadRequestException("Google authentication failed: " + e.getMessage());
        }
    }

    @Transactional
    public void verifyEmail(VerifyEmailRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new BadRequestException("Email is already verified and active");
        }

        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new BadRequestException("User account is blocked");
        }

        VerificationCode verificationCode = verificationCodeRepository.findByEmailAndCode(request.getEmail(), request.getCode())
                .orElseThrow(() -> new BadRequestException("Invalid verification code"));

        if (verificationCode.getExpiryTime().isBefore(java.time.LocalDateTime.now())) {
            throw new BadRequestException("Verification code has expired");
        }

        // Activate user
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        // Delete verification code
        verificationCodeRepository.delete(verificationCode);
    }

    @Transactional
    public void resendVerificationCode(ResendCodeRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new BadRequestException("Email is already verified and active");
        }

        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new BadRequestException("User account is blocked");
        }

        // Delete any existing codes
        verificationCodeRepository.deleteByEmail(request.getEmail());

        // Generate new code
        String code = String.format("%06d", new java.util.Random().nextInt(1000000));
        VerificationCode verificationCode = VerificationCode.builder()
                .email(request.getEmail())
                .code(code)
                .expiryTime(java.time.LocalDateTime.now().plusMinutes(5))
                .build();

        verificationCodeRepository.save(verificationCode);

        // Send email
        emailService.sendVerificationEmail(request.getEmail(), code);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Mật khẩu hiện tại không đúng");
        }

        if (request.getOldPassword().equals(request.getNewPassword())) {
            throw new BadRequestException("Mật khẩu mới phải khác mật khẩu hiện tại");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Email không tồn tại trong hệ thống"));

        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new BadRequestException("Tài khoản của bạn đã bị khóa");
        }

        // Delete any existing codes
        verificationCodeRepository.deleteByEmail(request.getEmail());

        // Generate 6-digit OTP code
        String code = String.format("%06d", new java.util.Random().nextInt(1000000));
        VerificationCode verificationCode = VerificationCode.builder()
                .email(request.getEmail())
                .code(code)
                .expiryTime(java.time.LocalDateTime.now().plusMinutes(5)) // 5 minutes validity
                .build();
        verificationCodeRepository.save(verificationCode);

        // Send email
        emailService.sendForgotPasswordEmail(request.getEmail(), code);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Email không tồn tại trong hệ thống"));

        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new BadRequestException("Tài khoản của bạn đã bị khóa");
        }

        VerificationCode verificationCode = verificationCodeRepository.findByEmailAndCode(request.getEmail(), request.getCode())
                .orElseThrow(() -> new BadRequestException("Mã xác thực không chính xác"));

        if (verificationCode.getExpiryTime().isBefore(java.time.LocalDateTime.now())) {
            throw new BadRequestException("Mã xác thực đã hết hạn");
        }

        // Update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Delete verification code
        verificationCodeRepository.delete(verificationCode);
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
