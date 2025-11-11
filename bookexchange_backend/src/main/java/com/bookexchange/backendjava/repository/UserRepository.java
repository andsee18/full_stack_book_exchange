package com.bookexchange.backendjava.repository;

import com.bookexchange.backendjava.model.User;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
public class UserRepository {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<User> userRowMapper = (rs, rowNum) -> {
        User user = new User();
        user.setId(rs.getLong("id"));
        user.setUsername(rs.getString("username"));
        user.setPassword(rs.getString("password")); // ВНИМАНИЕ: Пароль возвращается для проверки
        user.setLocation(rs.getString("location"));
        user.setRating(rs.getDouble("rating"));
        return user;
    };

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // CREATE (POST)
    public User save(User user) {
        final String sql = "INSERT INTO users (username, password, location, rating) VALUES (?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, user.getUsername());
            ps.setString(2, user.getPassword());
            ps.setString(3, user.getLocation());
            ps.setDouble(4, user.getRating());
            return ps;
        }, keyHolder);

        Long generatedId = keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;
        if (generatedId != null) {
            user.setId(generatedId);
        }
        return user;
    }

    // READ ONE (GET)
    public Optional<User> findById(Long id) {
        final String sql = "SELECT id, username, password, location, rating FROM users WHERE id = ?";
        try {
            User user = jdbcTemplate.queryForObject(sql, userRowMapper, id);
            return Optional.ofNullable(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    // НОВЫЙ МЕТОД: Поиск по имени пользователя для логина
    public Optional<User> findByUsername(String username) {
        final String sql = "SELECT id, username, password, location, rating FROM users WHERE username = ?";
        try {
            User user = jdbcTemplate.queryForObject(sql, userRowMapper, username);
            return Optional.ofNullable(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    // READ ALL (GET)
    public List<User> findAll() {
        final String sql = "SELECT id, username, password, location, rating FROM users";
        return jdbcTemplate.query(sql, userRowMapper);
    }

    // UPDATE (PUT)
    public int update(User user) {
        final String sql = "UPDATE users SET username = ?, password = ?, location = ?, rating = ? WHERE id = ?";
        return jdbcTemplate.update(sql,
            user.getUsername(),
            user.getPassword(),
            user.getLocation(),
            user.getRating(),
            user.getId());
    }

    // DELETE (DELETE)
    public int delete(Long id) {
        final String sql = "DELETE FROM users WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }
}