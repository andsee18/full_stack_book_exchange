package com.bookexchange.backendjava.repository;

import com.bookexchange.backendjava.model.Book;
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
public class BookRepository {

    private final JdbcTemplate jdbcTemplate;

    // маппер преобразования для
    private final RowMapper<Book> bookRowMapper = (rs, rowNum) -> {
        Book book = new Book();
        book.setId(rs.getLong("id"));
        book.setTitle(rs.getString("title"));
        book.setAuthor(rs.getString("author"));
        book.setGenre(rs.getString("genre"));
        book.setDescription(rs.getString("description"));
        book.setCondition(rs.getString("condition"));
        book.setCoverUrl(rs.getString("cover_url"));
        book.setOwnerId(rs.getLong("owner_id"));
        book.setStatus(rs.getString("status"));
        return book;
    };

    public BookRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // создать книгу важный
    public Book save(Book book) {
        final String sql = "INSERT INTO books (title, author, genre, description, condition, cover_url, owner_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, book.getTitle());
            ps.setString(2, book.getAuthor());
            ps.setString(3, book.getGenre());
            ps.setString(4, book.getDescription());
            ps.setString(5, book.getCondition());
            ps.setString(6, book.getCoverUrl());
            ps.setLong(7, book.getOwnerId());
            ps.setString(8, book.getStatus());
            return ps;
        }, keyHolder);

        Long generatedId = keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;
        if (generatedId != null) {
            book.setId(generatedId);
        }
        return book;
    }

    // найти все книги
    public List<Book> findAll() {
        final String sql = "SELECT id, title, author, genre, description, condition, cover_url, owner_id, status FROM books ORDER BY id DESC";
        return jdbcTemplate.query(sql, bookRowMapper);
    }

    // найти книгу важный
    public Optional<Book> findById(Long id) {
        final String sql = "SELECT id, title, author, genre, description, condition, cover_url, owner_id, status FROM books WHERE id = ?";
        try {
            Book book = jdbcTemplate.queryForObject(sql, bookRowMapper, id);
            return Optional.ofNullable(book);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    // обновить книгу важный
    public int update(Book book) {
        final String sql = "UPDATE books SET title = ?, author = ?, genre = ?, description = ?, condition = ?, cover_url = ?, owner_id = ?, status = ? WHERE id = ?";
        return jdbcTemplate.update(sql,
            book.getTitle(),
            book.getAuthor(),
            book.getGenre(),
            book.getDescription(),
            book.getCondition(),
            book.getCoverUrl(),
            book.getOwnerId(),
            book.getStatus(),
            book.getId());
    }

    // удалить книгу важный
    public int delete(Long id) {
        final String sql = "DELETE FROM books WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }

    // комментарий важный ключевой
    public int updateStatusWhereLowerEquals(String fromStatus, String toStatus) {
        final String sql = "UPDATE books SET status = ? WHERE lower(status) = lower(?)";
        return jdbcTemplate.update(sql, toStatus, fromStatus);
    }
}