package com.example.campuserrand.repository;

import com.example.campuserrand.model.Review;
import com.example.campuserrand.model.User;
import org.springframework.data.jpa.repository.JpaRepository;import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    // 根据被评价用户ID查找评价
    List<Review> findByReviewed(User reviewed);
    
    // 根据评价者ID查找评价
    List<Review> findByReviewer(User reviewer);
    
    // 根据任务ID查找评价
    List<Review> findByTaskId(Long taskId);
    
    // 计算用户的平均评分
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewed.id = ?1")
    Double calculateAverageRating(Long userId);
    
    // 计算用户的好评率（4星及以上）
    @Query("SELECT COUNT(r) FROM Review r WHERE r.reviewed.id = ?1 AND r.rating >= 4")
    Long countPositiveReviews(Long userId);
    
    // 计算用户的总评价数
    @Query("SELECT COUNT(r) FROM Review r WHERE r.reviewed.id = ?1")
    Long countTotalReviews(Long userId);
}
