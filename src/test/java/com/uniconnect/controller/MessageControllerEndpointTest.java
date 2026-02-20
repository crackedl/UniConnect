package com.uniconnect.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.uniconnect.model.Message;
import com.uniconnect.model.User;
import com.uniconnect.repository.UserRepository;
import com.uniconnect.service.MessageService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// This annotation specifically tests the Controller layer (Endpoints)
@WebMvcTest(MessageController.class)
class MessageControllerEndpointTest {

    @Autowired
    private MockMvc mockMvc; // Simulates HTTP requests

    @MockBean
    private MessageService messageService;

    @MockBean
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "student@upt.ro") // Simulates a logged-in user
    void testInboxEndpoint_ExistsAndReturns200() throws Exception {
        // Arrange
        User user = new User();
        user.setEmail("student@upt.ro");

        given(userRepository.findByEmail("student@upt.ro")).willReturn(Optional.of(user));
        given(messageService.getReceivedMessages(user)).willReturn(Collections.emptyList());

        // Act & Assert
        mockMvc.perform(get("/api/messages/inbox"))
                .andExpect(status().isOk()); // Verifies HTTP 200 OK
    }

    @Test
    @WithMockUser(username = "student@upt.ro")
    void testSendEndpoint_ExistsAndReturns200() throws Exception {
        // Arrange
        User sender = new User();
        sender.setEmail("student@upt.ro");

        User receiver = new User();
        receiver.setUserId(2L);

        Message msg = new Message();
        msg.setContent("Hello");

        given(userRepository.findByEmail("student@upt.ro")).willReturn(Optional.of(sender));
        given(userRepository.findById(2L)).willReturn(Optional.of(receiver));
        given(messageService.sendMessage(any(), any(), any())).willReturn(msg);

        // Act & Assert
        // We must include .with(csrf()) because Spring Security blocks POSTs by default in tests
        mockMvc.perform(post("/api/messages/to/2")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(msg)))
                .andExpect(status().isOk());
    }
}