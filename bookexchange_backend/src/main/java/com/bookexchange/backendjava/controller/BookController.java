package com.bookexchange.backendjava.controller;

import com.bookexchange.backendjava.model.Book;
import com.bookexchange.backendjava.service.BookService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    // получить все книги
    @GetMapping
    public List<Book> findAll() {
        return bookService.findAll();
    }

    // получить книгу по id
    @GetMapping("/{id}")
    public ResponseEntity<Book> findById(@PathVariable Long id) {
        return bookService.findById(id)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // создать новую книгу
    @PostMapping
    // используем created для статуса 201
    public ResponseEntity<Book> create(@RequestBody Book book) {
        // сервис проверяет ownerid
        return bookService.save(book)
            .map(b -> ResponseEntity.status(HttpStatus.CREATED).body(b)) // 201 created
            .orElseGet(() -> ResponseEntity.status(HttpStatus.BAD_REQUEST).build()); // 400 bad request
    }

    // обновить книгу по id
    @PutMapping("/{id}")
    public ResponseEntity<Book> update(@PathVariable Long id, @RequestBody Book book) {
        // сервис проверяет book id и owner id
        return bookService.update(id, book)
            .map(ResponseEntity::ok) // 200 ok
            .orElseGet(() -> ResponseEntity.notFound().build()); // 404 not found 
    }

    // удалить книгу по id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        boolean deleted = bookService.delete(id);
        if (deleted) {
            return ResponseEntity.noContent().build(); // 204 no content
        } else {
            return ResponseEntity.notFound().build(); // 404 not found
        }
    }
}