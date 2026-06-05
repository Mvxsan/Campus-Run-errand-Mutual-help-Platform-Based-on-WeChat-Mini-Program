package com.example.campuserrand.service;

import com.example.campuserrand.model.Review;
import com.example.campuserrand.model.Task;
import com.example.campuserrand.model.User;

import java.util.List;
import java.util.Map;

public interface ReviewService {
    // 创建评价
    Review createReview(Review review);
    
    // 根据任务ID查找评价
    List<Review> findByTaskId(Long taskId);
    
    // 根据被评价用户ID查找评价
    List<Review> findByReviewed(User user);
    
    // 根据评价者ID查找评价
    List<Review> findByReviewer(User user);
    
    // 计算用户的平均评分
    Double calculateAverageRating(Long userId);
    
    // 计算用户的好评率
    Double calculatePositiveRate(Long userId);
    
    // 计算用户的信用等级
    Integer calculateCreditLevel(Long userId);
    
    // 获取任务完成榜
    List<Map<String, Object>> getTaskCompletionRanking();
    
    // 获取好评率榜
    List<Map<String, Object>> getPositiveRateRanking();
    
    // 获取获赞榜
    List<Map<String, Object>> getLikesRanking();
    
    // 为任务双方创建评价
    void createMutualReviews(Task task, Map<String, Object> publisherReview, Map<String, Object> acceptorReview);
}
