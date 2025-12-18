package com.bookexchange.backendjava.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class RatingRepository {

    private final JdbcTemplate jdbcTemplate;

    public RatingRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean existsByExchangeAndRater(Long exchangeRequestId, Long raterId) {
        final String sql = "SELECT 1 FROM user_ratings WHERE exchange_request_id = ? AND rater_id = ? LIMIT 1";
        List<Integer> rows = jdbcTemplate.query(sql, (rs, rowNum) -> rs.getInt(1), exchangeRequestId, raterId);
        return !rows.isEmpty();
    }

    public int insertRating(Long exchangeRequestId, Long raterId, Long ratedUserId, int stars) {
        final String sql = "INSERT INTO user_ratings (exchange_request_id, rater_id, rated_user_id, stars) VALUES (?, ?, ?, ?)";
        return jdbcTemplate.update(sql, exchangeRequestId, raterId, ratedUserId, stars);
    }

    public Optional<Aggregate> getAggregateForUser(Long ratedUserId) {
        final String sql = "SELECT AVG(stars) AS avg_stars, COUNT(*) AS cnt FROM user_ratings WHERE rated_user_id = ?";
        try {
            return Optional.ofNullable(
                jdbcTemplate.queryForObject(
                    sql,
                    (rs, rowNum) -> new Aggregate(rs.getDouble("avg_stars"), rs.getInt("cnt")),
                    ratedUserId
                )
            );
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public int updateUserAggregate(Long userId, double avg, int count) {
        final String sql = "UPDATE users SET rating = ?, rating_count = ? WHERE id = ?";
        return jdbcTemplate.update(sql, avg, count, userId);
    }

    public List<Long> findRatedExchangeIdsByRater(Long raterId) {
        final String sql = "SELECT exchange_request_id FROM user_ratings WHERE rater_id = ?";
        return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getLong("exchange_request_id"), raterId);
    }

    public record Aggregate(double average, int count) {}
}
