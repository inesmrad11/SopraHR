package com.soprahr.avancesalairebackend.service.user;

import com.soprahr.avancesalairebackend.model.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {
    @Value("${jwt.secret}")
    private String secretKey;
    
    @Value("${jwt.expiration:86400000}")
    private long jwtExpirationMs;
    
    @Value("${jwt.refresh-expiration:604800000}")
    private long refreshExpirationMs;
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Token cannot be null or empty");
        }
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        if (userDetails instanceof User user) {
            extraClaims.put("id", user.getId());
            extraClaims.put("firstname", user.getFirstName());
            extraClaims.put("email", user.getEmail());
            extraClaims.put("role", user.getRole().name());
        }

        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateToken(User user) {
        return generateToken(new HashMap<>(), user);
    }

    public boolean isTokenValid(String token,
                                UserDetails userDetails)
    {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSignInKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            throw new SecurityException("Invalid JWT token: " + e.getMessage());
        }
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Key getSignInKey() {
        try {
            byte[] keyBytes = Decoders.BASE64.decode(secretKey);
            if (keyBytes.length < 32) { // 256 bits
                throw new IllegalStateException("JWT secret key must be at least 256 bits (32 bytes)");
            }
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (Exception e) {
            throw new SecurityException("Failed to initialize JWT signing key", e);
        }
    }

    public Long extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("id", Long.class);
    }
}
