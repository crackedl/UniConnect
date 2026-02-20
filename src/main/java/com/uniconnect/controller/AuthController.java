package com.uniconnect.controller;

import com.uniconnect.dto.JwtResponse;
import com.uniconnect.dto.LoginRequest;
import com.uniconnect.dto.RegisterRequest;
import com.uniconnect.model.User;
import com.uniconnect.security.JwtUtil;
import com.uniconnect.service.UserService;
import com.uniconnect.repository.UserRepository; // <--- Adaugă importul ăsta
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository; // <--- Avem nevoie de repo

    public AuthController(UserService userService,
                          AuthenticationManager authenticationManager,
                          JwtUtil jwtUtil,
                          UserRepository userRepository) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        // 1. VALIDARE: Verificăm manual aici pentru a trimite un mesaj clar către Frontend
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body("Error: Email is already in use!");
        }

        // 2. PREGĂTIRE USER
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());

        // ATENȚIE: Setăm parola brută aici.
        // UserService o va cripta la linia: user.setPassword(passwordEncoder.encode(...))
        user.setPassword(request.getPassword());

        user.setRole(request.getRole());
        user.setFaculty(request.getFaculty());
        user.setDepartment(request.getDepartment());

        // 3. SALVARE (UserService se ocupă de criptare și salvare)
        try {
            User saved = userService.register(user);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            // În caz că UserService aruncă o eroare (de ex. validări interne)
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getPassword())
        );

        // 1. Generăm token-ul
        String token = jwtUtil.generateToken(request.getEmail());

        // 2. Găsim userul ca să îi aflăm rolul
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();

        // 3. Trimitem Token + Rol
        return ResponseEntity.ok(new JwtResponse(token, user.getRole().name()));
    }
}