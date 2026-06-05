package com.example.campuserrand.repository;

import com.example.campuserrand.model.Message;
import com.example.campuserrand.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByReceiver(User receiver);
    List<Message> findByReceiverAndIsRead(User receiver, Boolean isRead);
}