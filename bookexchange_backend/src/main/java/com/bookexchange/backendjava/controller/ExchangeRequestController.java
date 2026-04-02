package com.bookexchange.backendjava.controller;

import com.bookexchange.backendjava.model.ExchangeRequest;
import com.bookexchange.backendjava.service.ExchangeRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/exchange")
public class ExchangeRequestController {

    private final ExchangeRequestService exchangeRequestService;

    public ExchangeRequestController(ExchangeRequestService exchangeRequestService) {
        this.exchangeRequestService = exchangeRequestService;
    }

    // создание запроса
    @PostMapping
    public ResponseEntity<?> createExchangeRequest(@RequestBody Map<String, Long> requestBody) {
        Long requestedBookId = requestBody.get("requestedBookId");
        Long offeredBookId = requestBody.get("offeredBookId");

        if (requestedBookId == null || offeredBookId == null) {
            return new ResponseEntity<>("Both requestedBookId and offeredBookId are required.", HttpStatus.BAD_REQUEST);
        }

        Optional<ExchangeRequest> savedRequest = exchangeRequestService.createRequest(requestedBookId, offeredBookId);

        // проверка создания
        if (savedRequest.isPresent()) {
            // запрос создан
            return new ResponseEntity<>(savedRequest.get(), HttpStatus.CREATED);
        } else {
            // ошибка валидации
            return new ResponseEntity<>("Failed to create exchange request due to validation (e.g., book not found, owner mismatch, or exchanging with self).", HttpStatus.BAD_REQUEST);
        }
    }
    
    // входящие запросы
    @GetMapping("/incoming")
    public ResponseEntity<List<ExchangeRequest>> getIncomingRequests() {
        List<ExchangeRequest> requests = exchangeRequestService.getIncomingRequests();
        return ResponseEntity.ok(requests);
    }
    
    // исходящие запросы
    @GetMapping("/outgoing")
    public ResponseEntity<List<ExchangeRequest>> getOutgoingRequests() {
        List<ExchangeRequest> requests = exchangeRequestService.getOutgoingRequests();
        return ResponseEntity.ok(requests);
    }
    
    // принять запрос
    @PostMapping("/{id}/accept")
    public ResponseEntity<?> acceptExchangeRequest(@PathVariable Long id) {
        if (exchangeRequestService.acceptRequest(id)) {
            return new ResponseEntity<>("Exchange request accepted and books swapped.", HttpStatus.OK);
        }
        return new ResponseEntity<>("Failed to accept request or request not found/pending.", HttpStatus.BAD_REQUEST);
    }

    // отклонить запрос
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectExchangeRequest(@PathVariable Long id) {
        if (exchangeRequestService.rejectRequest(id)) {
            return new ResponseEntity<>("Exchange request rejected.", HttpStatus.OK);
        }
        return new ResponseEntity<>("Failed to reject request or request not found/pending.", HttpStatus.BAD_REQUEST);
    }

    // отменить запрос
    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelExchangeRequest(@PathVariable Long id) {
        if (exchangeRequestService.cancelRequest(id)) {
            return new ResponseEntity<>("Exchange request cancelled.", HttpStatus.OK);
        }
        return new ResponseEntity<>("Failed to cancel request or request not found/pending.", HttpStatus.BAD_REQUEST);
    }

    // очистка истории завершенных обменов
    @PostMapping("/history/clear")
    public ResponseEntity<?> clearMyHistory() {
        int hidden = exchangeRequestService.clearMyHistory();
        return ResponseEntity.ok(Map.of("hidden", hidden));
    }
}