package com.bookexchange.backendjava.service;

import com.bookexchange.backendjava.model.Book;
import com.bookexchange.backendjava.repository.BookRepository;
import com.bookexchange.backendjava.repository.ExchangeRequestRepository;
import com.bookexchange.backendjava.service.PermissionDeniedException; 
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder; 
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final UserService userService; 
    private final ExchangeRequestRepository exchangeRequestRepository;

    public BookService(BookRepository bookRepository, UserService userService, ExchangeRequestRepository exchangeRequestRepository) {
        this.bookRepository = bookRepository;
        this.userService = userService;
        this.exchangeRequestRepository = exchangeRequestRepository;
    }

    @PostConstruct
    public void normalizeLegacyStatuses() {
        try {
            int updated = bookRepository.updateStatusWhereLowerEquals("exchanged", "available");
            if (updated > 0) {
                System.out.println("Normalized legacy book statuses: exchanged -> available (" + updated + ")");
            }
        } catch (Exception e) {
            System.err.println("Failed to normalize legacy book statuses: " + e.getMessage());
        }
    }

    public Optional<Book> save(Book book) {
        Long currentOwnerId;
        try {
            String principalId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            currentOwnerId = Long.parseLong(principalId);
            
            book.setOwnerId(currentOwnerId);
            
            if (userService.findById(currentOwnerId).isEmpty()) { 
                return Optional.empty(); 
            }
            
        } catch (Exception e) {
            System.err.println("Error setting owner ID: " + e.getMessage());
            return Optional.empty(); 
        }
        
        if (book.getStatus() == null || book.getStatus().isEmpty()) {
            book.setStatus("available");
        }
        
        return Optional.of(bookRepository.save(book));
    }
    
    public boolean updateOwnerAndStatus(Long bookId, Long newOwnerId, String newStatus) {
        Optional<Book> bookOpt = bookRepository.findById(bookId);
        if (bookOpt.isEmpty()) {
            return false;
        }

        if (newOwnerId == null || userService.findById(newOwnerId).isEmpty()) {
            return false;
        }

        Book book = bookOpt.get();
        book.setOwnerId(newOwnerId);
        book.setStatus(newStatus);

        // комментарий важный ключевой
        bookRepository.update(book);
        return true;
    }

    public Optional<Book> findById(Long id) {
        return bookRepository.findById(id);
    }
    
    public List<Book> findAll() {
        return bookRepository.findAll();
    }

    // обновить книгу важный
    public Optional<Book> update(Long id, Book updatedBook) {
        Optional<Book> existingBookOpt = bookRepository.findById(id);
        
        if (existingBookOpt.isEmpty()) {
            return Optional.empty(); // 404
        }
        Book existingBook = existingBookOpt.get();

        Long currentUserId;
        try {
            String principalId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            currentUserId = Long.parseLong(principalId);
        } catch (Exception e) {
            throw new PermissionDeniedException("Authentication context error for update.");
        }
        
        // критическая проверка важный
        if (!existingBook.getOwnerId().equals(currentUserId)) {
            System.err.println("Permission denied: User " + currentUserId + " attempted to update book " + id + " owned by " + existingBook.getOwnerId());
            throw new PermissionDeniedException("You do not have permission to update this book."); // 403
        }
        
        if (userService.findById(existingBook.getOwnerId()).isEmpty()) {
             return Optional.empty(); 
        }

        if (updatedBook.getTitle() != null && !updatedBook.getTitle().trim().isEmpty()) {
            existingBook.setTitle(updatedBook.getTitle().trim());
        }
        if (updatedBook.getAuthor() != null && !updatedBook.getAuthor().trim().isEmpty()) {
            existingBook.setAuthor(updatedBook.getAuthor().trim());
        }
        if (updatedBook.getGenre() != null && !updatedBook.getGenre().trim().isEmpty()) {
            existingBook.setGenre(updatedBook.getGenre().trim());
        }
        if (updatedBook.getDescription() != null && !updatedBook.getDescription().trim().isEmpty()) {
            existingBook.setDescription(updatedBook.getDescription().trim());
        }
        if (updatedBook.getCondition() != null && !updatedBook.getCondition().trim().isEmpty()) {
            existingBook.setCondition(updatedBook.getCondition().trim());
        }

        // сохраняем старую обложку, если пришло пусто
        if (updatedBook.getCoverUrl() != null && !updatedBook.getCoverUrl().trim().isEmpty()) {
            existingBook.setCoverUrl(updatedBook.getCoverUrl().trim());
        }

        // сохраняем старый статус, если пришло пусто
        if (updatedBook.getStatus() != null && !updatedBook.getStatus().trim().isEmpty()) {
            existingBook.setStatus(updatedBook.getStatus().trim());
        }
        if (existingBook.getStatus() == null || existingBook.getStatus().trim().isEmpty()) {
            existingBook.setStatus("available");
        }

        bookRepository.update(existingBook);
        return Optional.of(existingBook);
    }

    // удаление книги
    @Transactional
    public boolean delete(Long id) {
        Optional<Book> existingBookOpt = bookRepository.findById(id);

        if (existingBookOpt.isEmpty()) {
            return false; // 404
        }
        Book existingBook = existingBookOpt.get();
        
        Long currentUserId;
        try {
            String principalId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            currentUserId = Long.parseLong(principalId);
        } catch (Exception e) {
            throw new PermissionDeniedException("Authentication context error for delete.");
        }

        // проверка прав доступа к удалению
        if (!existingBook.getOwnerId().equals(currentUserId)) {
            System.err.println("Permission denied: User " + currentUserId + " attempted to delete book " + id + " owned by " + existingBook.getOwnerId());
            throw new PermissionDeniedException("You do not have permission to delete this book."); // 403
        }

        // отмена всех связанных заявок на обмен
        try {
            exchangeRequestRepository.cancelPendingByBookId(id);
        } catch (Exception e) {
            // логирование ошибки отмены заявок
            throw e;
        }

        return bookRepository.delete(id) > 0;
    }
}