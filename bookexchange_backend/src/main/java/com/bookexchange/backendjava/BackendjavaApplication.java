package com.bookexchange.backendjava;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Эта аннотация критична, она запускает все!
@SpringBootApplication 
public class BackendjavaApplication {

    public static void main(String[] args) {
        // Здесь запускается весь Spring Boot контекст
        SpringApplication.run(BackendjavaApplication.class, args);
    }
}