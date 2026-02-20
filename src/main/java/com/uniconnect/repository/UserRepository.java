package com.uniconnect.repository;

import com.uniconnect.model.User;
import com.uniconnect.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);
    boolean existsByUsername(String username);

    List<User> findByRole(Role role);

    List<User> findByFaculty(String faculty);
    List<User> findByDepartment(String department);

    List<User> findByFacultyAndDepartment(String faculty, String department);

    // NOU: Caută useri care au textul în Username SAU în Email
    List<User> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(String username, String email);}
