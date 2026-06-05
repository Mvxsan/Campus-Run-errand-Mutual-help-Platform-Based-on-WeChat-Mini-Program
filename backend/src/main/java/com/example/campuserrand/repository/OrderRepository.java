package com.example.campuserrand.repository;

import com.example.campuserrand.model.Order;
import com.example.campuserrand.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByPublisher(User publisher);
    List<Order> findByAcceptor(User acceptor);
    List<Order> findByStatus(Integer status);
}