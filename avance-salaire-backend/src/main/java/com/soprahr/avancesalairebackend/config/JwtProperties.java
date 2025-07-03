package com.soprahr.avancesalairebackend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.ConstructorBinding;

@ConfigurationProperties(prefix = "jwt")
public record JwtProperties(
    String secret,
    long expiration
) {
    @ConstructorBinding
    public JwtProperties {}
}