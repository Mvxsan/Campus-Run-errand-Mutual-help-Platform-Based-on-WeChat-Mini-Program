package com.example.campuserrand.service.impl;

import com.example.campuserrand.model.Review;
import com.example.campuserrand.model.Task;
import com.example.campuserrand.model.User;
import com.example.campuserrand.repository.ReviewRepository;
import com.example.campuserrand.repository.TaskRepository;
import com.example.campuserrand.repository.UserRepository;
import com.example.campuserrand.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public Review createReview(Review review) {
        return reviewRepository.save(review);
    }

    @Override
    public List<Review> findByTaskId(Long taskId) {
        return reviewRepository.findByTaskId(taskId);
    }

    @Override
    public List<Review> findByReviewed(User user) {
        return reviewRepository.findByReviewed(user);
    }

    @Override
    public List<Review> findByReviewer(User user) {
        return reviewRepository.findByReviewer(user);
    }

    @Override
    public Double calculateAverageRating(Long userId) {
        Double averageRating = reviewRepository.calculateAverageRating(userId);
        return averageRating != null ? averageRating : 0.0;
    }

    @Override
    public Double calculatePositiveRate(Long userId) {
        Long positiveCount = reviewRepository.countPositiveReviews(userId);
        Long totalCount = reviewRepository.countTotalReviews(userId);
        if (totalCount == 0) {
            return 0.0;
        }
        return (double) positiveCount / totalCount;
    }

    @Override
    public Integer calculateCreditLevel(Long userId) {
        Double averageRating = calculateAverageRating(userId);
        if (averageRating >= 4.5) {
            return 5; // 五星
        } else if (averageRating >= 4.0) {
            return 4; // 四星
        } else if (averageRating >= 3.5) {
            return 3; // 三星
        } else if (averageRating >= 3.0) {
            return 2; // 二星
        } else {
            return 1; // 一星
        }
    }

    @Override
    public List<Map<String, Object>> getTaskCompletionRanking() {
        // 首先检查是否有普通用户
        String userCheckSql = "SELECT COUNT(*) as user_count FROM users WHERE phone != 'admin'";
        Integer userCount = jdbcTemplate.queryForObject(userCheckSql, Integer.class);
        System.out.println("用户数量: " + userCount);

        // 检查是否有已完成的任务
        String taskCheckSql = "SELECT COUNT(*) as task_count FROM tasks WHERE status = 4";
        Integer taskCount = jdbcTemplate.queryForObject(taskCheckSql, Integer.class);
        System.out.println("已完成任务数量: " + taskCount);

        // 检查任务与用户的关联
        String taskUserCheckSql = "SELECT COUNT(*) as count FROM tasks t JOIN users u ON t.acceptor_id = u.id WHERE (t.status = 4 OR t.status = 6) AND u.phone != 'admin'";
        Integer taskUserCount = jdbcTemplate.queryForObject(taskUserCheckSql, Integer.class);
        System.out.println("已完成任务且关联用户的数量: " + taskUserCount);

        String sql = "SELECT u.id, u.nickname, u.avatar, COUNT(t.id) as task_count " +
                "FROM users u " +
                "JOIN tasks t ON u.id = t.acceptor_id " +
                "WHERE (t.status = 4 OR t.status = 6) AND u.phone != 'admin' " + // 计算已完成和已确认收货的任务，只排除超级管理员
                "GROUP BY u.id, u.nickname, u.avatar " +
                "ORDER BY task_count DESC " +
                "LIMIT 10";

        List<Map<String, Object>> result = jdbcTemplate.query(sql, (rs, rowNum) -> {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", rs.getLong("id"));
            userMap.put("nickname", rs.getString("nickname"));
            userMap.put("avatar", rs.getString("avatar"));
            userMap.put("taskCount", rs.getLong("task_count"));
            return userMap;
        });

        System.out.println("排行榜结果数量: " + result.size());
        return result;
    }

    @Override
    public List<Map<String, Object>> getPositiveRateRanking() {
        String sql = "SELECT u.id, u.nickname, u.avatar, " +
                "COUNT(CASE WHEN r.rating >= 4 THEN 1 END) as positive_count, " +
                "COUNT(r.id) as total_count " +
                "FROM users u " +
                "LEFT JOIN reviews r ON u.id = r.reviewee_id " +
                "GROUP BY u.id, u.nickname, u.avatar " +
                "HAVING total_count >= 5 " +
                "ORDER BY (CASE WHEN total_count > 0 THEN COUNT(CASE WHEN r.rating >= 4 THEN 1 END) / COUNT(r.id) ELSE 0 END) DESC "
                +
                "LIMIT 10";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Map<String, Object> userMap = new HashMap<>();
            long positiveCount = rs.getLong("positive_count");
            long totalCount = rs.getLong("total_count");
            double positiveRate = totalCount > 0 ? (double) positiveCount / totalCount : 0.0;

            userMap.put("id", rs.getLong("id"));
            userMap.put("nickname", rs.getString("nickname"));
            userMap.put("avatar", rs.getString("avatar"));
            userMap.put("positiveRate", positiveRate);
            userMap.put("reviewCount", totalCount);
            return userMap;
        });
    }

    @Override
    public List<Map<String, Object>> getLikesRanking() {
        String sql = "SELECT u.id, u.nickname, u.avatar, " +
                "COUNT(CASE WHEN r.rating >= 4 THEN 1 END) as likes_count " +
                "FROM users u " +
                "LEFT JOIN reviews r ON u.id = r.reviewee_id " +
                "WHERE u.phone != 'admin' " + // 只排除超级管理员
                "GROUP BY u.id, u.nickname, u.avatar " +
                "ORDER BY likes_count DESC " +
                "LIMIT 10";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", rs.getLong("id"));
            userMap.put("nickname", rs.getString("nickname"));
            String avatar = rs.getString("avatar");
            // 去掉/api前缀，确保路径正确
            if (avatar != null && avatar.startsWith("/api")) {
                avatar = avatar.substring(4);
            }
            userMap.put("avatar", avatar);

            return userMap;
        });
    }

    @Override
    public void createMutualReviews(Task task, Map<String, Object> publisherReview,
            Map<String, Object> acceptorReview) {
        User publisher = task.getPublisher();
        User acceptor = task.getAcceptor();

        // 查找已存在的评价
        List<Review> existingReviews = reviewRepository.findByTaskId(task.getId());
        
        // 创建发布者对接受者的评价
        if (publisherReview != null) {
            // 总是创建新评价，实现追加评价功能
            Review review1 = new Review();
            review1.setTask(task);
            review1.setReviewer(publisher);
            review1.setReviewed(acceptor);
            review1.setRating((Integer) publisherReview.get("rating"));
            review1.setContent((String) publisherReview.get("content"));
            review1.setTags((String) publisherReview.get("tags"));
            review1.setImages((String) publisherReview.get("images"));
            review1.setRole("publisher"); // 发布者评价
            review1.setCreatedAt(java.time.LocalDateTime.now());
            review1.setUpdatedAt(java.time.LocalDateTime.now());
            reviewRepository.save(review1);
        }

        // 创建接受者对发布者的评价
        if (acceptorReview != null) {
            // 总是创建新评价，实现追加评价功能
            Review review2 = new Review();
            review2.setTask(task);
            review2.setReviewer(acceptor);
            review2.setReviewed(publisher);
            review2.setRating((Integer) acceptorReview.get("rating"));
            review2.setContent((String) acceptorReview.get("content"));
            review2.setTags((String) acceptorReview.get("tags"));
            review2.setImages((String) acceptorReview.get("images"));
            review2.setRole("receiver"); // 接单员评价
            review2.setCreatedAt(java.time.LocalDateTime.now());
            review2.setUpdatedAt(java.time.LocalDateTime.now());
            reviewRepository.save(review2);
        }
    }
}
