package com.bookexchange.backendjava.repository;

import com.bookexchange.backendjava.model.ExchangeRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class ExchangeRequestRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final String BASE_SQL = "SELECT id, requested_book_id, offered_book_id, requester_id, recipient_id, status, request_date FROM exchange_requests";

    // финальное решение для
    public ExchangeRequest save(ExchangeRequest request) {
        
        final String SQL_INSERT = "INSERT INTO exchange_requests (requested_book_id, offered_book_id, requester_id, recipient_id, status, request_date) VALUES (?, ?, ?, ?, ?, ?)";
        
        // выполняем важный ключевой
        jdbcTemplate.update(SQL_INSERT,
                request.getRequestedBookId(),
                request.getOfferedBookId(),
                request.getRequesterId(),
                request.getRecipientId(),
                request.getStatus(),
                request.getRequestDate().toString()
        );

        try {
            // выполняем специальный запрос
            Long generatedId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ROWID()", Long.class);
            
            if (generatedId != null) {
                request.setId(generatedId);
            } else {
                 System.err.println("CRITICAL ERROR: LAST_INSERT_ROWID() returned NULL.");
            }
        } catch (Exception e) {
            System.err.println("Error retrieving generated ID via LAST_INSERT_ROWID(): " + e.getMessage());
        }
        
        // теперь возвращается объект
        return request;
    }
    
    public Optional<ExchangeRequest> findById(Long id) {
        String sql = BASE_SQL + " WHERE id = ?";
        try {
            ExchangeRequest request = jdbcTemplate.queryForObject(sql, new BeanPropertyRowMapper<>(ExchangeRequest.class), id);
            return Optional.ofNullable(request);
        } catch (Exception e) {
            return Optional.empty();
        }
    }
    
    public int updateStatus(Long id, String newStatus) {
        String sql = "UPDATE exchange_requests SET status = ? WHERE id = ?";
        return jdbcTemplate.update(sql, newStatus, id);
    }

    /* комментарий важный ключевой */
    public int cancelPendingByBookId(Long bookId) {
        String sql = "UPDATE exchange_requests SET status = ? WHERE status = ? AND (requested_book_id = ? OR offered_book_id = ?)";
        return jdbcTemplate.update(sql, "cancelled", "pending", bookId, bookId);
    }
    
    // получить все запросы
    public List<ExchangeRequest> findByRecipientId(Long recipientId) {
        String sql = BASE_SQL + " WHERE recipient_id = ? AND id NOT IN (SELECT exchange_request_id FROM exchange_request_hidden WHERE user_id = ?)";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(ExchangeRequest.class), recipientId, recipientId);
    }
    
    // получить все запросы
    public List<ExchangeRequest> findByRequesterId(Long requesterId) {
        String sql = BASE_SQL + " WHERE requester_id = ? AND id NOT IN (SELECT exchange_request_id FROM exchange_request_hidden WHERE user_id = ?)";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(ExchangeRequest.class), requesterId, requesterId);
    }

    /* комментарий важный ключевой */
    public int hideNonPendingHistoryForUser(Long userId) {
        String sql = "INSERT OR IGNORE INTO exchange_request_hidden (exchange_request_id, user_id, hidden_at) " +
                "SELECT id, ?, CURRENT_TIMESTAMP FROM exchange_requests " +
                "WHERE (requester_id = ? OR recipient_id = ?) AND lower(status) <> 'pending'";
        return jdbcTemplate.update(sql, userId, userId, userId);
    }
}