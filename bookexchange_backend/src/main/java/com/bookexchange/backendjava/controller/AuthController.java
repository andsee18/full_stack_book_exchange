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
        // вход пользователя
        return userService.authenticate(creds.getUsername(), creds.getPassword()).map(user -> {
            String accessToken = jwtTokenUtil.generateToken(user.getId(), user.getRole());
            RefreshToken refresh = refreshTokenService.createRefreshToken(user);

            ResponseCookie cookie = ResponseCookie.from("refreshToken", refresh.getToken())
                    .httpOnly(true)
                    .path("/api/auth")
                    .maxAge(refreshExpirationMs / 1000)
                    .sameSite("Strict")
                    .secure(false)
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
            return ResponseEntity.ok(Map.of(
                    "accessToken", accessToken,
                    "tokenType", "Bearer",
                    "userId", user.getId(),
                    "role", user.getRole() != null ? user.getRole() : "USER"
            ));
        }).orElseGet(() -> ResponseEntity.status(401).body(java.util.Map.of("error", "Invalid credentials")));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User newUser) {
        // регистрация нового пользователя
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
        // обновление токена доступа
        String tokenValue = null;
        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if ("refreshToken".equals(c.getName())) { tokenValue = c.getValue(); break; }
            }
        }
        if (tokenValue == null) return ResponseEntity.status(401).body(java.util.Map.of("error", "No refresh token"));

        return refreshTokenService.findByToken(tokenValue)
            .map(rt -> {
                // проверка срока действия
                if (!refreshTokenService.verifyExpiration(rt)) {
                    // токен истек
                    return ResponseEntity.status(403).body(java.util.Map.of("error", "Refresh token was expired. Please make a new signin request"));
                }

                // ротация токена
                refreshTokenService.deleteById(rt.getId());

                // создание новой пары токенов
                User user = userService.findById(rt.getUserId()).orElseThrow(() -> new RuntimeException("User not found"));
                RefreshToken newRt = refreshTokenService.createRefreshToken(user);

                // генерация нового токена
                String newAccess = jwtTokenUtil.generateToken(user.getId(), user.getRole());

                // отправка нового токена защищенной
                ResponseCookie cookie = ResponseCookie.from("refreshToken", newRt.getToken())
                        .httpOnly(true)
                        .path("/api/auth")
                        .maxAge(refreshExpirationMs / 1000)
                        .sameSite("Strict")
                        .secure(false)
                        .build();
                response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

                return ResponseEntity.ok(Map.of(
                        "accessToken", newAccess,
                        "tokenType", "Bearer",
                        "userId", user.getId(),
                        "role", user.getRole() != null ? user.getRole() : "USER"
                ));
            })
            .orElseGet(() -> ResponseEntity.status(403).body(java.util.Map.of("error", "Invalid refresh token")));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        String tokenValue = null;
        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) if ("refreshToken".equals(c.getName())) tokenValue = c.getValue();
        }
        if (tokenValue != null) {
            // точечный выход отзыв токена
            refreshTokenService.findByToken(tokenValue).ifPresent(rt -> refreshTokenService.deleteById(rt.getId()));
        }
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .path("/api/auth")
                .maxAge(0)
                .sameSite("Strict")
                .secure(false)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok().body(Map.of("message", "Logout successful"));
    }
}
