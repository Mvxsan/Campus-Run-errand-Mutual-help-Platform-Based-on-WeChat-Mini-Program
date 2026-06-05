package com.example.campuserrand.controller;

import com.example.campuserrand.model.Order;
import com.example.campuserrand.model.User;
import com.example.campuserrand.service.OrderService;
import com.example.campuserrand.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @PostMapping
    public Order create(@RequestBody Order order) {
        return orderService.create(order);
    }

    @PutMapping("/{id}/pay")
    public Order pay(@PathVariable Long id) {
        return orderService.pay(id);
    }

    @PutMapping("/{id}/complete")
    public Order complete(@PathVariable Long id) {
        return orderService.complete(id);
    }

    @PutMapping("/{id}/cancel")
    public Order cancel(@PathVariable Long id) {
        return orderService.cancel(id);
    }

    @GetMapping("/{id}")
    public Order findById(@PathVariable Long id) {
        return orderService.findById(id);
    }

    @GetMapping("/publisher/{publisherId}")
    public List<Order> findByPublisher(@PathVariable Long publisherId) {
        User publisher = userService.findById(publisherId);
        if (publisher == null) {
            throw new RuntimeException("用户不存在");
        }
        return orderService.findByPublisher(publisher);
    }

    @GetMapping("/acceptor/{acceptorId}")
    public List<Order> findByAcceptor(@PathVariable Long acceptorId) {
        User acceptor = userService.findById(acceptorId);
        if (acceptor == null) {
            throw new RuntimeException("用户不存在");
        }
        return orderService.findByAcceptor(acceptor);
    }

    @GetMapping("/status/{status}")
    public List<Order> findByStatus(@PathVariable Integer status) {
        return orderService.findByStatus(status);
    }

    @GetMapping
    public List<Order> findAll() {
        return orderService.findAll();
    }
}