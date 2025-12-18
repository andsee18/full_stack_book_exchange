package com.bookexchange.backendjava.controller;

import com.bookexchange.backendjava.model.User;
import com.bookexchange.backendjava.model.RefreshToken;
import com.bookexchange.backendjava.security.JwtTokenUtil;
import com.bookexchange.backendjava.service.RefreshTokenService;
import com.bookexchange.backendjava.service.UserService;
import com.bookexchange.backendjava.service.PermissionDeniedException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
// исправление добавляем для
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://localhost:5000"})
public class UserController {

    private final UserService userService;
    private final JwtTokenUtil jwtTokenUtil;
    private final RefreshTokenService refreshTokenService;

    @Value("${app.jwtRefreshExpirationMs}")
    private Long refreshExpirationMs;

    public UserController(UserService userService, JwtTokenUtil jwtTokenUtil, RefreshTokenService refreshTokenService) {
        this.userService = userService;
        this.jwtTokenUtil = jwtTokenUtil;
        this.refreshTokenService = refreshTokenService;
    }

    // регистрация нового пользователя
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public User create(@RequestBody User user) {
        User savedUser = userService.register(user);
        // не возвращаем хеш пароля клиенту
        savedUser.setPassword(null);
        return savedUser;
    }

    // вход аутентификация пользователя
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user, jakarta.servlet.http.HttpServletResponse response) {
        // legacy endpoint: возвращаем токены как /api/auth/login
        return userService.authenticate(user.getUsername(), user.getPassword()).map(u -> {
            String accessToken = jwtTokenUtil.generateToken(u.getId());
            RefreshToken refresh = refreshTokenService.createRefreshToken(u);

            org.springframework.http.ResponseCookie cookie = org.springframework.http.ResponseCookie.from("refreshToken", refresh.getToken())
                    .httpOnly(true)
                    .path("/api/auth")
                    .maxAge(refreshExpirationMs != null ? refreshExpirationMs / 1000 : 0)
                    .sameSite("Strict")
                    .secure(false)
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
            return ResponseEntity.ok(Map.of("accessToken", accessToken, "tokenType", "Bearer"));
        }).orElseGet(() -> ResponseEntity.status(401).body(Map.of("error", "Invalid credentials")));
    }

    // получить всех пользователей
    @GetMapping
    public List<User> findAll() {
        return userService.findAll();
    }

    // получить пользователя важный
    @GetMapping("/{id}")
    public ResponseEntity<User> findById(@PathVariable Long id) {
        return userService.findById(id)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // обновить пользователя важный
    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable Long id, @RequestBody User user) {
        Long authUserId = getAuthenticatedUserId();
        if (authUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (!authUserId.equals(id)) {
            throw new PermissionDeniedException("Нельзя редактировать чужой профиль");
        }

        return userService.update(id, user)
            .map(u -> {
                u.setPassword(null);
                return ResponseEntity.ok(u);
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // смена пароля нужно
    @PostMapping("/{id}/change-password")
    public ResponseEntity<Void> changePassword(@PathVariable Long id, @RequestBody ChangePasswordRequest request) {
        Long authUserId = getAuthenticatedUserId();
        if (authUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (!authUserId.equals(id)) {
            throw new PermissionDeniedException("Нельзя менять пароль чужого аккаунта");
        }

        boolean ok = userService.changePassword(id, request.oldPassword(), request.newPassword());
        if (!ok) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    // удалить пользователя важный
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Long authUserId = getAuthenticatedUserId();
        if (authUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (!authUserId.equals(id)) {
            throw new PermissionDeniedException("Нельзя удалять чужой аккаунт");
        }

        boolean deleted = userService.delete(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    private Long getAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        Object principal = auth.getPrincipal();
        if (principal == null) return null;

        try {
            return Long.parseLong(String.valueOf(principal));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public record ChangePasswordRequest(String oldPassword, String newPassword) {}

    // удалено временный метод
}