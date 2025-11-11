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

    // маппер для преобразования строки БД в объект Book
    private final RowMapper<Book> bookRowMapper = (rs, rowNum) -> {
        Book book = new Book();
        book.setId(rs.getLong("id"));
        book.setTitle(rs.getString("title"));
        book.setAuthor(rs.getString("author"));
        book.setDescription(rs.getString("description"));
        book.setOwnerId(rs.getLong("owner_id"));
        book.setStatus(rs.getString("status"));
        return book;
    };

    public BookRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // создать книгу
    public Book save(Book book) {
        final String sql = "INSERT INTO books (title, author, description, owner_id, status) VALUES (?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, book.getTitle());
            ps.setString(2, book.getAuthor());
            ps.setString(3, book.getDescription());
            ps.setLong(4, book.getOwnerId());
            ps.setString(5, book.getStatus());
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
        final String sql = "SELECT id, title, author, description, owner_id, status FROM books";
        return jdbcTemplate.query(sql, bookRowMapper);
    }

    // найти книгу по id
    public Optional<Book> findById(Long id) {
        final String sql = "SELECT id, title, author, description, owner_id, status FROM books WHERE id = ?";
        try {
            Book book = jdbcTemplate.queryForObject(sql, bookRowMapper, id);
            return Optional.ofNullable(book);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    // обновить книгу
    public int update(Book book) {
        final String sql = "UPDATE books SET title = ?, author = ?, description = ?, owner_id = ?, status = ? WHERE id = ?";
        return jdbcTemplate.update(sql,
            book.getTitle(),
            book.getAuthor(),
            book.getDescription(),
            book.getOwnerId(),
            book.getStatus(),
            book.getId());
    }

    // удалить книгу
    public int delete(Long id) {
        final String sql = "DELETE FROM books WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }
}