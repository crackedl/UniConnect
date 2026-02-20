package com.uniconnect.service;

import com.uniconnect.exception.InvalidInputException;
import com.uniconnect.model.Role;
import com.uniconnect.model.User;
import com.uniconnect.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UserService userService;
    private User validUser;

    @BeforeEach
    void setUp() {
        // Initialize the service (testing the constructor logic implicitly here,
        // but we will add an explicit test below)
        userService = new UserService(userRepository, passwordEncoder);

        // Create a user object with valid data for functionality tests
        validUser = new User();
        validUser.setUsername("testStudent");
        validUser.setEmail("test@student.upt.ro");
        validUser.setPassword("SecurePass123!");
        validUser.setRole(Role.STUDENT);
    }

    // --- CONSTRUCTOR TEST ---
    @Test
    void testUserServiceConstructor() {
        // Act: Manually call the constructor
        UserService service = new UserService(userRepository, passwordEncoder);

        // Assert: Ensure the instance is created correctly
        assertNotNull(service, "UserService should be instantiated correctly");
    }

    // --- FUNCTIONALITY TEST 1: Register User (Success Scenario) ---
    @Test
    void testRegister_Success() {
        // Arrange
        when(userRepository.existsByEmail(validUser.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(validUser.getUsername())).thenReturn(false);
        when(passwordEncoder.encode(any(String.class))).thenReturn("EncodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(validUser);

        // Act
        User result = userService.register(validUser);

        // Assert
        assertNotNull(result);
        verify(passwordEncoder).encode("SecurePass123!"); // Check password was encrypted
        verify(userRepository).save(validUser); // Check repository save was called
    }

    // --- FUNCTIONALITY TEST 2: Register User (Fail - Email Exists) ---
    @Test
    void testRegister_Fail_EmailExists() {
        // Arrange
        when(userRepository.existsByEmail(validUser.getEmail())).thenReturn(true);

        // Act & Assert
        InvalidInputException exception = assertThrows(InvalidInputException.class, () -> {
            userService.register(validUser);
        });

        assertEquals("Email already exists", exception.getMessage());
        verify(userRepository, never()).save(any(User.class)); // Ensure we didn't save
    }

    // --- FUNCTIONALITY TEST 3: Update User (Success Scenario) ---
    @Test
    void testUpdateUser_Success() {
        // Arrange
        Long userId = 1L;
        User existingUser = new User();
        existingUser.setUserId(userId);
        existingUser.setUsername("OldName");
        existingUser.setFaculty("AC");

        User updateData = new User();
        updateData.setUsername("NewName"); // Only updating the name

        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        User updatedUser = userService.updateUser(userId, updateData);

        // Assert
        assertEquals("NewName", updatedUser.getUsername()); // Name should change
        assertEquals("AC", updatedUser.getFaculty());       // Faculty should remain same
        verify(userRepository).save(existingUser);
    }
}