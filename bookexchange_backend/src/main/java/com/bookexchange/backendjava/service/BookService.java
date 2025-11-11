package com.bookexchange.backendjava.service;

import com.bookexchange.backendjava.model.Book;
import com.bookexchange.backendjava.repository.BookRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final UserService userService; //userservice для проверки владельца

    public BookService(BookRepository bookRepository, UserService userService) {
        this.bookRepository = bookRepository;
        this.userService = userService;
    }

    public Optional<Book> save(Book book) {
        Long ownerId = book.getOwnerId(); 
        
        // проверяем, существует ли пользователь владелец книги
        if (userService.findById(ownerId).isEmpty()) {
            return Optional.empty(); // 404 not found
        }
        
        if (book.getStatus() == null || book.getStatus().isEmpty()) {
            book.setStatus("available");
        }
        
        return Optional.of(bookRepository.save(book));
    }

    // получить одну книгу по id
    public Optional<Book> findById(Long id) {
        return bookRepository.findById(id);
    }
    
    // получить все книги
    public List<Book> findAll() {
        return bookRepository.findAll();
    }

    // обновить книгу с проверкой существования книги и владельца
    public Optional<Book> update(Long id, Book updatedBook) {
        // проверка 1: существует ли книга которую мы пытаемся обновить
        if (bookRepository.findById(id).isEmpty()) {
            return Optional.empty(); // книга не найдена
        }

        // проверка 2: убедимся что новый владелец  существует
        if (userService.findById(updatedBook.getOwnerId()).isEmpty()) {
             return Optional.empty(); // новый владелец не найден
        }
        
        updatedBook.setId(id);
        bookRepository.update(updatedBook);
        return Optional.of(updatedBook);
    }

    // удалить книгу
    public boolean delete(Long id) {
        int deletedRows = bookRepository.delete(id);
        return deletedRows > 0;
    }
}