package com.example.campuserrand.controller;

import com.example.campuserrand.service.LikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/likes")
public class LikeController {

    @Autowired
    private LikeService likeService;

    @GetMapping("/ranking")
    public Map<String, Object> getLikesRanking() {
        Map<String, Object> ranking = likeService.getLikeRanking(10);
        Map<String, Object> result = new HashMap<>();
        result.put("ranking", ranking.get("ranking"));
        return result;
    }

    // 点赞/取消点赞接口（支持JSON请求体）
    @PostMapping("/toggle")
    public Map<String, Object> toggleLike(@RequestBody Map<String, Long> request) {
        Map<String, Object> result = new HashMap<>();
        try {
            Long userId = request.get("userId");
            Long targetUserId = request.get("targetUserId");
            
            Map<String, Object> toggleResult = likeService.toggleLike(userId, targetUserId);
            result.put("success", true);
            result.put("action", toggleResult.get("action"));
            result.put("likesCount", toggleResult.get("likesCount"));
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", e.getMessage());
        }
        return result;
    }

    @GetMapping("/count/{userId}")
    public Map<String, Object> getLikeCount(@PathVariable Long userId) {
        Map<String, Object> result = new HashMap<>();
        result.put("count", likeService.getLikeCount(userId));
        return result;
    }

    @GetMapping("/check")
    public Map<String, Object> checkLiked(@RequestParam Long userId, @RequestParam Long targetUserId) {
        Map<String, Object> result = new HashMap<>();
        result.put("isLiked", likeService.isLiked(userId, targetUserId));
        return result;
    }

    // 获取用户点赞的用户列表
    @GetMapping("/user/{userId}")
    public List<com.example.campuserrand.model.User> getLikedUsers(@PathVariable Long userId) {
        return likeService.getLikedUsers(userId);
    }
}
