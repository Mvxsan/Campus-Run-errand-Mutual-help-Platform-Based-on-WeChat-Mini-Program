package com.example.campuserrand.repository;

import com.example.campuserrand.model.ChatRecord;
import com.example.campuserrand.model.Task;
import com.example.campuserrand.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRecordRepository extends JpaRepository<ChatRecord, Long> {
    List<ChatRecord> findByTask(Task task);

    List<ChatRecord> findBySenderAndReceiverOrSenderAndReceiver(User sender1, User receiver1, User sender2,
            User receiver2);
}