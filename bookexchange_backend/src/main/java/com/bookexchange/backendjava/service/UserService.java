package com.bookexchange.backendjava.service;

import com.bookexchange.backendjava.model.User;
import com.bookexchange.backendjava.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // CREATE
    public User save(User user) {
        return userRepository.save(user);
    }

    // READ ONE
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    // READ ALL
    public List<User> findAll() {
        return userRepository.findAll();
    }
    
    // НОВЫЙ МЕТОД: Аутентификация пользователя
    public Optional<User> authenticate(String username, String password) {
        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            // Сравнение пароля
            if (user.getPassword().equals(password)) {
                return userOptional; // Успешная аутентификация
            }
        }
        return Optional.empty(); // Пользователь не найден или пароль неверен
    }

    // UPDATE
    public Optional<User> update(Long id, User updatedUser) {
        if (userRepository.findById(id).isEmpty()) {
            return Optional.empty();
        }
        updatedUser.setId(id);
        userRepository.update(updatedUser);
        return Optional.of(updatedUser);
    }

    // DELETE
    public boolean delete(Long id) {
        int deletedRows = userRepository.delete(id);
        return deletedRows > 0;
    }
}