package com.soprahr.avancesalairebackend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import com.soprahr.avancesalairebackend.service.user.JwtService;

@Component
@RequiredArgsConstructor
public class TokenProvider {
    private final JwtService jwtService;
    
    public Long getUserIdFromJWT(String token) {
        return jwtService.extractUserId(token);
    }
}
