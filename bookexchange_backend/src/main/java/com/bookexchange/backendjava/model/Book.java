package com.bookexchange.backendjava.model;

public class Book {
    private Long id;
    private String title;
    private String author;
    private String description; // описание книги
    private Long ownerId;     //  ownerId
    private String status;    //  статус (доступна, в обмене и т.д.)

    public Book() {}

    public Book(Long id, String title, String author, String description, Long ownerId, String status) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.description = description;
        this.ownerId = ownerId;
        this.status = status;
    }

    // геттеры и сеттеры
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    
    // геттеры и сеттеры для новых полей
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    // геттер и сеттер для ownerId
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
}