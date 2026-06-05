package com.example.campuserrand.controller;

import com.example.campuserrand.model.Review;
import com.example.campuserrand.model.Task;
import com.example.campuserrand.model.User;
import com.example.campuserrand.service.ReviewService;
import com.example.campuserrand.service.TaskService;
import com.example.campuserrand.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private TaskService taskService;

    @Autowired
    private UserService userService;

    // 创建评价
    @PostMapping
    public Review create(@RequestBody Review review) {
        return reviewService.createReview(review);
    }

    // 根据任务ID获取评价
    @GetMapping("/task/{taskId}")
    public List<Review> getByTaskId(@PathVariable Long taskId) {
        return reviewService.findByTaskId(taskId);
    }

    // 根据用户ID获取收到的评价
    @GetMapping("/user/{userId}")
    public List<Review> getByUserId(@PathVariable Long userId) {
        User user = userService.findById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        return reviewService.findByReviewed(user);
    }

    // 根据用户ID获取发出的评价
    @GetMapping("/reviewer/{userId}")
    public List<Review> getByReviewerId(@PathVariable Long userId) {
        User user = userService.findById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        return reviewService.findByReviewer(user);
    }

    // 计算用户的平均评分
    @GetMapping("/user/{userId}/rating")
    public Double getAverageRating(@PathVariable Long userId) {
        return reviewService.calculateAverageRating(userId);
    }

    // 计算用户的好评率
    @GetMapping("/user/{userId}/positive-rate")
    public Double getPositiveRate(@PathVariable Long userId) {
        return reviewService.calculatePositiveRate(userId);
    }

    // 计算用户的信用等级
    @GetMapping("/user/{userId}/credit-level")
    public Integer getCreditLevel(@PathVariable Long userId) {
        return reviewService.calculateCreditLevel(userId);
    }

    // 获取任务完成榜
    @GetMapping("/ranking/task-completion")
    public List<Map<String, Object>> getTaskCompletionRanking() {
        return reviewService.getTaskCompletionRanking();
    }

    // 获取好评率榜
    @GetMapping("/ranking/positive-rate")
    public List<Map<String, Object>> getPositiveRateRanking() {
        return reviewService.getPositiveRateRanking();
    }

    // 获取获赞榜
    @GetMapping("/ranking/likes")
    public List<Map<String, Object>> getLikesRanking() {
        return reviewService.getLikesRanking();
    }

    // 为任务双方创建评价
    @PostMapping("/task/{taskId}/mutual")
    public String createMutualReviews(@PathVariable Long taskId, @RequestBody Map<String, Object> request) {
        try {
            Task task = taskService.findById(taskId);
            if (task == null) {
                throw new RuntimeException("任务不存在");
            }

            Map<String, Object> publisherReview = (Map<String, Object>) request.get("publisherReview");
            Map<String, Object> acceptorReview = (Map<String, Object>) request.get("acceptorReview");

            System.out.println("Received review request for task " + taskId);
            System.out.println("Publisher review: " + publisherReview);
            System.out.println("Acceptor review: " + acceptorReview);

            reviewService.createMutualReviews(task, publisherReview, acceptorReview);
            System.out.println("Review created successfully for task " + taskId);
            return "评价创建成功";
        } catch (Exception e) {
            System.out.println("Error creating review: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
