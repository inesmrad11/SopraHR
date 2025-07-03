package com.soprahr.avancesalairebackend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
public class EnvConfig {
    
    @Bean
    @Profile("!prod")
    public String loadDevEnv() {
        // This will load .env file in development
        return "Development environment loaded";
    }
    
    @Bean
    public JwtProperties jwtProperties(
            @Value("${JWT_SECRET:}") String secret,
            @Value("${JWT_EXPIRATION:86400000}") long expiration) {
        return new JwtProperties(secret, expiration);
    }
    
    @Bean
    public CorsProperties corsProperties(
            @Value("${CORS_ALLOWED_ORIGINS:}") String allowedOrigins) {
        return new CorsProperties(allowedOrigins);
    }
    
    public record JwtProperties(String secret, long expiration) {}
    public record CorsProperties(String allowedOrigins) {}
}
