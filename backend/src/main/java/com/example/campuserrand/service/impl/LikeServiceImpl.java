package com.example.campuserrand.service.impl;

import com.example.campuserrand.model.Like;
import com.example.campuserrand.model.User;
import com.example.campuserrand.repository.LikeRepository;
import com.example.campuserrand.repository.UserRepository;
import com.example.campuserrand.service.LikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class LikeServiceImpl implements LikeService {

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Map<String, Object> toggleLike(Long userId, Long targetUserId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 查找用户和目标用户
            User user = userRepository.findById(userId).orElse(null);
            User targetUser = userRepository.findById(targetUserId).orElse(null);
            
            if (user == null || targetUser == null) {
                result.put("success", false);
                result.put("error", "用户不存在");
                return result;
            }
            
            // 检查是否已经点赞
            Optional<Like> existingLike = likeRepository.findByUserAndLikedUser(user, targetUser);
            
            if (existingLike.isPresent()) {
                // 取消点赞
                likeRepository.delete(existingLike.get());
                
                result.put("success", true);
                result.put("action", "unlike");
                result.put("likesCount", likeRepository.countByLikedUser_Id(targetUserId));
            } else {
                // 执行点赞
                Like like = new Like();
                like.setUser(user);
                like.setLikedUser(targetUser);
                likeRepository.save(like);
                
                result.put("success", true);
                result.put("action", "like");
                result.put("likesCount", likeRepository.countByLikedUser_Id(targetUserId));
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", "操作失败: " + e.getMessage());
            e.printStackTrace();
        }
        
        return result;
    }

    @Override
    public boolean isLiked(Long userId, Long targetUserId) {
        User user = userRepository.findById(userId).orElse(null);
        User targetUser = userRepository.findById(targetUserId).orElse(null);
        
        if (user == null || targetUser == null) {
            return false;
        }
        
        Optional<Like> existingLike = likeRepository.findByUserAndLikedUser(user, targetUser);
        return existingLike.isPresent();
    }

    @Override
    public int getLikeCount(Long userId) {
        return (int) likeRepository.countByLikedUser_Id(userId);
    }

    @Override
    public Map<String, Object> getLikeRanking(int limit) {
        Map<String, Object> result = new HashMap<>();
        
        // 查询所有用户
        List<User> users = userRepository.findAll();
        System.out.println("查询到的用户数量: " + users.size());
        
        // 构建排行榜数据
        List<Map<String, Object>> ranking = new ArrayList<>();
        for (User user : users) {
            // 从数据库中重新计算点赞数，确保数据一致性
            long likesCount = likeRepository.countByLikedUser_Id(user.getId());
            System.out.println("用户 " + user.getNickname() + " (ID: " + user.getId() + ") 的点赞数: " + likesCount);
            
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("nickname", user.getNickname());
            userData.put("avatar", user.getAvatar());
            userData.put("likesCount", likesCount);
            ranking.add(userData);
        }
        
        // 按点赞数排序
        ranking.sort((u1, u2) -> {
            long likesCount1 = (Long) u1.get("likesCount");
            long likesCount2 = (Long) u2.get("likesCount");
            return Long.compare(likesCount2, likesCount1);
        });
        
        // 限制返回数量
        if (ranking.size() > limit) {
            ranking = ranking.subList(0, limit);
        }
        
        // 添加排名
        for (int i = 0; i < ranking.size(); i++) {
            ranking.get(i).put("rank", i + 1);
        }
        
        System.out.println("获赞榜数据: " + ranking);
        result.put("ranking", ranking);
        result.put("total", ranking.size());
        
        return result;
    }

    @Override
    public List<com.example.campuserrand.model.User> getLikedUsers(Long userId) {
        List<Like> likes = likeRepository.findByUser_Id(userId);
        List<com.example.campuserrand.model.User> likedUsers = new ArrayList<>();
        for (Like like : likes) {
            likedUsers.add(like.getLikedUser());
        }
        return likedUsers;
    }
}