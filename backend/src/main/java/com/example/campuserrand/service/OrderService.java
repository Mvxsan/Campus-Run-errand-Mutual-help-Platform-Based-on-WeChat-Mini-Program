package com.example.campuserrand.service;

import com.example.campuserrand.model.Order;
import com.example.campuserrand.model.User;

import java.util.List;

public interface OrderService {
    Order create(Order order);
    Order pay(Long orderId);
    Order complete(Long orderId);
    Order cancel(Long orderId);
    Order findById(Long id);
    List<Order> findByPublisher(User publisher);
    List<Order> findByAcceptor(User acceptor);
    List<Order> findByStatus(Integer status);
    List<Order> findAll();
}