package com.soprahr.avancesalairebackend.config;

import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class EnvLogger {
    @Value("${JWT_SECRET}")
    private String jwtSecret;

    @PostConstruct
    public void init() {
        if (jwtSecret != null && !jwtSecret.isEmpty()) {
            System.out.println("✅ JWT_SECRET loaded successfully: " + jwtSecret.substring(0, 5) + "...");
        } else {
            System.out.println("⚠️ JWT_SECRET is not set!");
        }
    }
}
