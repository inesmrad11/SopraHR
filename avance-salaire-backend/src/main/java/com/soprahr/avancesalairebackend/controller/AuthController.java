package com.soprahr.avancesalairebackend.controller;

import com.soprahr.avancesalairebackend.model.request.AuthenticationRequest;
import com.soprahr.avancesalairebackend.model.response.AuthenticationResponse;
import com.soprahr.avancesalairebackend.repository.UserRepository;
import com.soprahr.avancesalairebackend.service.authentication.AuthenticationService;
import com.soprahr.avancesalairebackend.service.user.JwtService;
import com.soprahr.avancesalairebackend.service.user.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    @Autowired
    private final UserRepository userRepository;
    @Autowired
    private final JwtService jwtService;
    @Autowired
    private final OtpService otpService;
    @Autowired
    private final AuthenticationService authenticationService;

    /**
     * Authenticate user with email and password
     * @param request Authentication request containing email, password, and optional reCAPTCHA token
     * @return JWT token and success message
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthenticationRequest request) {
        try {
            AuthenticationResponse response = authenticationService.authenticate(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace(); // Ajout du log
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Refresh authentication token
     * @return New JWT token
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String refreshToken = authHeader.substring(7);
                AuthenticationResponse response = authenticationService.refreshToken(refreshToken);
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body("Invalid authorization header");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Send OTP to user's email for 2FA
     * @param email User's email address
     * @return Success message or error
     */
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestParam String email) {
        try {
            // Check if user exists with this email
            if (!userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body("Aucun utilisateur trouvé avec cet email");
            }
            
            // Generate and send OTP
            otpService.generateOtp(email);
            return ResponseEntity.ok("Code de vérification envoyé avec succès");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erreur lors de l'envoi du code de vérification");
        }
    }

    /**
     * Verify OTP for 2FA
     * @param email User's email
     * @param otp The OTP to verify
     * @return JWT token if OTP is valid, error otherwise
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @RequestParam String email,
            @RequestParam String otp) {
        try {
            // Verify OTP
            if (!otpService.verifyOtp(email, otp)) {
                return ResponseEntity.badRequest().body("Code de vérification invalide ou expiré");
            }

            // Generate JWT token
            var user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            var jwtToken = jwtService.generateToken(user);
            
            return ResponseEntity.ok(jwtToken);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erreur lors de la vérification du code");
        }
    }

    /**
     * Unlock user account (for development/testing purposes)
     * @param email User's email
     * @return Success message
     */
    @PostMapping("/unlock-account")
    public ResponseEntity<?> unlockAccount(@RequestParam String email) {
        try {
            var user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            
            // Reset failed attempts and unlock account
            user.setFailedAttempts(0);
            user.setLockTime(null);
            user.setEnabled(true);
            userRepository.save(user);
            
            return ResponseEntity.ok("Compte déverrouillé avec succès");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erreur lors du déverrouillage du compte");
        }
    }
}
