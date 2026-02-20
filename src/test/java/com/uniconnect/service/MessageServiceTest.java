package com.uniconnect.service;

import com.uniconnect.exception.InvalidInputException;
import com.uniconnect.model.Message;
import com.uniconnect.model.User;
import com.uniconnect.repository.MessageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MessageServiceTest {

    @Mock
    private MessageRepository messageRepository;

    private MessageService messageService;
    private User sender;
    private User receiver;

    @BeforeEach
    void setUp() {
        // Initialize service (Implicitly tests dependency injection)
        messageService = new MessageService(messageRepository);

        sender = new User();
        sender.setUserId(1L);
        sender.setUsername("Alice");

        receiver = new User();
        receiver.setUserId(2L);
        receiver.setUsername("Bob");
    }

    // --- CONSTRUCTOR TEST ---
    @Test
    void testMessageServiceConstructor() {
        MessageService service = new MessageService(messageRepository);
        assertNotNull(service, "MessageService instance should be created");
    }

    // --- FUNCTIONALITY TEST 1: Send Message ---
    @Test
    void testSendMessage_Success() {
        // Arrange
        String content = "Hello Bob!";
        when(messageRepository.save(any(Message.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        Message result = messageService.sendMessage(sender, receiver, content);

        // Assert
        assertNotNull(result);
        assertEquals(content, result.getContent());
        assertEquals(sender, result.getSender());
        assertEquals(receiver, result.getReceiver());
        assertNotNull(result.getTimestamp());

        verify(messageRepository).save(any(Message.class));
    }

    // --- FUNCTIONALITY TEST 2: Get Conversation (Logic Check: Sorting) ---
    @Test
    void testGetConversation_SortsMessagesByTime() {
        // Arrange
        Message msg1 = new Message(); // Older message
        msg1.setContent("Hi Alice (1)");
        msg1.setTimestamp(LocalDateTime.now().minusHours(2));

        Message msg2 = new Message(); // Newer message
        msg2.setContent("Hi Bob (2)");
        msg2.setTimestamp(LocalDateTime.now().minusHours(1));

        // Mock repository returning unsorted/partial lists
        when(messageRepository.findBySenderAndReceiver(sender, receiver))
                .thenReturn(Collections.singletonList(msg2)); // Sender -> Receiver
        when(messageRepository.findBySenderAndReceiver(receiver, sender))
                .thenReturn(Collections.singletonList(msg1)); // Receiver -> Sender

        // Act
        List<Message> conversation = messageService.getConversation(sender, receiver);

        // Assert
        assertEquals(2, conversation.size());
        assertEquals("Hi Alice (1)", conversation.get(0).getContent(), "Older message should be first");
        assertEquals("Hi Bob (2)", conversation.get(1).getContent(), "Newer message should be second");
    }

    // --- FUNCTIONALITY TEST 3: Delete Message (Error Handling) ---
    @Test
    void testDeleteMessage_ThrowsException_WhenNotFound() {
        // Arrange
        Long invalidId = 99L;
        when(messageRepository.existsById(invalidId)).thenReturn(false);

        // Act & Assert
        InvalidInputException exception = assertThrows(InvalidInputException.class, () -> {
            messageService.deleteMessage(invalidId);
        });

        assertEquals("Message not found", exception.getMessage());
        verify(messageRepository, never()).deleteById(anyLong());
    }
}