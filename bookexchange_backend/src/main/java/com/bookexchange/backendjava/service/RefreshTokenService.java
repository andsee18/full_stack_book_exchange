package com.bookexchange.backendjava.service;

import com.bookexchange.backendjava.model.RefreshToken;
import com.bookexchange.backendjava.model.User;
import com.bookexchange.backendjava.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository repo;

    @Value("${app.jwtRefreshExpirationMs}")
    private Long refreshExpirationMs;

    public RefreshTokenService(RefreshTokenRepository repo) {
        this.repo = repo;
    }

    public RefreshToken createRefreshToken(User user) {
        RefreshToken rt = new RefreshToken();
        rt.setUserId(user.getId());
        rt.setToken(UUID.randomUUID().toString());
        rt.setExpiryDate(Instant.now().toEpochMilli() + refreshExpirationMs);
        return repo.save(rt);
    }

    public Optional<RefreshToken> findByToken(String token) {
        return repo.findByToken(token);
    }

    public boolean verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate() < Instant.now().toEpochMilli()) {
            repo.deleteById(token.getId());
            return false;
        }
        return true;
    }

    // удаление ротации выхода
    public void deleteById(Long id) {
        repo.deleteById(id);
    }

    // удаление всех токенов пользователя
    public void deleteByUserId(Long userId) {
        repo.deleteByUserId(userId);
    }
}
