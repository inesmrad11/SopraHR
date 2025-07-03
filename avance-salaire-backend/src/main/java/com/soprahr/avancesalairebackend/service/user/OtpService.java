package com.soprahr.avancesalairebackend.service.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private static class OtpData {
        final String code;
        final Instant expiryTime;

        OtpData(String code, Instant expiryTime) {
            this.code = code;
            this.expiryTime = expiryTime;
        }
    }

    @Autowired
    private final JavaMailSender mailSender;
    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();

    @Value("${spring.mail.username}")
    private String from;

    /**
     * Time in minutes after which OTP expires (5 minutes)
     */
    private static final int OTP_EXPIRATION_MINUTES = 5;

    /**
     * Generate and send OTP to the provided email
     * @param email User's email address
     * @return The generated OTP (for testing purposes)
     */
    public String generateOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        Instant expiryTime = Instant.now().plusSeconds(OTP_EXPIRATION_MINUTES * 60);
        otpStorage.put(email, new OtpData(otp, expiryTime));
        sendOtpEmail(email, otp);
        return otp;
    }

    /**
     * Send OTP email to the user
     */
    private void sendOtpEmail(String email, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setFrom(from);
            message.setSubject("Votre code de vérification");
            message.setText(String.format(
                "Bonjour,\n\n" +
                "Votre code de vérification est : %s\n" +
                "Ce code est valable pendant %d minutes.\n\n" +
                "Ne partagez ce code avec personne.", 
                otp, OTP_EXPIRATION_MINUTES
            ));

            mailSender.send(message);
            log.info("OTP sent to {}", email);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}", email, e);
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    /**
     * Verify if the provided OTP is valid for the given email
     */
    public boolean verifyOtp(String email, String otp) {
        OtpData otpData = otpStorage.get(email);
        if (otpData == null) {
            return false;
        }
        
        // Check if OTP is expired
        if (Instant.now().isAfter(otpData.expiryTime)) {
            otpStorage.remove(email);
            return false;
        }
        
        boolean isValid = otpData.code.equals(otp);
        if (isValid) {
            otpStorage.remove(email);
        }
        return isValid;
    }

    /**
     * Invalidate OTP for a specific email
     */
    public void invalidateOtp(String email) {
        otpStorage.remove(email);
    }

    /**
     * Clean up expired OTPs periodically (runs every hour)
     */
    @Scheduled(fixedRate = 3_600_000) // 1 hour
    public void cleanupExpiredOtps() {
        Instant now = Instant.now();
        otpStorage.entrySet().removeIf(entry -> now.isAfter(entry.getValue().expiryTime));
    }
}
