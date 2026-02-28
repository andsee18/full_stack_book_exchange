package com.bookexchange.backendjava.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class User {
    private Long id; 
    private String username;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    private String email;
    private String profileImage;
    private String location;
    private Double rating;
    private Integer ratingCount;

    // роли важный
    private String role;
    
    // обязателен десериализации для
    public User() {} 
    
    public User(String username, String password, String email, String profileImage, String location, Double rating) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.profileImage = profileImage;
        this.location = location;
        this.rating = rating;
    }
    
    // геттеры сеттеры важный
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Integer getRatingCount() { return ratingCount; }
    public void setRatingCount(Integer ratingCount) { this.ratingCount = ratingCount; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", location='" + location + '\'' +
                ", rating=" + rating +
                ", ratingCount=" + ratingCount +
                ", role='" + role + '\'' +
                '}';
    }
}