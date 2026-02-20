package com.uniconnect.model;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class MessageTest {

    // --- CONSTRUCTOR TEST ---
    @Test
    void testMessageConstructor() {
        // 1. Act: Create a new Message
        Message message = new Message();

        // 2. Assert: Check instantiation
        assertNotNull(message, "Message object should be created");

        // 3. Assert: Check timestamp initialization
        // The constructor sets timestamp to LocalDateTime.now(), so it shouldn't be null
        assertNotNull(message.getTimestamp(), "Timestamp should be automatically set");

        // Verify the timestamp is recent (created just now)
        assertTrue(message.getTimestamp().isBefore(LocalDateTime.now().plusSeconds(1)));
    }
}