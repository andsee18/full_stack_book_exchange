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
    private final S3Service s3Service;

    public BookService(BookRepository bookRepository, UserService userService, ExchangeRequestRepository exchangeRequestRepository, S3Service s3Service) {
        this.bookRepository = bookRepository;
        this.userService = userService;
        this.exchangeRequestRepository = exchangeRequestRepository;
        this.s3Service = s3Service;
    }

    @PostConstruct
    public void normalizeLegacyStatuses() {
        // исправление старых статусов книг
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
        // сохранение новой книги
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
        // обновление владельца и статуса
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

        // обновление в базе
        bookRepository.update(book);
        return true;
    }

    public List<Book> findAll() {
        return bookRepository.findAll();
    }

    /* поиск с фильтрами */
    public List<Book> findWithFilters(String query, String genre, String condition, String status, int page, int size) {
        return bookRepository.findWithFilters(query, genre, condition, status, page, size);
    }

    /* общее количество по фильтрам */
    public long countWithFilters(String query, String genre, String condition, String status) {
        return bookRepository.countWithFilters(query, genre, condition, status);
    }

    public Optional<Book> findById(Long id) {
        return bookRepository.findById(id);
    }

    // обновить книгу
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
        
        // проверка прав владельца
        if (!existingBook.getOwnerId().equals(currentUserId)) {
            throw new PermissionDeniedException("You do not have permission to update this book.");
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

        // обновление обложки
        if (updatedBook.getCoverUrl() != null && !updatedBook.getCoverUrl().trim().isEmpty()) {
            existingBook.setCoverUrl(updatedBook.getCoverUrl().trim());
        }

        // обновление статуса
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
        Optional<Book> bookOpt = bookRepository.findById(id);

        if (bookOpt.isEmpty()) {
            return false; // 404
        }
        Book existingBook = bookOpt.get();

        Long currentUserId;
        try {
            String principalId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            currentUserId = Long.parseLong(principalId);
        } catch (Exception e) {
            throw new PermissionDeniedException("Authentication context error for delete.");
        }

        // проверка прав доступа удалению
        if (!existingBook.getOwnerId().equals(currentUserId)) {
            throw new PermissionDeniedException("You do not have permission to delete this book."); // 403
        }

        // отмена заявок на обмен
        try {
            exchangeRequestRepository.cancelPendingByBookId(id);
        } catch (Exception e) {
            // логирование ошибки отмены заявок
            throw e;
        }

        return bookRepository.delete(id) > 0;
    }
}