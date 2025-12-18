package com.bookexchange.backendjava.service;

// простая обработки для
public class PermissionDeniedException extends RuntimeException {
    public PermissionDeniedException(String message) {
        super(message);
    }
}