package com.example.campuserrand.service.impl;

import com.example.campuserrand.model.Follow;
import com.example.campuserrand.model.User;
import com.example.campuserrand.repository.FollowRepository;
import com.example.campuserrand.repository.UserRepository;
import com.example.campuserrand.service.FollowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class FollowServiceImpl implements FollowService {

    @Autowired
    private FollowRepository followRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void followUser(Long followerId, Long followingId) {
        // 检查是否已经关注
        if (followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            return;
        }

        // 创建关注关系
        Follow follow = new Follow(followerId, followingId);
        followRepository.save(follow);
    }

    @Override
    public void unfollowUser(Long followerId, Long followingId) {
        followRepository.deleteByFollowerIdAndFollowingId(followerId, followingId);
    }

    @Override
    public boolean isFollowing(Long followerId, Long followingId) {
        return followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
    }

    @Override
    public List<User> getFollowingUsers(Long userId) {
        // 获取用户关注的所有用户 ID
        List<Long> followingIds = followRepository.findFollowingIdsByFollowerId(userId);

        // 根据 ID 获取用户信息
        return userRepository.findAllById(followingIds);
    }

    @Override
    public List<User> getFollowers(Long userId) {
        // 获取用户的所有粉丝 ID
        List<Long> followerIds = followRepository.findFollowerIdsByFollowingId(userId);

        // 根据 ID 获取用户信息
        return userRepository.findAllById(followerIds);
    }

    @Override
    public long getFollowingCount(Long userId) {
        return followRepository.countByFollowerId(userId);
    }

    @Override
    public long getFollowerCount(Long userId) {
        return followRepository.countByFollowingId(userId);
    }
}
