package com.example.campuserrand.service;

import com.example.campuserrand.model.User;

import java.util.List;

public interface FollowService {
    
    // 关注用户
    void followUser(Long followerId, Long followingId);
    
    // 取消关注
    void unfollowUser(Long followerId, Long followingId);
    
    // 检查是否已关注
    boolean isFollowing(Long followerId, Long followingId);
    
    // 获取用户关注的所有用户
    List<User> getFollowingUsers(Long userId);
    
    // 获取用户的粉丝
    List<User> getFollowers(Long userId);
    
    // 获取关注数量
    long getFollowingCount(Long userId);
    
    // 获取粉丝数量
    long getFollowerCount(Long userId);
}
