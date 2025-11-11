package com.bookexchange.backendjava.controller;

import com.bookexchange.backendjava.model.User;
import com.bookexchange.backendjava.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // регистрация нового пользователя
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public User create(@RequestBody User user) {
        return userService.save(user);
    }

    // вход аутентификация пользователя
    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody User user) {
        // user.getusername и user.getpassword для аутентификации
        return userService.authenticate(user.getUsername(), user.getPassword())
            .map(ResponseEntity::ok) // 200 ok
            .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()); // 401 unauthorized
    }

    // получить всех пользователей
    @GetMapping
    public List<User> findAll() {
        return userService.findAll();
    }

    // получить пользователя по id
    @GetMapping("/{id}")
    public ResponseEntity<User> findById(@PathVariable Long id) {
        return userService.findById(id)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // обновить пользователя по id
    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable Long id, @RequestBody User user) {
        return userService.update(id, user)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // удалить пользователя по id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        boolean deleted = userService.delete(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}