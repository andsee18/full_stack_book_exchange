package com.bookexchange.backendjava.service;

import com.bookexchange.backendjava.model.User;
import com.bookexchange.backendjava.repository.UserRepository; 
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserService { 

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // CREATE (POST)
    public User save(User user) {
        return userRepository.save(user); 
    }
    
    // READ (GET)
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    // UPDATE (PUT)
    public Optional<User> update(Long id, User updatedUser) {
        if (userRepository.findById(id).isEmpty()) {
            return Optional.empty();
        }
        
        updatedUser.setId(id);
        
        // Выполняем обновление в базе данных
        userRepository.update(updatedUser);
        
        // Возвращаем обновленный объект
        return Optional.of(updatedUser); 
    }
    
    // DELETE (DELETE)
    public boolean delete(Long id) {
        int deletedRows = userRepository.delete(id);
        return deletedRows > 0;
    }
}