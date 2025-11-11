package com.bookexchange.backendjava.service;

import com.bookexchange.backendjava.model.Book;
import com.bookexchange.backendjava.repository.BookRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final UserService userService; // инъекция userservice для проверки

    public BookService(BookRepository bookRepository, UserService userService) {
        this.bookRepository = bookRepository;
        this.userService = userService;
    }

    //  create post с проверкой существования userid
    public Optional<Book> save(Book book) {
        Long userId = book.getUserId();
        
        // проверяем существует ли пользователь владелец книги
        if (userService.findById(userId).isEmpty()) {
            return Optional.empty(); // 404 not found если user не существует
        }
        
        // если пользователь существует сохраняем книгу
        return Optional.of(bookRepository.save(book));
    }

    //  read one
    public Optional<Book> findById(Long id) {
        return bookRepository.findById(id);
    }
    
    //  read all
    public List<Book> findAll() {
        return bookRepository.findAll();
    }

    //  update put с двойной проверкой существования книги и нового userid
    public Optional<Book> update(Long id, Book updatedBook) {
        // проверка 1 существует ли книга которую мы пытаемся обновить
        if (bookRepository.findById(id).isEmpty()) {
            return Optional.empty(); // книга не найдена
        }

        // проверка 2 если указан новый userid убедимся что он существует
        if (userService.findById(updatedBook.getUserId()).isEmpty()) {
             return Optional.empty(); // новый user не найден
        }
        
        updatedBook.setId(id);
        bookRepository.update(updatedBook);
        return Optional.of(updatedBook);
    }

    //  delete
    public boolean delete(Long id) {
        int deletedRows = bookRepository.delete(id);
        return deletedRows > 0;
    }
}