package com.example.campuserrand.service;

import com.example.campuserrand.model.Like;
import com.example.campuserrand.model.User;

import java.util.List;
import java.util.Map;

public interface LikeService {
    // 点赞或取消点赞
    Map<String, Object> toggleLike(Long userId, Long targetUserId);
    
    // 检查用户是否已点赞
    boolean isLiked(Long userId, Long targetUserId);
    
    // 获取用户的点赞数
    int getLikeCount(Long userId);
    
    // 获取点赞排行榜
    Map<String, Object> getLikeRanking(int limit);
    
    // 获取用户点赞的用户列表
    List<com.example.campuserrand.model.User> getLikedUsers(Long userId);
}