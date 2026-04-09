package com.bookexchange.backendjava.service;

import com.bookexchange.backendjava.model.User;
import com.bookexchange.backendjava.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void register_NewUser_Success() {
        User user = new User();
        user.setUsername("testuser");
        user.setPassword("password");
        user.setEmail("test@example.com");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.countUsers()).thenReturn(1L);

        User savedUser = userService.register(user);

        assertNotNull(savedUser);
        assertEquals("testuser", savedUser.getUsername());
        assertEquals("encodedPassword", savedUser.getPassword());
        assertEquals("USER", savedUser.getRole());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_ExistingUser_ThrowsException() {
        User user = new User();
        user.setUsername("existinguser");

        when(userRepository.findByUsername("existinguser")).thenReturn(Optional.of(new User()));

        assertThrows(IllegalArgumentException.class, () -> userService.register(user));
    }

    @Test
    void authenticate_ValidCredentials_Success() {
        User user = new User();
        user.setUsername("user");
        user.setPassword("encodedPassword");

        when(userRepository.findByUsername("user")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "encodedPassword")).thenReturn(true);

        Optional<User> authenticated = userService.authenticate("user", "password");

        assertTrue(authenticated.isPresent());
        assertEquals("user", authenticated.get().getUsername());
    }

    @Test
    void authenticate_InvalidPassword_ReturnsEmpty() {
        User user = new User();
        user.setUsername("user");
        user.setPassword("encodedPassword");

        when(userRepository.findByUsername("user")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "encodedPassword")).thenReturn(false);

        Optional<User> authenticated = userService.authenticate("user", "wrong");

        assertFalse(authenticated.isPresent());
    }
}

