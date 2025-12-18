package com.bookexchange.backendjava.model;

import java.time.LocalDateTime;

public class ExchangeRequest {
    
    private Long id;
    private Long requestedBookId; // Книга, которую хочет инициатор (ownerId: User A)
    private Long offeredBookId;   // Книга, которую предлагает инициатор (ownerId: User B)
    private Long requesterId;     // ID пользователя, который инициировал запрос (User B)
    private Long recipientId;     // ID владельца запрашиваемой книги (User A)
    private String status;        // "pending", "accepted", "rejected", "cancelled"
    private LocalDateTime requestDate;

    // конструктор умолчанию важный
    public ExchangeRequest() {
        this.status = "pending";
        this.requestDate = LocalDateTime.now();
    }

    // геттеры сеттеры важный

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRequestedBookId() { return requestedBookId; }
    public void setRequestedBookId(Long requestedBookId) { this.requestedBookId = requestedBookId; }

    public Long getOfferedBookId() { return offeredBookId; }
    public void setOfferedBookId(Long offeredBookId) { this.offeredBookId = offeredBookId; }

    public Long getRequesterId() { return requesterId; }
    public void setRequesterId(Long requesterId) { this.requesterId = requesterId; }

    public Long getRecipientId() { return recipientId; }
    public void setRecipientId(Long recipientId) { this.recipientId = recipientId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getRequestDate() { return requestDate; }
    public void setRequestDate(LocalDateTime requestDate) { this.requestDate = requestDate; }
}