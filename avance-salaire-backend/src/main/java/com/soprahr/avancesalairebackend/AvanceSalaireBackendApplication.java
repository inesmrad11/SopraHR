package com.soprahr.avancesalairebackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AvanceSalaireBackendApplication {
    public static void main(String[] args) {
        // Set default profile to dev for development
        System.setProperty("spring.profiles.default", "dev");
        SpringApplication.run(AvanceSalaireBackendApplication.class, args);
    }
}