package com.example.campuserrand.controller;

import com.example.campuserrand.model.User;
import com.example.campuserrand.service.FollowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/follows")
public class FollowController {

    @Autowired
    private FollowService followService;

    // 关注用户
    @PostMapping
    public ResponseEntity<?> followUser(@RequestBody FollowRequest request) {
        try {
            followService.followUser(request.getFollowerId(), request.getFollowingId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 取消关注
    @DeleteMapping
    public ResponseEntity<?> unfollowUser(@RequestParam Long followerId, @RequestParam Long followingId) {
        try {
            followService.unfollowUser(followerId, followingId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 检查是否已关注
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkFollow(@RequestParam Long followerId, @RequestParam Long followingId) {
        boolean isFollowing = followService.isFollowing(followerId, followingId);
        return ResponseEntity.ok(isFollowing);
    }

    // 获取用户关注的列表
    @GetMapping("/{userId}/following")
    public ResponseEntity<List<User>> getFollowingList(@PathVariable Long userId) {
        List<User> followingList = followService.getFollowingUsers(userId);
        return ResponseEntity.ok(followingList);
    }

    // 关注请求的参数类
    public static class FollowRequest {
        private Long followerId;
        private Long followingId;

        // getter 和 setter 方法
        public Long getFollowerId() {
            return followerId;
        }

        public void setFollowerId(Long followerId) {
            this.followerId = followerId;
        }

        public Long getFollowingId() {
            return followingId;
        }

        public void setFollowingId(Long followingId) {
            this.followingId = followingId;
        }
    }
}
