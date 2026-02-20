package com.uniconnect.repository;

import com.uniconnect.model.Event;
import com.uniconnect.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByFaculty(String faculty);

    // Găsește evenimente care au loc DUPĂ data curentă (Evenimente viitoare)
    List<Event> findByDateAfter(LocalDateTime date);

    List<Event> findByCreatedBy(User user);
}