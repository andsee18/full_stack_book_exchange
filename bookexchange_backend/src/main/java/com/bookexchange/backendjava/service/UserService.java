package com.bookexchange.backendjava.service;

import com.bookexchange.backendjava.model.User;
import com.bookexchange.backendjava.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService; 
import org.springframework.security.core.userdetails.UsernameNotFoundException; 
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.authority.SimpleGrantedAuthority; 

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; 

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // комментарий важный ключевой
    @Override
    public UserDetails loadUserByUsername(String usernameOrId) throws UsernameNotFoundException {
        Optional<User> userOptional;

        // проверка входная если
        try {
            Long userId = Long.parseLong(usernameOrId);
            userOptional = userRepository.findById(userId); // <-- ИЩЕМ ПО ID
        } catch (NumberFormatException e) {
            // если это важный
            userOptional = userRepository.findByUsername(usernameOrId); // <-- ИЩЕМ ПО USERNAME
        }

        User user = userOptional
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username or ID: " + usernameOrId));

        String role = user.getRole() != null && !user.getRole().isBlank() ? user.getRole().trim().toUpperCase() : "USER";
        String authority = "ROLE_" + role;
        List<SimpleGrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(authority));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(), 
                user.getPassword(), 
                authorities 
        );
    }
    
    // комментарий важный ключевой

    public User save(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User register(User user) {
        // проверяем что важный
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists: " + user.getUsername());
        }
        // проверяем что важный
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        // кодируем пароль важный
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // назначаем роль по умолчанию
        // для учебного проекта делаем первого зарегистрированного пользователя админом
        try {
            if (userRepository.countUsers() == 0) {
                user.setRole("ADMIN");
            } else {
                user.setRole("USER");
            }
        } catch (Exception e) {
            user.setRole("USER");
        }
        if (user.getRating() == null) {
            user.setRating(0.0);
        }
        if (user.getRatingCount() == null) {
            user.setRatingCount(0);
        }
        return userRepository.save(user);
    }

    public boolean setUserRole(Long userId, String role) {
        return userRepository.updateRole(userId, role);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }
    
    public Optional<User> authenticate(String username, String password) {
        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                return userOptional;
            }
        }
        return Optional.empty(); 
    }

    public Optional<User> update(Long id, User updatedUser) {
        Optional<User> existingOpt = userRepository.findById(id);
        if (existingOpt.isEmpty()) return Optional.empty();

        User existing = existingOpt.get();

        // комментарий важный ключевой
        if (updatedUser.getUsername() != null && !updatedUser.getUsername().isBlank()) {
            String nextUsername = updatedUser.getUsername().trim();
            if (!nextUsername.equals(existing.getUsername())) {
                Optional<User> collision = userRepository.findByUsername(nextUsername);
                if (collision.isPresent() && collision.get().getId() != null && !collision.get().getId().equals(id)) {
                    throw new IllegalArgumentException("Username already exists: " + nextUsername);
                }
            }
            existing.setUsername(nextUsername);
        }

        // комментарий важный ключевой
        if (updatedUser.getEmail() != null) {
            String nextEmail = updatedUser.getEmail().trim();
            existing.setEmail(nextEmail.isBlank() ? null : nextEmail);
        }

        // комментарий важный ключевой
        if (updatedUser.getLocation() != null) {
            String nextLocation = updatedUser.getLocation().trim();
            existing.setLocation(nextLocation.isBlank() ? null : nextLocation);
        }

        // комментарий важный ключевой
        if (updatedUser.getProfileImage() != null) {
            String nextImage = updatedUser.getProfileImage().trim();
            existing.setProfileImage(nextImage.isBlank() ? null : nextImage);
        }

        // комментарий важный ключевой
        existing.setPassword(existing.getPassword());
        if (existing.getRating() == null) existing.setRating(0.0);
        if (existing.getRatingCount() == null) existing.setRatingCount(0);

        userRepository.update(existing);
        return Optional.of(existing);
    }

    public boolean changePassword(Long id, String oldPassword, String newPassword) {
        if (oldPassword == null || oldPassword.isBlank()) {
            throw new IllegalArgumentException("Old password is required");
        }
        if (newPassword == null || newPassword.isBlank()) {
            throw new IllegalArgumentException("New password is required");
        }
        if (newPassword.length() < 4) {
            throw new IllegalArgumentException("New password is too short");
        }

        Optional<User> existingOpt = userRepository.findById(id);
        if (existingOpt.isEmpty()) return false;

        User existing = existingOpt.get();

        String stored = existing.getPassword();
        boolean matches;
        if (stored != null && isBcryptHash(stored)) {
            matches = passwordEncoder.matches(oldPassword, stored);
        } else {
            // комментарий важный ключевой
            matches = oldPassword.equals(stored);
        }

        if (!matches) {
            throw new IllegalArgumentException("Old password is incorrect");
        }

        existing.setPassword(passwordEncoder.encode(newPassword));
        userRepository.update(existing);
        return true;
    }

    private boolean isBcryptHash(String value) {
        return value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$");
    }

    public boolean delete(Long id) {
        int deletedRows = userRepository.delete(id);
        return deletedRows > 0;
    }
}