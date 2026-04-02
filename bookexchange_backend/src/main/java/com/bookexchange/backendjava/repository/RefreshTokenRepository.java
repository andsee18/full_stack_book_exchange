package com.bookexchange.backendjava.repository;

import com.bookexchange.backendjava.model.RefreshToken;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.Optional;

@Repository
public class RefreshTokenRepository {

    private final JdbcTemplate jdbcTemplate;

    public RefreshTokenRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<RefreshToken> rowMapper = (rs, rowNum) -> {
        RefreshToken t = new RefreshToken();
        t.setId(rs.getLong("id"));
        t.setToken(rs.getString("token"));
        t.setUserId(rs.getLong("user_id"));
        t.setExpiryDate(rs.getLong("expiry_date"));
        return t;
    };

    public RefreshToken save(RefreshToken token) {
        final String sql = "INSERT INTO refresh_tokens (token, user_id, expiry_date) VALUES (?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, token.getToken());
            ps.setLong(2, token.getUserId());
            ps.setLong(3, token.getExpiryDate());
            return ps;
        }, keyHolder);
        Number key = keyHolder.getKey();
        if (key != null) token.setId(key.longValue());
        return token;
    }

    // поиск значению токена
    public Optional<RefreshToken> findByToken(String token) {
        final String sql = "SELECT id, token, user_id, expiry_date FROM refresh_tokens WHERE token = ?";
        try {
            RefreshToken t = jdbcTemplate.queryForObject(sql, rowMapper, token);
            return Optional.ofNullable(t);
        } catch (org.springframework.dao.EmptyResultDataAccessException ex) {
            return Optional.empty();
        }
    }

    // удаление всех токенов пользователя
    public void deleteByUserId(Long userId) {
        final String sql = "DELETE FROM refresh_tokens WHERE user_id = ?";
        jdbcTemplate.update(sql, userId);
    }

    // удаление токена важный
    public void deleteById(Long id) {
        final String sql = "DELETE FROM refresh_tokens WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }
}
