package com.bookexchange.backendjava.controller;

import com.bookexchange.backendjava.model.Book;
import com.bookexchange.backendjava.service.BookService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://localhost:5000"})
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    // создание книги
    @PostMapping
    public ResponseEntity<?> createBook(@RequestBody Book book) {
        Optional<Book> savedBook = bookService.save(book);
        
        if (savedBook.isPresent()) {
            return new ResponseEntity<>(savedBook.get(), HttpStatus.CREATED); 
        } else {
            return new ResponseEntity<>("Failed to create book. Check user authentication.", HttpStatus.BAD_REQUEST); 
        }
    }

    // получение всех книг
    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks() {
        List<Book> books = bookService.findAll();
        return ResponseEntity.ok(books);
    }

    // получение книги по id
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        Optional<Book> book = bookService.findById(id);
        return book.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // обновление информации о книге
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBook(@PathVariable Long id, @RequestBody Book updatedBook) {
        // обновление книги с проверкой прав
        Optional<Book> result = bookService.update(id, updatedBook);

        if (result.isPresent()) {
            return new ResponseEntity<>(result.get(), HttpStatus.OK); 
        }
        
        // книга не найдена или нет доступа
        return ResponseEntity.notFound().build(); // 404 Not Found
    }

    // удаление книги
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBook(@PathVariable Long id) {
        // удаление с проверкой прав
        if (bookService.delete(id)) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content
        }
        
        // книга не найдена или нет доступа
        return ResponseEntity.notFound().build(); // 404 Not Found
    }
}