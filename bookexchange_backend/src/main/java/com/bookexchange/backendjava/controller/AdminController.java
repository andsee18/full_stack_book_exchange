package com.bookexchange.backendjava.controller;

import com.bookexchange.backendjava.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://localhost:5000"})
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> setRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String role = body.get("role");
        if (role == null || role.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "role is required"));
        }

        String normalized = role.trim().toUpperCase();
        if (!normalized.equals("USER") && !normalized.equals("ADMIN")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "role must be USER or ADMIN"));
        }

        boolean ok = userService.setUserRole(id, normalized);
        if (!ok) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "user not found"));
        }
        return ResponseEntity.ok(Map.of("id", id, "role", normalized));
    }
}