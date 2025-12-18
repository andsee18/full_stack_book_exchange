package com.bookexchange.backendjava.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.util.pattern.PathPatternParser;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // критично отключаем дефолтный
        registry.setOrder(-1); // Приоритет выше дефолтного
        
        // регистрируем только для
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
        
        // регистрируем для важный
        registry.addResourceHandler("/webjars/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/");
        
        // важно регистрируем важный
    }

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        // решение игнорируем при
        PathPatternParser parser = new PathPatternParser();
        parser.setMatchOptionalTrailingSeparator(true);
        configurer.setPatternParser(parser);
    }
}
