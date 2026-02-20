package com.uniconnect.controller;

import com.uniconnect.model.Event;
import com.uniconnect.model.User;
import com.uniconnect.repository.UserRepository;
import com.uniconnect.service.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;
    private final UserRepository userRepository;

    public EventController(EventService eventService,
                           UserRepository userRepository) {
        this.eventService = eventService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Event> getAll() {
        return eventService.getAll();
    }

    @GetMapping("/{id}")
    public Event getById(@PathVariable Long id) {
        return eventService.getById(id);
    }

    @GetMapping("/faculty/{faculty}")
    public List<Event> getByFaculty(@PathVariable String faculty) {
        return eventService.getByFaculty(faculty);
    }

    // MODIFICARE: Aceasta este noua metodă compatibilă cu Service-ul actualizat
    @GetMapping("/upcoming")
    public List<Event> getUpcoming() {
        return eventService.getUpcomingEvents();
    }

    @PostMapping
    public ResponseEntity<Event> create(@RequestBody Event event, Authentication auth) {
        String email = auth.getName();
        User creator = userRepository.findByEmail(email).orElseThrow();
        Event saved = eventService.createEvent(creator, event);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}