package com.uniconnect.service;

import com.uniconnect.exception.InvalidInputException;
import com.uniconnect.model.Role;
import com.uniconnect.model.User;
import com.uniconnect.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(User user) {
        // Validări simple inline (ca să nu depindem de fișiere externe)
        if (user.getUsername() == null || user.getUsername().trim().isEmpty())
            throw new InvalidInputException("Username required");
        if (user.getEmail() == null || !user.getEmail().contains("@"))
            throw new InvalidInputException("Valid email required");
        if (user.getPassword() == null || user.getPassword().length() < 3)
            throw new InvalidInputException("Password too short");

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new InvalidInputException("Email already exists");
        }
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new InvalidInputException("Username already exists");
        }

        // Dacă nu s-a specificat un rol, este STUDENT
        if (user.getRole() == null) {
            user.setRole(Role.STUDENT);
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User updateUser(Long id, User updated) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new InvalidInputException("User not found"));

        if (updated.getUsername() != null) user.setUsername(updated.getUsername());
        if (updated.getFaculty() != null) user.setFaculty(updated.getFaculty());
        if (updated.getDepartment() != null) user.setDepartment(updated.getDepartment());

        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}