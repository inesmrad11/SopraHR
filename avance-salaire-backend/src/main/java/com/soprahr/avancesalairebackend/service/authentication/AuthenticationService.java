package com.soprahr.avancesalairebackend.service.authentication;

import com.soprahr.avancesalairebackend.exception.AccountLockedException;
import com.soprahr.avancesalairebackend.exception.AuthenticationServiceException;
import com.soprahr.avancesalairebackend.exception.InvalidPasswordException;
import com.soprahr.avancesalairebackend.model.entity.User;
import com.soprahr.avancesalairebackend.model.request.AuthenticationRequest;
import com.soprahr.avancesalairebackend.model.response.AuthenticationResponse;
import com.soprahr.avancesalairebackend.repository.UserRepository;
import com.soprahr.avancesalairebackend.service.user.CaptchaService;
import com.soprahr.avancesalairebackend.service.user.JwtService;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class AuthenticationService {
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCK_TIME_DURATION = TimeUnit.HOURS.toMillis(1);
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CaptchaService captchaService;
    
    @Value("${app.security.require-captcha:true}")
    private boolean requireCaptcha;

    public AuthenticationService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager, CaptchaService captchaService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.captchaService = captchaService;
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        validateAuthenticationRequest(request);
        
        String email = request.getEmail().toLowerCase().trim();
        String clientIp = getClientIp();
        
        log.info("Authentication attempt for user: {} from IP: {}", email, clientIp);
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
                
        checkIfAccountIsLocked(user);
        
        try {
            // Verify CAPTCHA if required
            if (requireCaptcha) {
                verifyCaptcha(request.getRecaptchaToken(), email);
            }
            
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Reset failed login attempts on successful authentication
            resetFailedLoginAttempts(user);
            
            // Generate tokens
            String accessToken = jwtService.generateToken(user);
            
            // Update user's last login
            user.setLastLogin(LocalDateTime.now());
            user.setLastLoginIp(clientIp);
            userRepository.save(user);
            
            log.info("User {} successfully authenticated from IP: {}", email, clientIp);
            
            return AuthenticationResponse.builder()
                    .token(accessToken)
                    .message("Authentication successful")
                    .build();
                    
        } catch (AuthenticationException ex) {
            handleFailedLogin(user);
            throw ex;
        }
    }

    @Transactional
    public AuthenticationResponse refreshToken(String refreshToken) {
        if (StringUtils.isBlank(refreshToken)) {
            throw new BadCredentialsException("Refresh token is required");
        }

        try {
            String userEmail = jwtService.extractUsername(refreshToken);
            if (userEmail == null) {
                throw new BadCredentialsException("Invalid refresh token: No user associated with token");
            }

            var user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));

            checkIfAccountIsLocked(user);

            if (!jwtService.isTokenValid(refreshToken, user)) {
                throw new BadCredentialsException("Invalid refresh token: Token validation failed");
            }

            String newAccessToken = jwtService.generateToken(user);

            log.info("Successfully refreshed token for user: {}", userEmail);
            
            return AuthenticationResponse.builder()
                    .token(newAccessToken)
                    .message("Token refreshed successfully")
                    .build();
                    
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Refresh token validation failed: {}", e.getMessage());
            throw new BadCredentialsException("Invalid refresh token: " + e.getMessage());
        } catch (Exception e) {
            log.error("Error refreshing token", e);
            throw new AuthenticationServiceException("Failed to refresh token: " + e.getMessage());
        }
    }

    // Helper Methods
    
    private void validateAuthenticationRequest(AuthenticationRequest request) {
        if (request == null || request.getEmail() == null || request.getPassword() == null) {
            throw new BadCredentialsException("Email and password are required");
        }
        
        if (request.getEmail().isBlank() || request.getPassword().isBlank()) {
            throw new BadCredentialsException("Email and password cannot be empty");
        }
        
        if (request.getPassword().length() < 8) {
            throw new InvalidPasswordException("Password must be at least 8 characters long");
        }
    }
    
    private String getClientIp() {
        HttpServletRequest request = 
            ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes())
                .getRequest();
                
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
    
    private void checkIfAccountIsLocked(User user) {
        if (user == null) {
            throw new BadCredentialsException("Invalid credentials");
        }

        int failedAttempts = user.getFailedAttempts();
        if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
            LocalDateTime lockTime = user.getLockTime();
            if (lockTime == null) {
                user.setLockTime(LocalDateTime.now());
                userRepository.save(user);
                throw new AccountLockedException("Account is locked. Please try again later.");
            }

            long lockTimeInMillis = lockTime.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
            long currentTimeInMillis = System.currentTimeMillis();
            long remainingLockTime = lockTimeInMillis + LOCK_TIME_DURATION - currentTimeInMillis;
            
            if (remainingLockTime > 0) {
                long remainingMinutes = TimeUnit.MILLISECONDS.toMinutes(remainingLockTime);
                throw new AccountLockedException(
                    String.format("Account is locked. Please try again in %d minutes.", remainingMinutes + 1)
                );
            } else {
                // Lock time has expired, reset the account
                resetFailedLoginAttempts(user);
            }
        }
    }
    
    private void verifyCaptcha(String recaptchaToken, String email) {
        if (!requireCaptcha) {
            return;
        }

        if (StringUtils.isBlank(recaptchaToken)) {
            log.warn("Missing reCAPTCHA token for user: {}", email);
            throw new BadCredentialsException("Security verification required. Please complete the CAPTCHA.");
        }
        
        try {
            boolean isCaptchaValid = captchaService.verifyCaptcha(recaptchaToken);
            if (!isCaptchaValid) {
                log.warn("Invalid reCAPTCHA for user: {}", email);
                throw new BadCredentialsException("Security verification failed. Please try again.");
            }
        } catch (Exception e) {
            log.error("CAPTCHA verification error for user: {}", email, e);
            throw new AuthenticationServiceException("Security verification service unavailable. Please try again later.", e);
        }
    }

    @Transactional
    private void handleFailedLogin(User user) {
        if (user == null) {
            log.warn("Failed login attempt for non-existent user");
            return;
        }

        int failedAttempts = user.getFailedAttempts() + 1;
        user.setFailedAttempts(failedAttempts);
        
        if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
            user.setLockTime(LocalDateTime.now());
            log.warn("User account locked: {}", user.getEmail());
        }
        
        try {
            userRepository.save(user);
            log.warn("Failed login attempt for user: {} - Attempt {}/{}", 
                user.getEmail(), failedAttempts, MAX_FAILED_ATTEMPTS);
        } catch (Exception e) {
            log.error("Failed to update failed login attempts for user: {}", user.getEmail(), e);
            throw new AuthenticationServiceException("Failed to process login attempt", e);
        }
    }

    @Transactional
    private void resetFailedLoginAttempts(User user) {
        if (user == null) {
            return;
        }

        if (user.getFailedAttempts() > 0 || user.getLockTime() != null) {
            user.setFailedAttempts(0);
            user.setLockTime(null);
            try {
                userRepository.save(user);
                log.info("Reset failed login attempts for user: {}", user.getEmail());
            } catch (Exception e) {
                log.error("Failed to reset failed login attempts for user: {}", user.getEmail(), e);
                throw new AuthenticationServiceException("Failed to reset login attempts", e);
            }
        }
    }
}
