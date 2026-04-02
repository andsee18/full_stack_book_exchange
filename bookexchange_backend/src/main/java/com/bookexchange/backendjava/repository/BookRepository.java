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

    // маппер сущности
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

    // сохранить книгу
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

    // поиск с фильтрами и пагинацией
    public List<Book> findWithFilters(String query, String genre, String condition, String status, int page, int size) {
        StringBuilder sql = new StringBuilder("SELECT * FROM books WHERE 1=1 ");
        java.util.List<Object> params = new java.util.ArrayList<>();

        if (query != null && !query.isEmpty()) {
            sql.append(" AND (lower(title) LIKE lower(?) OR lower(author) LIKE lower(?)) ");
            params.add("%" + query + "%");
            params.add("%" + query + "%");
        }
        if (genre != null && !genre.isEmpty()) {
            sql.append(" AND lower(genre) = lower(?) ");
            params.add(genre);
        }
        if (condition != null && !condition.isEmpty()) {
            sql.append(" AND lower(condition) = lower(?) ");
            params.add(condition);
        }
        if (status != null && !status.isEmpty()) {
            sql.append(" AND lower(status) = lower(?) ");
            params.add(status);
        }

        // пагинация sql
        sql.append(" ORDER BY id DESC LIMIT ? OFFSET ? ");
        params.add(size);
        params.add(page * size);

        return jdbcTemplate.query(sql.toString(), bookRowMapper, params.toArray());
    }

    // подсчет книг по фильтрам
    public long countWithFilters(String query, String genre, String condition, String status) {
        StringBuilder sql = new StringBuilder("SELECT count(*) FROM books WHERE 1=1 ");
        java.util.List<Object> params = new java.util.ArrayList<>();

        if (query != null && !query.isEmpty()) {
            sql.append(" AND (lower(title) LIKE lower(?) OR lower(author) LIKE lower(?)) ");
            params.add("%" + query + "%");
            params.add("%" + query + "%");
        }
        if (genre != null && !genre.isEmpty()) {
            sql.append(" AND lower(genre) = lower(?) ");
            params.add(genre);
        }
        if (condition != null && !condition.isEmpty()) {
            sql.append(" AND lower(condition) = lower(?) ");
            params.add(condition);
        }
        if (status != null && !status.isEmpty()) {
            sql.append(" AND lower(status) = lower(?) ");
            params.add(status);
        }

        return jdbcTemplate.queryForObject(sql.toString(), Long.class, params.toArray());
    }

    public Optional<Book> findById(Long id) {
        final String sql = "SELECT id, title, author, genre, description, condition, cover_url, owner_id, status FROM books WHERE id = ?";
        try {
            Book book = jdbcTemplate.queryForObject(sql, bookRowMapper, id);
            return Optional.ofNullable(book);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    // обновить книгу
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

    // удалить книгу
    public int delete(Long id) {
        final String sql = "DELETE FROM books WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }

    // обновление статуса по условию
    public int updateStatusWhereLowerEquals(String target, String source) {
        String sql = "UPDATE books SET status = ? WHERE lower(status) = lower(?)";
        return jdbcTemplate.update(sql, target, source);
    }
}