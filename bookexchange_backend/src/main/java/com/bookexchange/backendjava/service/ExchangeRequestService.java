package com.bookexchange.backendjava.service;

import com.bookexchange.backendjava.model.Book;
import com.bookexchange.backendjava.model.ExchangeRequest;
import com.bookexchange.backendjava.repository.ExchangeRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ExchangeRequestService {

    private final ExchangeRequestRepository requestRepository;
    private final BookService bookService; 
    // удалено важный ключевой

    public ExchangeRequestService(ExchangeRequestRepository requestRepository, BookService bookService) {
        this.requestRepository = requestRepository;
        this.bookService = bookService;
        // удалено важный ключевой
    }

    /* создает новый запрос */
    public Optional<ExchangeRequest> createRequest(Long requestedBookId, Long offeredBookId) {
        
        // извлекаем инициатора запроса
        Long requesterId;
        try {
            String principalId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            requesterId = Long.parseLong(principalId);
        } catch (Exception e) {
            return Optional.empty(); 
        }

        // проверка запрашиваемой книги
        Optional<Book> requestedBookOpt = bookService.findById(requestedBookId);
        if (requestedBookOpt.isEmpty() || !"available".equalsIgnoreCase(requestedBookOpt.get().getStatus())) {
            System.err.println("Requested book not found or not available.");
            return Optional.empty(); 
        }
        Book requestedBook = requestedBookOpt.get();
        Long recipientId = requestedBook.getOwnerId();
        
        // проверка предлагаемой книги
        Optional<Book> offeredBookOpt = bookService.findById(offeredBookId);
        if (offeredBookOpt.isEmpty() || !offeredBookOpt.get().getOwnerId().equals(requesterId) || !"available".equalsIgnoreCase(offeredBookOpt.get().getStatus())) {
            System.err.println("Offered book not found or does not belong to the requester.");
            return Optional.empty(); 
        }
        
        // проверка пользователь важный
        if (requesterId.equals(recipientId)) {
            System.err.println("Cannot exchange books with yourself.");
            return Optional.empty(); 
        }
        
        // создание запроса важный
        ExchangeRequest request = new ExchangeRequest();
        request.setRequestedBookId(requestedBookId);
        request.setOfferedBookId(offeredBookId);
        request.setRequesterId(requesterId);
        request.setRecipientId(recipientId); 
        request.setStatus("pending"); 
        
        return Optional.of(requestRepository.save(request));
    }
    
    /* принятие запроса важный */
    @Transactional
    public boolean acceptRequest(Long requestId) {
        
        Optional<ExchangeRequest> requestOpt = requestRepository.findById(requestId);
        if (requestOpt.isEmpty() || !requestOpt.get().getStatus().equals("pending")) {
            return false;
        }
        ExchangeRequest request = requestOpt.get();
        
        // проверяем запрос что
        Long currentUserId;
        try {
            String principalId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            currentUserId = Long.parseLong(principalId);
        } catch (Exception e) {
            return false; 
        }
        
        if (!request.getRecipientId().equals(currentUserId)) {
            System.err.println("User is not the recipient of this request.");
            return false; 
        }
        
        // логика обмена важный
        
        // обновляем статус запроса
        requestRepository.updateStatus(requestId, "accepted");
        
        // обновляем владельцев важный
        boolean requestedUpdated = bookService.updateOwnerAndStatus(request.getRequestedBookId(), request.getRequesterId(), "available");
        boolean offeredUpdated = bookService.updateOwnerAndStatus(request.getOfferedBookId(), request.getRecipientId(), "available");

        if (!requestedUpdated || !offeredUpdated) {
            throw new IllegalStateException("Failed to update book owners during exchange accept.");
        }
        
        return true;
    }
    
    /* отклонение запроса важный */
    public boolean rejectRequest(Long requestId) {
        Optional<ExchangeRequest> requestOpt = requestRepository.findById(requestId);
        if (requestOpt.isEmpty() || !requestOpt.get().getStatus().equals("pending")) {
            return false;
        }
        ExchangeRequest request = requestOpt.get();
        
        // проверяем запрос что
        Long currentUserId;
        try {
            String principalId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            currentUserId = Long.parseLong(principalId);
        } catch (Exception e) {
            return false; 
        }
        
        if (!request.getRecipientId().equals(currentUserId)) {
            return false; 
        }
        
        return requestRepository.updateStatus(requestId, "rejected") > 0;
    }

    /* отмена запроса важный */
    public boolean cancelRequest(Long requestId) {
        Optional<ExchangeRequest> requestOpt = requestRepository.findById(requestId);
        if (requestOpt.isEmpty() || !requestOpt.get().getStatus().equals("pending")) {
            return false;
        }
        ExchangeRequest request = requestOpt.get();

        Long currentUserId;
        try {
            String principalId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            currentUserId = Long.parseLong(principalId);
        } catch (Exception e) {
            return false;
        }

        if (!request.getRequesterId().equals(currentUserId)) {
            return false;
        }

        return requestRepository.updateStatus(requestId, "cancelled") > 0;
    }
    
    // получить все входящие
    public List<ExchangeRequest> getIncomingRequests() {
        Long currentUserId;
        try {
            String principalId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            currentUserId = Long.parseLong(principalId);
        } catch (Exception e) {
            return List.of(); 
        }
        return requestRepository.findByRecipientId(currentUserId);
    }
    
    // получить все исходящие
    public List<ExchangeRequest> getOutgoingRequests() {
        Long currentUserId;
        try {
            String principalId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            currentUserId = Long.parseLong(principalId);
        } catch (Exception e) {
            return List.of(); 
        }
        return requestRepository.findByRequesterId(currentUserId);
    }

    /* комментарий важный ключевой */
    public int clearMyHistory() {
        Long currentUserId;
        try {
            String principalId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            currentUserId = Long.parseLong(principalId);
        } catch (Exception e) {
            return 0;
        }
        return requestRepository.hideNonPendingHistoryForUser(currentUserId);
    }
}