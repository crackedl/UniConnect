package com.uniconnect.model;

import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.*;

class EventTest {

    // --- CONSTRUCTOR TEST ---
    @Test
    void testEventConstructor() {
        // 1. Act: Create a new Event
        Event event = new Event();

        // 2. Assert: Check instantiation
        assertNotNull(event, "Event object should be created");

        // 3. Assert: Verify properties can be set and retrieved
        // (Since the constructor is empty, we verify the object is usable)
        event.setTitle("Career Fair");
        assertEquals("Career Fair", event.getTitle());

        event.setDate(LocalDate.now());
        assertNotNull(event.getDate(), "Date should be settable");
    }
}