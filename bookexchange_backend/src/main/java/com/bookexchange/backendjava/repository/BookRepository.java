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

    // RowMapper  преобразование строки бд в объект book
    private final RowMapper<Book> bookRowMapper = (rs, rowNum) -> {
        Book book = new Book();
        book.setId(rs.getLong("id"));
        book.setTitle(rs.getString("title"));
        book.setAuthor(rs.getString("author"));
        book.setUserId(rs.getLong("user_id"));
        return book;
    };

    public BookRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    //  CREATE (POST)
    public Book save(Book book) {
        final String sql = "INSERT INTO books (title, author, user_id) VALUES (?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, book.getTitle());
            ps.setString(2, book.getAuthor());
            ps.setLong(3, book.getUserId());
            return ps;
        }, keyHolder);

        Long generatedId = keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;
        if (generatedId != null) {
            book.setId(generatedId);
        }
        return book;
    }

    // READ (GET ONE)
    public Optional<Book> findById(Long id) {
        final String sql = "SELECT id, title, author, user_id FROM books WHERE id = ?";
        try {
            Book book = jdbcTemplate.queryForObject(sql, bookRowMapper, id);
            return Optional.ofNullable(book);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
    
    // метод для получения всех книг
    public List<Book> findAll() {
        final String sql = "SELECT id, title, author, user_id FROM books";
        return jdbcTemplate.query(sql, bookRowMapper);
    }

    // UPDATE (PUT)
    public int update(Book book) {
        final String sql = "UPDATE books SET title = ?, author = ?, user_id = ? WHERE id = ?";
        return jdbcTemplate.update(sql,
            book.getTitle(),
            book.getAuthor(),
            book.getUserId(),
            book.getId());
    }

    // DELETE (DELETE)
    public int delete(Long id) {
        final String sql = "DELETE FROM books WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }
}