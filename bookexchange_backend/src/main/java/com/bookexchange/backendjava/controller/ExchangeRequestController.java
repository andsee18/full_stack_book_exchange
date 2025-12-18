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

    // создание запроса важный
    @PostMapping
    public ResponseEntity<?> createExchangeRequest(@RequestBody Map<String, Long> requestBody) {
        Long requestedBookId = requestBody.get("requestedBookId");
        Long offeredBookId = requestBody.get("offeredBookId");

        if (requestedBookId == null || offeredBookId == null) {
            return new ResponseEntity<>("Both requestedBookId and offeredBookId are required.", HttpStatus.BAD_REQUEST);
        }

        Optional<ExchangeRequest> savedRequest = exchangeRequestService.createRequest(requestedBookId, offeredBookId);

        // исправленный блок использование
        if (savedRequest.isPresent()) {
            // успешный путь возвращает
            return new ResponseEntity<>(savedRequest.get(), HttpStatus.CREATED);
        } else {
            // путь ошибки возвращает
            return new ResponseEntity<>("Failed to create exchange request due to validation (e.g., book not found, owner mismatch, or exchanging with self).", HttpStatus.BAD_REQUEST);
        }
    }
    
    // получение входящих запросов
    @GetMapping("/incoming")
    public ResponseEntity<List<ExchangeRequest>> getIncomingRequests() {
        List<ExchangeRequest> requests = exchangeRequestService.getIncomingRequests();
        return ResponseEntity.ok(requests);
    }
    
    // получение исходящих запросов
    @GetMapping("/outgoing")
    public ResponseEntity<List<ExchangeRequest>> getOutgoingRequests() {
        List<ExchangeRequest> requests = exchangeRequestService.getOutgoingRequests();
        return ResponseEntity.ok(requests);
    }
    
    // принятие запроса важный
    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptRequest(@PathVariable Long id) {
        if (exchangeRequestService.acceptRequest(id)) {
            return new ResponseEntity<>("Exchange request accepted and books swapped.", HttpStatus.OK);
        }
        return new ResponseEntity<>("Failed to accept request or request not found/pending.", HttpStatus.BAD_REQUEST);
    }

    // отклонение запроса важный
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id) {
        if (exchangeRequestService.rejectRequest(id)) {
            return new ResponseEntity<>("Exchange request rejected.", HttpStatus.OK);
        }
        return new ResponseEntity<>("Failed to reject request or request not found/pending.", HttpStatus.BAD_REQUEST);
    }

    // отмена запроса инициатором
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelRequest(@PathVariable Long id) {
        if (exchangeRequestService.cancelRequest(id)) {
            return new ResponseEntity<>("Exchange request cancelled.", HttpStatus.OK);
        }
        return new ResponseEntity<>("Failed to cancel request or request not found/pending.", HttpStatus.BAD_REQUEST);
    }

    // очистка истории для
    @PostMapping("/history/clear")
    public ResponseEntity<?> clearMyHistory() {
        int hidden = exchangeRequestService.clearMyHistory();
        return ResponseEntity.ok(Map.of("hidden", hidden));
    }
}