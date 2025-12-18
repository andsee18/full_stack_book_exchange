package com.bookexchange.backendjava.model;

public class Book {
    private Long id;
    private String title;
    private String author;
    private String genre; // жанр
    private String description; // описание книги
    private String condition; // состояние
    private String coverUrl; // ссылка/данные обложки (URL или data URL)
    private Long ownerId;     //  ownerId
    private String status;    //  статус (доступна, в обмене и т.д.)


    public Book() {}

    public Book(Long id, String title, String author, String genre, String description, String condition, String coverUrl, Long ownerId, String status) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.genre = genre;
        this.description = description;
        this.condition = condition;
        this.coverUrl = coverUrl;
        this.ownerId = ownerId;
        this.status = status;
    }

    // геттеры сеттеры важный
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    
    // геттеры сеттеры важный
    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }
    public String getCoverUrl() { return coverUrl; }
    public void setCoverUrl(String coverUrl) { this.coverUrl = coverUrl; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    // геттер сеттер важный
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
}