package com.bookexchange.backendjava.model;

public class User {
    private Long id; 
    private String username;
    private String password;
    private String location;
    private Double rating;
    
    // Обязателен для десериализации JSON
    public User() {} 
    
    public User(String username, String password, String location, Double rating) {
        this.username = username;
        this.password = password;
        this.location = location;
        this.rating = rating;
    }
    
    // Геттеры и Сеттеры...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
}