package com.bookexchange.backendjava.model;

public class Book {
    private Long id;
    private String title;
    private String author;
    // id владельца книги связь
    private Long userId; 

    public Book() {}

    public Book(String title, String author, Long userId) {
        this.title = title;
        this.author = author;
        this.userId = userId;
    }

    // геттеры и сеттеры
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}