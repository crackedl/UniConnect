package com.uniconnect.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Se aplică pe toate URL-urile
                .allowedOrigins(
                        "http://localhost:5173", // <-- VITE / REACT (Foarte Important)
                        "http://localhost:3000"  // React standard (opțional, just in case)
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true); // Permite trimiterea de cookies/tokeni
    }
}