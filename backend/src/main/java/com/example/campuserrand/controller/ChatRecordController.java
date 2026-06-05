package com.example.campuserrand.controller;

import com.example.campuserrand.model.ChatRecord;
import com.example.campuserrand.model.Task;
import com.example.campuserrand.model.User;
import com.example.campuserrand.service.TaskService;
import com.example.campuserrand.service.UserService;
import com.example.campuserrand.repository.ChatRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.util.List;

@RestController
@RequestMapping("/chat-records")
public class ChatRecordController {

    @Autowired
    private ChatRecordRepository chatRecordRepository;

    @Autowired
    private TaskService taskService;

    @Autowired
    private UserService userService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // 消息请求对象
    public static class MessageRequest {
        private Long senderId;
        private Long receiverId;
        private String content;

        public Long getSenderId() {
            return senderId;
        }

        public void setSenderId(Long senderId) {
            this.senderId = senderId;
        }

        public Long getReceiverId() {
            return receiverId;
        }

        public void setReceiverId(Long receiverId) {
            this.receiverId = receiverId;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }

    @PostMapping
    public String create(@RequestBody MessageRequest request) {
        // 验证请求参数
        if (request.getSenderId() == null) {
            return "发送者ID不能为空";
        }
        if (request.getReceiverId() == null) {
            return "接收者ID不能为空";
        }
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            return "消息内容不能为空";
        }

        // 从数据库中获取完整的 User 对象
        User sender = userService.findById(request.getSenderId());
        if (sender == null) {
            return "发送者不存在";
        }

        User receiver = userService.findById(request.getReceiverId());
        if (receiver == null) {
            return "接收者不存在";
        }

        // 使用 JdbcTemplate 直接执行 SQL 插入
        try {
            // 首先检查 tasks 表中是否有数据
            String taskSql = "SELECT id FROM tasks LIMIT 1";
            List<Long> taskIds = jdbcTemplate.queryForList(taskSql, Long.class);
            Long taskId = 1L; // 默认值
            if (!taskIds.isEmpty()) {
                taskId = taskIds.get(0); // 使用第一个任务的 ID
            }

            // 插入聊天记录
            String sql = "INSERT INTO chat_records (task_id, sender_id, receiver_id, content, is_read, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)";
            Timestamp now = new Timestamp(System.currentTimeMillis());
            jdbcTemplate.update(sql, taskId, request.getSenderId(), request.getReceiverId(), request.getContent(),
                    false, now, now);
            return "消息发送成功";
        } catch (Exception e) {
            e.printStackTrace();
            return "消息发送失败: " + e.getMessage();
        }
    }

    @PutMapping("/{id}/read")
    public ChatRecord markAsRead(@PathVariable Long id) {
        ChatRecord chatRecord = chatRecordRepository.findById(id).orElse(null);
        if (chatRecord == null) {
            throw new RuntimeException("聊天记录不存在");
        }
        chatRecord.setIsRead(true);
        return chatRecordRepository.save(chatRecord);
    }

    @GetMapping("/{id}")
    public ChatRecord findById(@PathVariable Long id) {
        return chatRecordRepository.findById(id).orElse(null);
    }

    @GetMapping("/task/{taskId}")
    public List<ChatRecord> findByTask(@PathVariable Long taskId) {
        Task task = taskService.findById(taskId);
        if (task == null) {
            throw new RuntimeException("任务不存在");
        }
        return chatRecordRepository.findByTask(task);
    }

    @GetMapping("/users")
    public List<ChatRecord> findByUsers(@RequestParam Long userId1, @RequestParam Long userId2) {
        User user1 = userService.findById(userId1);
        User user2 = userService.findById(userId2);
        if (user1 == null || user2 == null) {
            throw new RuntimeException("用户不存在");
        }
        return chatRecordRepository.findBySenderAndReceiverOrSenderAndReceiver(user1, user2, user2, user1);
    }

    @GetMapping("/user/{userId}")
    public List<ChatRecord> findByUser(@PathVariable Long userId) {
        User user = userService.findById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        // 这里我们需要查询该用户发送或接收的所有聊天记录
        // 由于我们的 ChatRecordRepository 没有提供这样的方法，我们可以使用 JdbcTemplate 直接执行 SQL 查询
        String sql = "SELECT * FROM chat_records WHERE sender_id = ? OR receiver_id = ? ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, new Object[] { userId, userId }, (rs, rowNum) -> {
            ChatRecord chatRecord = new ChatRecord();
            chatRecord.setId(rs.getLong("id"));
            chatRecord.setContent(rs.getString("content"));
            chatRecord.setIsRead(rs.getBoolean("is_read"));
            chatRecord.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            if (rs.getTimestamp("updated_at") != null) {
                chatRecord.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
            }

            // 加载发送者信息
            Long senderId = rs.getLong("sender_id");
            User sender = userService.findById(senderId);
            chatRecord.setSender(sender);

            // 加载接收者信息
            Long receiverId = rs.getLong("receiver_id");
            User receiver = userService.findById(receiverId);
            chatRecord.setReceiver(receiver);

            return chatRecord;
        });
    }
}