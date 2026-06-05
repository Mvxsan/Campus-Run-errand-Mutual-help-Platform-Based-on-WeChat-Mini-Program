package com.example.campuserrand.controller;

import com.example.campuserrand.model.Message;
import com.example.campuserrand.model.User;
import com.example.campuserrand.service.UserService;
import com.example.campuserrand.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/messages")
public class MessageController {

    private static final Logger logger = LoggerFactory.getLogger(MessageController.class);

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserService userService;

    @PostMapping
    public Message create(@RequestBody Message message) {
        try {
            logger.info("收到创建消息请求: {}", message);
            // 设置默认值
            if (message.getSenderId() != null) {
                logger.info("发送者ID: {}", message.getSenderId());
                User sender = userService.findById(message.getSenderId());
                logger.info("找到发送者: {}", sender);
                message.setSender(sender);
            }
            if (message.getReceiverId() != null) {
                logger.info("接收者ID: {}", message.getReceiverId());
                User receiver = userService.findById(message.getReceiverId());
                logger.info("找到接收者: {}", receiver);
                if (receiver == null) {
                    logger.error("接收者不存在，ID: {}", message.getReceiverId());
                    throw new RuntimeException("接收者不存在");
                }
                message.setReceiver(receiver);
            } else if (message.getReceiver() == null) {
                logger.error("接收者不能为空");
                throw new RuntimeException("接收者不能为空");
            }
            message.setIsRead(false);
            message.setCreatedAt(LocalDateTime.now());
            logger.info("准备保存消息: {}", message);
            Message savedMessage = messageRepository.save(message);
            logger.info("消息保存成功: {}", savedMessage);
            return savedMessage;
        } catch (Exception e) {
            logger.error("创建消息失败: {}", e.getMessage(), e);
            throw new RuntimeException("创建消息失败: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/read")
    public Message markAsRead(@PathVariable Long id) {
        Message message = messageRepository.findById(id).orElse(null);
        if (message == null) {
            throw new RuntimeException("消息不存在");
        }
        message.setIsRead(true);
        return messageRepository.save(message);
    }

    @GetMapping("/{id}")
    public Message findById(@PathVariable Long id) {
        return messageRepository.findById(id).orElse(null);
    }

    @GetMapping("/receiver/{receiverId}")
    public List<Message> findByReceiver(@PathVariable Long receiverId) {
        User receiver = userService.findById(receiverId);
        if (receiver == null) {
            throw new RuntimeException("用户不存在");
        }
        return messageRepository.findByReceiver(receiver);
    }

    @GetMapping("/receiver/{receiverId}/unread")
    public List<Message> findUnreadByReceiver(@PathVariable Long receiverId) {
        User receiver = userService.findById(receiverId);
        if (receiver == null) {
            throw new RuntimeException("用户不存在");
        }
        return messageRepository.findByReceiverAndIsRead(receiver, false);
    }

    @GetMapping
    public List<Message> findAll() {
        return messageRepository.findAll();
    }
}