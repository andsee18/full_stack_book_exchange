package com.bookexchange.backendjava.controller;

import com.bookexchange.backendjava.model.RefreshToken;
import com.bookexchange.backendjava.model.User;
import com.bookexchange.backendjava.service.RefreshTokenService;
import com.bookexchange.backendjava.service.UserService;
import com.bookexchange.backendjava.security.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtTokenUtil jwtTokenUtil;
    private final RefreshTokenService refreshTokenService;

    @Value("${app.jwtRefreshExpirationMs}")
    private Long refreshExpirationMs;

    public AuthController(UserService userService, JwtTokenUtil jwtTokenUtil, RefreshTokenService refreshTokenService) {
        this.userService = userService;
        this.jwtTokenUtil = jwtTokenUtil;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User creds, HttpServletResponse response) {
        return userService.authenticate(creds.getUsername(), creds.getPassword()).map(user -> {
            String accessToken = jwtTokenUtil.generateToken(user.getId());
            RefreshToken refresh = refreshTokenService.createRefreshToken(user);

            ResponseCookie cookie = ResponseCookie.from("refreshToken", refresh.getToken())
                    .httpOnly(true)
                    .path("/api/auth")
                    .maxAge(refreshExpirationMs / 1000)
                    .sameSite("Strict")
                    .secure(false)
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
            return ResponseEntity.ok(Map.of("accessToken", accessToken, "tokenType", "Bearer"));
        }).orElseGet(() -> ResponseEntity.status(401).body(java.util.Map.of("error", "Invalid credentials")));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User newUser) {
        try {
            User registeredUser = userService.register(newUser);
            return ResponseEntity.status(201).body(Map.of(
                    "id", registeredUser.getId(),
                    "username", registeredUser.getUsername(),
                    "email", registeredUser.getEmail(),
                    "message", "User registered successfully"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request, HttpServletResponse response) {
        String tokenValue = null;
        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if ("refreshToken".equals(c.getName())) { tokenValue = c.getValue(); break; }
            }
        }
        if (tokenValue == null) return ResponseEntity.status(401).body(java.util.Map.of("error", "No refresh token"));

        return refreshTokenService.findByToken(tokenValue).map(rt -> {
            if (!refreshTokenService.verifyExpiration(rt)) return ResponseEntity.status(401).body(java.util.Map.of("error", "Refresh token expired"));
            String newAccess = jwtTokenUtil.generateToken(rt.getUserId());
            // комментарий важный ключевой
            ResponseCookie cookie = ResponseCookie.from("refreshToken", rt.getToken())
                    .httpOnly(true)
                    .path("/api/auth")
                    .maxAge(refreshExpirationMs / 1000)
                    .sameSite("Strict")
                    .secure(false)
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
            return ResponseEntity.ok(Map.of("accessToken", newAccess, "tokenType", "Bearer"));
        }).orElseGet(() -> ResponseEntity.status(401).body(java.util.Map.of("error", "Invalid refresh token")));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        String tokenValue = null;
        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) if ("refreshToken".equals(c.getName())) tokenValue = c.getValue();
        }
        if (tokenValue != null) {
            refreshTokenService.findByToken(tokenValue).ifPresent(rt -> refreshTokenService.deleteByUserId(rt.getUserId()));
        }
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .path("/api/auth")
                .maxAge(0)
                .sameSite("Strict")
                .secure(false)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok().build();
    }
}
