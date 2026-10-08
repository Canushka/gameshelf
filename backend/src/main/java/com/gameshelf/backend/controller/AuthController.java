package com.gameshelf.backend.controller;

import com.gameshelf.backend.model.User;
import com.gameshelf.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.gameshelf.backend.security.JwtUtil;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserService userService,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User saved = userService.register(user);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            e.printStackTrace();

            if ("EMAIL_EXISTS".equals(e.getMessage())) {
                return ResponseEntity
                        .status(409)
                        .body("Email already registered");
            }

            return ResponseEntity
                    .internalServerError()
                    .body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        return userService.findByEmail(body.get("email"))
                .map(user -> {
                    if (passwordEncoder.matches(body.get("password"), user.getPassword())) {
                        String token = jwtUtil.generateToken(user.getEmail());
                        return ResponseEntity.ok(Map.of("token", token));
                    }
                    return ResponseEntity.status(401).body("Invalid credentials");
                })
                .orElse(ResponseEntity.status(401).body("User not found"));
    }
}