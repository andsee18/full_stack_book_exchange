package com.bookexchange.backendjava.controller;

import com.bookexchange.backendjava.model.Book;
import com.bookexchange.backendjava.service.BookService;
import com.bookexchange.backendjava.service.GoogleBooksService;
import com.bookexchange.backendjava.service.S3Service;
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
    private final S3Service s3Service;
    private final GoogleBooksService googleBooksService;

    public BookController(BookService bookService, S3Service s3Service, GoogleBooksService googleBooksService) {
        this.bookService = bookService;
        this.s3Service = s3Service;
        this.googleBooksService = googleBooksService;
    }

    // создание книги
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createBook(
            @RequestPart("book") @jakarta.validation.Valid Book book,
            @RequestPart(value = "cover", required = false) org.springframework.web.multipart.MultipartFile cover) {

        try {
            if (cover != null && !cover.isEmpty()) {
                String coverUrl = s3Service.uploadFile(cover);
                book.setCoverUrl(coverUrl);
            }

            Optional<Book> savedBook = bookService.save(book);
            if (savedBook.isPresent()) {
                return new ResponseEntity<>(savedBook.get(), HttpStatus.CREATED);
            } else {
                return new ResponseEntity<>("Failed to create book. Check user authentication.", HttpStatus.BAD_REQUEST);
            }
        } catch (java.io.IOException e) {
            return new ResponseEntity<>("Failed to upload cover: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // получение списка книг
    @GetMapping
    public ResponseEntity<?> getBooks(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String condition,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        List<Book> books = bookService.findWithFilters(query, genre, condition, status, page, size);
        long totalItems = bookService.countWithFilters(query, genre, condition, status);

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("books", books);
        response.put("currentPage", page);
        response.put("totalItems", totalItems);
        response.put("totalPages", (int) Math.ceil((double) totalItems / size));

        return ResponseEntity.ok(response);
    }

    // получение книги по id
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        Optional<Book> book = bookService.findById(id);
        return book.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // обновление книги
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateBook(
            @PathVariable Long id,
            @RequestPart("book") @jakarta.validation.Valid Book updatedBook,
            @RequestPart(value = "cover", required = false) org.springframework.web.multipart.MultipartFile cover) {

        try {
            if (cover != null && !cover.isEmpty()) {
                String coverUrl = s3Service.uploadFile(cover);
                updatedBook.setCoverUrl(coverUrl);
            }

            Optional<Book> result = bookService.update(id, updatedBook);
            if (result.isPresent()) {
                return new ResponseEntity<>(result.get(), HttpStatus.OK);
            }
            return ResponseEntity.notFound().build();
        } catch (java.io.IOException e) {
            return new ResponseEntity<>("Failed to upload cover: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // удаление книги
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBook(@PathVariable Long id) {
        // удаление проверкой прав
        if (bookService.delete(id)) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content
        }
        
        // книга найдена нет доступа
        return ResponseEntity.notFound().build(); // 404 Not Found
    }

    @GetMapping("/search-google")
    public ResponseEntity<?> searchGoogle(@RequestParam("q") String query) {
        return ResponseEntity.ok(googleBooksService.searchBooks(query));
    }

    @GetMapping(value = "/robots.txt", produces = "text/plain")
    @ResponseBody
    public String getRobotsTxt() {
        return "User-agent: *\nDisallow: /admin\nDisallow: /settings\nDisallow: /login\nDisallow: /register\nAllow: /\nSitemap: http://localhost:5000/api/sitemap.xml";
    }

    @GetMapping(value = "/sitemap.xml", produces = "application/xml")
    @ResponseBody
    public String getSitemap() {
        List<Book> books = bookService.findWithFilters(null, null, null, "available", 0, 1000);
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

        // главная
        xml.append("  <url>\n    <loc>http://localhost:3000/</loc>\n    <priority>1.0</priority>\n  </url>\n");

        // книги
        for (Book b : books) {
            xml.append("  <url>\n");
            xml.append("    <loc>http://localhost:3000/books/").append(b.getId()).append("</loc>\n");
            xml.append("    <priority>0.8</priority>\n");
            xml.append("  </url>\n");
        }

        xml.append("</urlset>");
        return xml.toString();
    }
}