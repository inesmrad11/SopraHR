package com.soprahr.avancesalairebackend.service.user;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

@Service
public class CaptchaService {
    private static final Logger logger = LoggerFactory.getLogger(CaptchaService.class);
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${recaptcha.secret}")
    private String recaptchaSecret;
    
    @Value("${recaptcha.verify-url}")
    private String recaptchaVerifyUrl;

    public boolean verifyCaptcha(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("secret", recaptchaSecret);
        params.add("response", token);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(recaptchaVerifyUrl, request, Map.class);
            Map body = response.getBody();
            logger.info("Captcha verification response: {}", body);
            if (body != null && body.containsKey("success")) {
                return Boolean.TRUE.equals(body.get("success"));
            }
            return false;
        } catch (Exception e) {
            logger.error("Captcha verification error: {}", e.getMessage());
            return false;
        }
    }
}
