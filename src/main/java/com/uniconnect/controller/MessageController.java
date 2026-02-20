package com.uniconnect.controller;

import com.uniconnect.model.Message;
import com.uniconnect.model.User;
import com.uniconnect.repository.UserRepository;
import com.uniconnect.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;
    private final UserRepository userRepository;

    public MessageController(MessageService messageService,
                             UserRepository userRepository) {
        this.messageService = messageService;
        this.userRepository = userRepository;
    }

    @GetMapping("/inbox")
    public List<Message> inbox(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return messageService.getReceivedMessages(user);
    }

    @GetMapping("/sent")
    public List<Message> sent(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return messageService.getSentMessages(user);
    }

    // NOU: Endpoint pentru a vedea conversația cu o anumită persoană
    @GetMapping("/conversation/{otherUserId}")
    public List<Message> conversation(@PathVariable Long otherUserId, Authentication auth) {
        String email = auth.getName();
        User currentUser = userRepository.findByEmail(email).orElseThrow();
        User otherUser = userRepository.findById(otherUserId).orElseThrow();

        return messageService.getConversation(currentUser, otherUser);
    }

    @PostMapping("/to/{receiverId}")
    public ResponseEntity<Message> send(@PathVariable Long receiverId,
                                        @RequestBody Message message,
                                        Authentication auth) {
        String email = auth.getName();
        User sender = userRepository.findByEmail(email).orElseThrow();
        User receiver = userRepository.findById(receiverId).orElseThrow();

        // Folosim metoda actualizată din service
        Message saved = messageService.sendMessage(sender, receiver, message.getContent());
        return ResponseEntity.ok(saved);
    }
}