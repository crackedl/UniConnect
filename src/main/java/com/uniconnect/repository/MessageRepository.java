package com.uniconnect.repository;

import com.uniconnect.model.Message;
import com.uniconnect.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findBySender(User sender);
    List<Message> findByReceiver(User receiver);

    // Aceasta este metoda care lipsea și dădea eroarea
    List<Message> findBySenderAndReceiver(User sender, User receiver);

    // Putem păstra și varianta cu sortare dacă o folosim pe viitor
    List<Message> findBySenderAndReceiverOrderByTimestampAsc(User sender, User receiver);
}
