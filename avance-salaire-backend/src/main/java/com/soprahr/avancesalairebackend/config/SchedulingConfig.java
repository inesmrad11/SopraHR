package com.soprahr.avancesalairebackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
public class SchedulingConfig {
    // This enables the @Scheduled annotation to work
    // No additional dependencies needed as scheduling is part of spring-boot-starter
}
