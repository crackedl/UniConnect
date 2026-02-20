package com.uniconnect.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    // --- CONSTRUCTOR TEST ---
    @Test
    void testUserNoArgsConstructor() {
        // 1. Act: Call the constructor
        User user = new User();

        // 2. Assert: Check the object is created
        assertNotNull(user, "User instance should be created");

        // 3. Assert: Check that the lists are initialized (not null)
        // This confirms the "new HashSet<>()" lines in your class worked
        assertNotNull(user.getPosts(), "Posts list should be initialized empty");
        assertNotNull(user.getSentMessages(), "Sent messages list should be initialized empty");
        assertNotNull(user.getReceivedMessages(), "Received messages list should be initialized empty");
        assertNotNull(user.getCreatedEvents(), "Created events list should be initialized empty");
        assertNotNull(user.getComments(), "Comments list should be initialized empty");
    }
}