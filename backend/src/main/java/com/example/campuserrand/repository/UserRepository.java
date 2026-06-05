package com.example.campuserrand.repository;

import com.example.campuserrand.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByPhone(String phone);

    java.util.List<User> findByPhoneOrNicknameContaining(String phone, String nickname);
}