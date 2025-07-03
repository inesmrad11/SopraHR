package com.soprahr.avancesalairebackend.controller;

import com.soprahr.avancesalairebackend.repository.UserRepository;
import com.soprahr.avancesalairebackend.service.user.JwtService;
import com.soprahr.avancesalairebackend.service.user.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final OtpService otpService;

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
}
