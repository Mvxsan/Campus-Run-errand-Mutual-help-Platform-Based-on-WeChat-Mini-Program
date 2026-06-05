package com.example.campuserrand.service.impl;

import com.example.campuserrand.model.Order;
import com.example.campuserrand.model.User;
import com.example.campuserrand.repository.OrderRepository;
import com.example.campuserrand.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Override
    public Order create(Order order) {
        order.setStatus(0); // 待支付状态
        return orderRepository.save(order);
    }

    @Override
    public Order pay(Long orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            throw new RuntimeException("订单不存在");
        }
        if (order.getStatus() != 0) {
            throw new RuntimeException("订单状态错误");
        }
        order.setStatus(1); // 已支付状态
        order.setPaymentTime(LocalDateTime.now());
        return orderRepository.save(order);
    }

    @Override
    public Order complete(Long orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            throw new RuntimeException("订单不存在");
        }
        if (order.getStatus() != 1) {
            throw new RuntimeException("订单状态错误");
        }
        order.setStatus(2); // 已完成状态
        order.setCompletionTime(LocalDateTime.now());
        return orderRepository.save(order);
    }

    @Override
    public Order cancel(Long orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            throw new RuntimeException("订单不存在");
        }
        if (order.getStatus() == 2) {
            throw new RuntimeException("订单已完成，无法取消");
        }
        order.setStatus(3); // 已取消状态
        return orderRepository.save(order);
    }

    @Override
    public Order findById(Long id) {
        return orderRepository.findById(id).orElse(null);
    }

    @Override
    public List<Order> findByPublisher(User publisher) {
        return orderRepository.findByPublisher(publisher);
    }

    @Override
    public List<Order> findByAcceptor(User acceptor) {
        return orderRepository.findByAcceptor(acceptor);
    }

    @Override
    public List<Order> findByStatus(Integer status) {
        return orderRepository.findByStatus(status);
    }

    @Override
    public List<Order> findAll() {
        return orderRepository.findAll();
    }
}