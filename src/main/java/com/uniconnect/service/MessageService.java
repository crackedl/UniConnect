package com.uniconnect.service;

import com.uniconnect.exception.InvalidInputException;
import com.uniconnect.model.Message;
import com.uniconnect.model.User;
import com.uniconnect.repository.MessageRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;

    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public Message sendMessage(User sender, User receiver, String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new InvalidInputException("Message content cannot be empty");
        }

        Message msg = new Message();
        msg.setSender(sender);
        msg.setReceiver(receiver);
        msg.setContent(content);
        msg.setTimestamp(LocalDateTime.now());

        return messageRepository.save(msg);
    }

    public List<Message> getReceivedMessages(User receiver) {
        return messageRepository.findByReceiver(receiver);
    }

    public List<Message> getSentMessages(User sender) {
        return messageRepository.findBySender(sender);
    }

    public List<Message> getConversation(User u1, User u2) {
        // Luăm mesajele trimise de u1 la u2 și invers, apoi le unim și le sortăm
        List<Message> all = new ArrayList<>();
        all.addAll(messageRepository.findBySenderAndReceiver(u1, u2));
        all.addAll(messageRepository.findBySenderAndReceiver(u2, u1));

        all.sort(Comparator.comparing(Message::getTimestamp));
        return all;
    }

    public void deleteMessage(Long id) {
        if (!messageRepository.existsById(id)) {
            throw new InvalidInputException("Message not found");
        }
        messageRepository.deleteById(id);
    }
}