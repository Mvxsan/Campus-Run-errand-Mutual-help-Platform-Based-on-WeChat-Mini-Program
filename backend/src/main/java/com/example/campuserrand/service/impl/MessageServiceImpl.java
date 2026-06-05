package com.example.campuserrand.service.impl;

import com.example.campuserrand.model.Message;
import com.example.campuserrand.model.Task;
import com.example.campuserrand.model.User;
import com.example.campuserrand.repository.MessageRepository;
import com.example.campuserrand.repository.TaskRepository;
import com.example.campuserrand.repository.UserRepository;
import com.example.campuserrand.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class MessageServiceImpl implements MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Override
    public Message create(Message message) {
        message.setIsRead(false);
        message.setCreatedAt(LocalDateTime.now());
        return messageRepository.save(message);
    }

    @Override
    public void sendOrderStatusMessage(Long taskId, Integer oldStatus, Integer newStatus) {
        try {
            Task task = taskRepository.findById(taskId).orElse(null);
            if (task == null) {
                return;
            }

            User publisher = task.getPublisher();
            User acceptor = task.getAcceptor();

            String statusMessage = getStatusMessage(newStatus);
            String title = "订单状态更新";
            String content = "您的任务\"" + task.getTitle() + "\"状态已更新为：" + statusMessage;

            // 发送消息给发布者
            if (publisher != null) {
                sendMessage(publisher.getId(), title, content);
            }

            // 发送消息给接取者
            if (acceptor != null) {
                sendMessage(acceptor.getId(), title, content);
            }
        } catch (Exception e) {
            // 捕获所有异常，避免影响主流程
            System.out.println("发送消息失败: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void sendMessage(Long receiverId, String title, String content) {
        try {
            // 获取接收者用户对象
            User receiver = userRepository.findById(receiverId).orElse(null);
            if (receiver == null) {
                System.out.println("接收者用户不存在: " + receiverId);
                return;
            }
            
            // 获取发送者用户对象（系统管理员）
            User sender = userRepository.findById(1L).orElse(null);
            
            Message message = new Message();
            message.setTitle(title);
            message.setContent(content);
            message.setType("order");
            message.setSender(sender);
            message.setReceiver(receiver);
            message.setIsRead(false);
            message.setCreatedAt(LocalDateTime.now());
            messageRepository.save(message);
        } catch (Exception e) {
            // 捕获所有异常，避免影响主流程
            System.out.println("发送消息失败: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String getStatusMessage(Integer status) {
        switch (status) {
            case 0:
                return "待接单";
            case 1:
                return "已接单";
            case 2:
                return "已取货";
            case 3:
                return "已送达";
            case 4:
                return "已完成";
            case 5:
                return "已取消";
            case 6:
                return "已确认收货";
            default:
                return "未知状态";
        }
    }
}
