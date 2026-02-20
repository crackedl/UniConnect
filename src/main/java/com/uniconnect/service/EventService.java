package com.uniconnect.service;

import com.uniconnect.exception.InvalidInputException;
import com.uniconnect.model.Event;
import com.uniconnect.model.User;
import com.uniconnect.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public Event createEvent(User creator, Event event) {
        if (event.getTitle() == null || event.getTitle().trim().isEmpty()) {
            throw new InvalidInputException("Event title is required");
        }
        if (event.getDate() == null) {
            throw new InvalidInputException("Event date is required");
        }

        event.setCreatedBy(creator);
        return eventRepository.save(event);
    }

    public List<Event> getAll() {
        return eventRepository.findAll();
    }

    public Event getById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new InvalidInputException("Event not found"));
    }

    public List<Event> getByFaculty(String faculty) {
        return eventRepository.findByFaculty(faculty);
    }

    // Am schimbat logica să aducă evenimente viitoare (mai util pentru studenți)
    public List<Event> getUpcomingEvents() {
        return eventRepository.findByDateAfter(LocalDateTime.now());
    }

    public List<Event> getByCreator(User creator) {
        return eventRepository.findByCreatedBy(creator);
    }

    public Event updateEvent(Long id, Event updated) {
        Event event = getById(id);

        if (updated.getTitle() != null) event.setTitle(updated.getTitle());
        if (updated.getDescription() != null) event.setDescription(updated.getDescription());
        if (updated.getDate() != null) event.setDate(updated.getDate());

        return eventRepository.save(event);
    }

    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new InvalidInputException("Event not found");
        }
        eventRepository.deleteById(id);
    }
}