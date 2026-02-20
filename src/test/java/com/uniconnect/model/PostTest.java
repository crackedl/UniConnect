package com.uniconnect.model;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class PostTest {

    // --- CONSTRUCTOR TEST ---
    @Test
    void testPostConstructor() {
        // 1. Act: Create a new Post
        Post post = new Post();

        // 2. Assert: Check instantiation
        assertNotNull(post, "Post object should be created");

        // 3. Assert: Check default values set by constructor
        assertNotNull(post.getTimestamp(), "Timestamp should be automatically set in constructor");
        // Verify timestamp is recent (e.g., within the last second)
        assertTrue(post.getTimestamp().isBefore(LocalDateTime.now().plusSeconds(1)));

        // 4. Assert: Check list initialization
        assertNotNull(post.getComments(), "Comments set should be initialized");
        assertTrue(post.getComments().isEmpty(), "Comments set should be empty initially");

        // 5. Assert: Check primitive default (int defaults to 0)
        assertEquals(0, post.getLikes(), "Likes should default to 0");
    }
}