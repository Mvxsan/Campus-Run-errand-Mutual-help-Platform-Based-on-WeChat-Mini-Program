package com.example.campuserrand.service;

import com.example.campuserrand.model.Message;

public interface MessageService {
    // 创建消息
    Message create(Message message);
    
    // 发送订单状态变更消息
    void sendOrderStatusMessage(Long taskId, Integer oldStatus, Integer newStatus);
}
