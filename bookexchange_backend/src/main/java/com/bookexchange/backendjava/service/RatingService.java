package com.bookexchange.backendjava.service;

import com.bookexchange.backendjava.model.ExchangeRequest;
import com.bookexchange.backendjava.repository.ExchangeRequestRepository;
import com.bookexchange.backendjava.repository.RatingRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;
    private final ExchangeRequestRepository exchangeRequestRepository;

    public RatingService(RatingRepository ratingRepository, ExchangeRequestRepository exchangeRequestRepository) {
        this.ratingRepository = ratingRepository;
        this.exchangeRequestRepository = exchangeRequestRepository;
    }

    public record RateResult(double rating, int ratingCount) {}

    @Transactional
    public Optional<RateResult> rateUser(Long exchangeRequestId, int stars) {
        if (exchangeRequestId == null) return Optional.empty();
        if (stars < 1 || stars > 5) return Optional.empty();

        Long raterId;
        try {
            String principalId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            raterId = Long.parseLong(principalId);
        } catch (Exception e) {
            return Optional.empty();
        }

        Optional<ExchangeRequest> requestOpt = exchangeRequestRepository.findById(exchangeRequestId);
        if (requestOpt.isEmpty()) return Optional.empty();

        ExchangeRequest request = requestOpt.get();
        if (request.getStatus() == null || !"accepted".equalsIgnoreCase(request.getStatus().trim())) {
            return Optional.empty();
        }

        boolean isParticipant = raterId.equals(request.getRequesterId()) || raterId.equals(request.getRecipientId());
        if (!isParticipant) {
            return Optional.empty();
        }

        if (ratingRepository.existsByExchangeAndRater(exchangeRequestId, raterId)) {
            return Optional.empty();
        }

        Long ratedUserId = raterId.equals(request.getRequesterId()) ? request.getRecipientId() : request.getRequesterId();
        if (ratedUserId == null) return Optional.empty();

        int inserted = ratingRepository.insertRating(exchangeRequestId, raterId, ratedUserId, stars);
        if (inserted <= 0) return Optional.empty();

        RatingRepository.Aggregate aggregate = ratingRepository.getAggregateForUser(ratedUserId)
            .orElse(new RatingRepository.Aggregate(0.0, 0));

        ratingRepository.updateUserAggregate(ratedUserId, aggregate.average(), aggregate.count());

        return Optional.of(new RateResult(aggregate.average(), aggregate.count()));
    }

    public List<Long> getMyRatedExchangeIds() {
        Long raterId;
        try {
            String principalId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            raterId = Long.parseLong(principalId);
        } catch (Exception e) {
            return List.of();
        }

        return ratingRepository.findRatedExchangeIdsByRater(raterId);
    }
}
