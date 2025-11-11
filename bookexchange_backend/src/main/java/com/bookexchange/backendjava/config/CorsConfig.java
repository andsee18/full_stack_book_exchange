package com.bookexchange.backendjava.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration // <-- ЭТО КРИТИЧЕСКИ ВАЖНО
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Разрешаем запросы с React-фронтенда
        registry.addMapping("/api/**") 
            .allowedOrigins("http://localhost:3000") // ТОЧНЫЙ АДРЕС ФРОНТЕНДА
            .allowedMethods("GET", "POST", "PUT", "DELETE") 
            .allowedHeaders("*") 
            .allowCredentials(true); 
    }
}