package com.uniconnect.validation;

import com.uniconnect.exception.InvalidInputException;

public class InputValidator {

    public static void requireNonBlank(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new InvalidInputException(fieldName + " must not be empty");
        }
    }

    public static void requireEmail(String email) {
        requireNonBlank(email, "email");
        if (!email.contains("@")) {
            throw new InvalidInputException("email must contain '@'");
        }
    }

    public static void requirePassword(String password) {
        requireNonBlank(password, "password");
        if (password.length() < 6) {
            throw new InvalidInputException("password must be at least 6 characters");
        }
    }
}
