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

    public ExchangeRequestService(ExchangeRequestRepository requestRepository, BookService bookService) {
        this.requestRepository = requestRepository;
        this.bookService = bookService;
    }

    // создание новой заявки
    public Optional<ExchangeRequest> createRequest(Long requestedBookId, Long offeredBookId) {
        
        // получение инициатора
        Long requesterId;
        try {
            String principalId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            requesterId = Long.parseLong(principalId);
        } catch (Exception e) {
            return Optional.empty(); 
        }

        // доступность книги
        Optional<Book> requestedBookOpt = bookService.findById(requestedBookId);
        if (requestedBookOpt.isEmpty() || !"available".equalsIgnoreCase(requestedBookOpt.get().getStatus())) {
            System.err.println("Requested book not found or not available.");
            return Optional.empty(); 
        }
        Book requestedBook = requestedBookOpt.get();
        Long recipientId = requestedBook.getOwnerId();
        
        // владение предлагаемой книгой
        Optional<Book> offeredBookOpt = bookService.findById(offeredBookId);
        if (offeredBookOpt.isEmpty() || !offeredBookOpt.get().getOwnerId().equals(requesterId) || !"available".equalsIgnoreCase(offeredBookOpt.get().getStatus())) {
            System.err.println("Offered book not found or does not belong to the requester.");
            return Optional.empty(); 
        }

        // нельзя менять самому себе
        if (recipientId.equals(requesterId)) {
            System.err.println("Cannot exchange with yourself.");
            return Optional.empty();
        }
        
        ExchangeRequest request = new ExchangeRequest();
        request.setRequestedBookId(requestedBookId);
        request.setOfferedBookId(offeredBookId);
        request.setRequesterId(requesterId);
        request.setRecipientId(recipientId); 
        request.setStatus("pending"); 
        
        return Optional.of(requestRepository.save(request));
    }
    
    // принятие заявки
    @Transactional
    public boolean acceptRequest(Long requestId) {
        Optional<ExchangeRequest> requestOpt = requestRepository.findById(requestId);
        if (requestOpt.isEmpty()) return false;

        ExchangeRequest request = requestOpt.get();
        
        // проверка статуса
        if (!"pending".equalsIgnoreCase(request.getStatus())) return false;

        // только получатель может принять
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
        
        // обновление статуса заявки
        requestRepository.updateStatus(requestId, "accepted");
        
        // смена владельцев
        boolean requestedUpdated = bookService.updateOwnerAndStatus(request.getRequestedBookId(), request.getRequesterId(), "available");
        boolean offeredUpdated = bookService.updateOwnerAndStatus(request.getOfferedBookId(), request.getRecipientId(), "available");

        if (!requestedUpdated || !offeredUpdated) {
            throw new IllegalStateException("Failed to update book owners during exchange accept.");
        }
        
        return true;
    }
    
    // отклонение заявки
    public boolean rejectRequest(Long requestId) {
        Optional<ExchangeRequest> requestOpt = requestRepository.findById(requestId);
        if (requestOpt.isEmpty()) return false;
        ExchangeRequest request = requestOpt.get();

        // только получатель может отклонить
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

    // отмена заявки
    public boolean cancelRequest(Long requestId) {
        Optional<ExchangeRequest> requestOpt = requestRepository.findById(requestId);
        if (requestOpt.isEmpty()) return false;
        ExchangeRequest request = requestOpt.get();

        // только инициатор может отменить
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
    
    // входящие заявки
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
    
    // исходящие заявки
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

    // очистка истории
    public int clearMyHistory() {
        Long currentUserId;
        try {
            String principalId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            currentUserId = Long.parseLong(principalId);
        } catch (Exception e) {
            return 0;
        }
        // скрытие завершенных
        return requestRepository.hideNonPendingHistoryForUser(currentUserId);
    }
}
