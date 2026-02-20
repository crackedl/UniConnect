package com.uniconnect.service;

import com.uniconnect.exception.InvalidInputException;
import com.uniconnect.model.Event;
import com.uniconnect.model.User;
import com.uniconnect.repository.EventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    private EventService eventService;
    private User creator;
    private Event validEvent;

    @BeforeEach
    void setUp() {
        // Initialize Service (Tests DI logic implicitly)
        eventService = new EventService(eventRepository);

        creator = new User();
        creator.setUserId(1L);
        creator.setUsername("Organizer");

        validEvent = new Event();
        validEvent.setEventId(50L);
        validEvent.setTitle("Hackathon 2024");
        validEvent.setDate(LocalDate.of(2024, 12, 1));
        validEvent.setFaculty("AC");
    }

    // --- CONSTRUCTOR TEST ---
    @Test
    void testEventServiceConstructor() {
        EventService service = new EventService(eventRepository);
        assertNotNull(service, "EventService instance should be created");
    }

    // --- FUNCTIONALITY TEST 1: Create Event ---
    @Test
    void testCreateEvent_Success() {
        // Arrange
        when(eventRepository.save(any(Event.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        Event createdEvent = eventService.createEvent(creator, validEvent);

        // Assert
        assertNotNull(createdEvent);
        assertEquals(creator, createdEvent.getCreatedBy(), "Creator should be linked to the event");
        assertEquals("Hackathon 2024", createdEvent.getTitle());
        verify(eventRepository).save(validEvent);
    }

    // --- FUNCTIONALITY TEST 2: Update Event (Partial Update) ---
    @Test
    void testUpdateEvent_UpdatesOnlyNonNullFields() {
        // Arrange
        Long eventId = 50L;

        // The incoming update object only has a new description
        Event updateData = new Event();
        updateData.setDescription("Updated Description");

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(validEvent));
        when(eventRepository.save(any(Event.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        Event updatedResult = eventService.updateEvent(eventId, updateData);

        // Assert
        assertEquals("Updated Description", updatedResult.getDescription(), "Description should be updated");
        assertEquals("Hackathon 2024", updatedResult.getTitle(), "Title should remain unchanged");
        verify(eventRepository).save(validEvent);
    }

    // --- FUNCTIONALITY TEST 3: Delete Event (Error Case) ---
    @Test
    void testDeleteEvent_ThrowsException_WhenNotFound() {
        // Arrange
        Long invalidId = 999L;
        when(eventRepository.existsById(invalidId)).thenReturn(false);

        // Act & Assert
        InvalidInputException exception = assertThrows(InvalidInputException.class, () -> {
            eventService.deleteEvent(invalidId);
        });

        assertEquals("Event not found", exception.getMessage());
        verify(eventRepository, never()).deleteById(anyLong());
    }
}