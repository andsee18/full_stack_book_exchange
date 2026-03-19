package com.bookexchange.backendjava.controller;

import com.bookexchange.backendjava.service.RatingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ratings")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5000"})
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    // выставление оценки пользователю
    @PostMapping
    public ResponseEntity<?> rate(@RequestBody Map<String, Object> body) {
        Long exchangeRequestId = null;
        Integer stars = null;

        try {
            Object exchangeIdRaw = body.get("exchangeRequestId");
            if (exchangeIdRaw instanceof Number n) exchangeRequestId = n.longValue();

            Object starsRaw = body.get("stars");
            if (starsRaw instanceof Number n) stars = n.intValue();
        } catch (Exception ignored) {
        }

        if (exchangeRequestId == null || stars == null) {
            return new ResponseEntity<>("exchangeRequestId and stars are required", HttpStatus.BAD_REQUEST);
        }

        Optional<RatingService.RateResult> res = ratingService.rateUser(exchangeRequestId, stars);
        if (res.isEmpty()) {
            return new ResponseEntity<>("Failed to rate (invalid exchange/status, already rated, or not a participant)", HttpStatus.BAD_REQUEST);
        }

        RatingService.RateResult r = res.get();
        return ResponseEntity.ok(Map.of("rating", r.rating(), "ratingCount", r.ratingCount()));
    }

    // получение списка оцененных обменов
    @GetMapping("/mine")
    public ResponseEntity<List<Long>> mine() {
        return ResponseEntity.ok(ratingService.getMyRatedExchangeIds());
    }
}
