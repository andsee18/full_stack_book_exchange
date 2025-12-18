package com.bookexchange.backendjava.model;

public class RefreshToken {
    private Long id;
    private String token;
    private Long userId;
    private Long expiryDate; // epoch millis

    public RefreshToken() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getExpiryDate() { return expiryDate; }
    public void setExpiryDate(Long expiryDate) { this.expiryDate = expiryDate; }
}
