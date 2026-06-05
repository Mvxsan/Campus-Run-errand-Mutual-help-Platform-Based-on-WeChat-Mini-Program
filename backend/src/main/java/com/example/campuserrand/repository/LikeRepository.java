package com.example.campuserrand.repository;

import com.example.campuserrand.model.Like;
import com.example.campuserrand.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    // 根据点赞用户和被点赞用户查找点赞记录
    Optional<Like> findByUserAndLikedUser(User user, User likedUser);
    
    // 统计用户的点赞数
    long countByLikedUser_Id(Long likedUserId);
    
    // 根据用户ID查找该用户点赞的所有记录
    List<Like> findByUser_Id(Long userId);
}