package com.bookexchange.backendjava.controller; 

import com.bookexchange.backendjava.service.PermissionDeniedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice // Делает этот класс глобальным обработчиком для всех контроллеров
public class GlobalExceptionHandler {

    // перехватывает исключение которое
    @ExceptionHandler(PermissionDeniedException.class)
    public ResponseEntity<String> handlePermissionDeniedException(PermissionDeniedException e) {
        System.err.println("GLOBAL HANDLER: Caught PermissionDeniedException. Returning 403.");
        return new ResponseEntity<>(e.getMessage(), HttpStatus.FORBIDDEN); // 403 Forbidden
    }

    // возвращаем сообщением важный
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(IllegalArgumentException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("message", e.getMessage());
        response.put("error", "BadRequest");
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // обработка всех остальных
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGlobalException(Exception e, WebRequest request) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        response.put("message", e.getMessage());
        response.put("error", e.getClass().getSimpleName());
        
        // логируем консоль важный
        System.err.println("=== EXCEPTION OCCURRED ===");
        System.err.println("Type: " + e.getClass().getName());
        System.err.println("Message: " + e.getMessage());
        e.printStackTrace();
        System.err.println("========================");
        
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}