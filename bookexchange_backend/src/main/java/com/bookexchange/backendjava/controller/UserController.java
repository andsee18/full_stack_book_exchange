package com.bookexchange.backendjava.controller;

import com.bookexchange.backendjava.model.User; 
import com.bookexchange.backendjava.service.UserService; 
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users") 
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // 1. CREATE (POST)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED) 
    public User create(@RequestBody User user) {
        return userService.save(user); 
    }
    
    // 2. READ (GET)
    @GetMapping("/{id}")
    public ResponseEntity<User> findById(@PathVariable Long id) {
        return userService.findById(id)
            .map(ResponseEntity::ok) // 200 OK
            .orElseGet(() -> ResponseEntity.notFound().build()); // 404 Not Found
    }

    // 3. UPDATE (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable Long id, @RequestBody User user) {
        return userService.update(id, user)
            .map(ResponseEntity::ok) // 200 OK
            .orElseGet(() -> ResponseEntity.notFound().build()); // 404 Not Found
    }

    // 4. DELETE (DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        boolean deleted = userService.delete(id);

        if (deleted) {
            // 204 No Content
            return ResponseEntity.noContent().build();
        } else {
            // 404 Not Found
            return ResponseEntity.notFound().build();
        }
    }
}