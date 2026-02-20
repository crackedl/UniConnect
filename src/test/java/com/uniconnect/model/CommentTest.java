package com.uniconnect.model;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class CommentTest {

    // --- CONSTRUCTOR TEST ---
    @Test
    void testCommentConstructor() {
        // 1. Act: Create a new Comment
        Comment comment = new Comment();

        // 2. Assert: Check instantiation
        assertNotNull(comment, "Comment object should be created");

        // 3. Assert: Check timestamp initialization
        // The constructor sets timestamp to LocalDateTime.now()
        assertNotNull(comment.getTimestamp(), "Timestamp should be automatically set in constructor");

        // Verify timestamp is recent (created just now)
        assertTrue(comment.getTimestamp().isBefore(LocalDateTime.now().plusSeconds(1)));
    }
}