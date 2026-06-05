package com.example.campuserrand.service;

import com.example.campuserrand.model.User;

public interface UserService {
    User register(User user);

    User login(String phone, String password);

    User findByPhone(String phone);

    User findById(Long id);

    User update(User user);

    java.util.List<User> searchUsers(String keyword);
}