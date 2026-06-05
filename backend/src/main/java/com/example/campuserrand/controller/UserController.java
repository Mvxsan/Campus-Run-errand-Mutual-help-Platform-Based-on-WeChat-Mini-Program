package com.example.campuserrand.controller;

import com.example.campuserrand.model.User;
import com.example.campuserrand.service.UserService;
import com.example.campuserrand.repository.UserRepository;
import com.example.campuserrand.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.register(user);
    }

    @PostMapping("/login")
    public User login(@RequestBody java.util.Map<String, String> credentials) {
        String phone = credentials.get("phone");
        String password = credentials.get("password");
        return userService.login(phone, password);
    }

    @GetMapping("/{id}")
    public User findById(@PathVariable Long id) {
        return userService.findById(id);
    }

    @PutMapping
    public User update(@RequestBody User user) {
        return userService.update(user);
    }

    // 管理员接口
    @GetMapping("/admin/list")
    public List<User> listUsers() {
        return userRepository.findAll();
    }

    @PutMapping("/admin/update-role/{id}")
    public User updateUserRole(@PathVariable Long id, @RequestParam Integer role) {
        User user = userService.findById(id);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        // 保护固定管理员账号，不可修改其角色
        if ("admin".equals(user.getPhone())) {
            throw new RuntimeException("固定管理员账号不可修改角色");
        }
        user.setRole(role);
        return userService.update(user);
    }

    @PutMapping("/admin/update-status/{id}")
    public User updateUserStatus(@PathVariable Long id, @RequestParam Integer status) {
        User user = userService.findById(id);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        // 保护固定管理员账号，不可禁用
        if ("admin".equals(user.getPhone())) {
            throw new RuntimeException("固定管理员账号不可禁用");
        }
        user.setStatus(status);
        return userService.update(user);
    }

    @DeleteMapping("/admin/delete/{id}")
    public void deleteUser(@PathVariable Long id) {
        User user = userService.findById(id);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        // 保护固定管理员账号，不可删除
        if ("admin".equals(user.getPhone())) {
            throw new RuntimeException("固定管理员账号不可删除");
        }
        userRepository.deleteById(id);
    }

    // 用户统计信息接口
    @GetMapping("/stats/{userId}")
    public java.util.Map<String, Object> getUserStats(@PathVariable Long userId) {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        // 获取用户发布的任务数量
        long publishedTasks = taskRepository.countByPublisherId(userId);
        // 获取用户接取的任务数量
        long acceptedTasks = taskRepository.countByAcceptorId(userId);
        // 获取用户完成的任务数量（包括已完成和已确认收货的任务）
        long completedTasks = taskRepository.countByAcceptorIdAndStatus(userId, 4)
                + taskRepository.countByAcceptorIdAndStatus(userId, 6);
        // 获取用户信誉值（这里简化处理，实际项目中应该根据任务完成情况计算）
        double reputation = 4.8;
        stats.put("publishedTasks", publishedTasks);
        stats.put("acceptedTasks", acceptedTasks);
        stats.put("completedTasks", completedTasks);
        stats.put("reputation", reputation);
        return stats;
    }

    // 头像上传接口
    @PostMapping("/upload-avatar")
    public java.util.Map<String, String> uploadAvatar(@RequestParam("file") MultipartFile file) {
        java.util.Map<String, String> result = new java.util.HashMap<>();

        if (file.isEmpty()) {
            result.put("error", "文件不能为空");
            return result;
        }

        try {
            // 获取项目根目录的绝对路径
            String projectRoot = System.getProperty("user.dir");
            // 确保上传目录存在，使用绝对路径
            File uploadDir = new File(projectRoot, "uploads");
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // 生成唯一文件名
            String originalFilename = file.getOriginalFilename();
            String fileExtension = ".png"; // 默认扩展名
            if (originalFilename != null && originalFilename.lastIndexOf(".") != -1) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + fileExtension;

            // 保存文件
            File dest = new File(uploadDir, filename);
            file.transferTo(dest);

            // 构建文件访问URL
            String fileUrl = "/api/uploads/" + filename;
            result.put("url", fileUrl);
            result.put("filename", filename);
            result.put("uploadDir", uploadDir.getAbsolutePath());

        } catch (IOException e) {
            e.printStackTrace();
            result.put("error", "文件上传失败: " + e.getMessage());
        }

        return result;
    }

    // 检查手机号是否存在
    @GetMapping("/check-phone")
    public java.util.Map<String, Boolean> checkPhoneExists(@RequestParam String phone) {
        java.util.Map<String, Boolean> result = new java.util.HashMap<>();
        User user = userService.findByPhone(phone);
        result.put("exists", user != null);
        return result;
    }

    // 管理员搜索用户接口
    @GetMapping("/admin/search")
    public List<User> searchUsers(@RequestParam String keyword) {
        return userService.searchUsers(keyword);
    }

    // 获取用户收入统计
    @GetMapping("/income-stats/{userId}")
    public java.util.Map<String, Object> getIncomeStats(@PathVariable Long userId) {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        
        // 查询用户作为接单人完成的任务，计算总收入（包括已完成和已确认收货的任务）
        List<com.example.campuserrand.model.Task> status4Tasks = taskRepository.findByAcceptorIdAndStatus(userId, 4);
        List<com.example.campuserrand.model.Task> status6Tasks = taskRepository.findByAcceptorIdAndStatus(userId, 6);
        
        double totalIncome = 0;
        for (com.example.campuserrand.model.Task task : status4Tasks) {
            if (task.getReward() != null) {
                totalIncome += task.getReward();
            }
        }
        for (com.example.campuserrand.model.Task task : status6Tasks) {
            if (task.getReward() != null) {
                totalIncome += task.getReward();
            }
        }
        
        // 获取用户当前余额作为总提现的参考（实际项目中应该有提现记录表）
        User user = userService.findById(userId);
        double totalWithdrawal = 0;
        if (user != null && user.getBalance() != null) {
            // 简单计算：总收入 - 当前余额 = 已提现金额
            totalWithdrawal = totalIncome - user.getBalance();
            if (totalWithdrawal < 0) {
                totalWithdrawal = 0;
            }
        }
        
        stats.put("totalIncome", totalIncome);
        stats.put("totalWithdrawal", totalWithdrawal);
        return stats;
    }

    // 获取用户收入明细
    @GetMapping("/income-detail/{userId}")
    public java.util.Map<String, Object> getIncomeDetail(@PathVariable Long userId) {
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        
        // 查询用户作为接单人完成的任务，获取收入记录（包括已完成和已确认收货的任务）
        List<com.example.campuserrand.model.Task> status4Tasks = taskRepository.findByAcceptorIdAndStatus(userId, 4);
        List<com.example.campuserrand.model.Task> status6Tasks = taskRepository.findByAcceptorIdAndStatus(userId, 6);
        
        List<java.util.Map<String, Object>> incomeRecords = new ArrayList<>();
        double totalIncome = 0;
        
        for (com.example.campuserrand.model.Task task : status4Tasks) {
            java.util.Map<String, Object> record = new java.util.HashMap<>();
            record.put("id", task.getId());
            record.put("taskTitle", task.getTitle());
            record.put("amount", task.getReward() != null ? task.getReward() : 0);
            record.put("time", task.getUpdatedAt() != null ? task.getUpdatedAt() : task.getCreatedAt());
            incomeRecords.add(record);
            
            if (task.getReward() != null) {
                totalIncome += task.getReward();
            }
        }
        for (com.example.campuserrand.model.Task task : status6Tasks) {
            java.util.Map<String, Object> record = new java.util.HashMap<>();
            record.put("id", task.getId());
            record.put("taskTitle", task.getTitle());
            record.put("amount", task.getReward() != null ? task.getReward() : 0);
            record.put("time", task.getUpdatedAt() != null ? task.getUpdatedAt() : task.getCreatedAt());
            incomeRecords.add(record);
            
            if (task.getReward() != null) {
                totalIncome += task.getReward();
            }
        }
        
        // 获取用户当前余额
        User user = userService.findById(userId);
        double totalWithdrawal = 0;
        if (user != null && user.getBalance() != null) {
            totalWithdrawal = totalIncome - user.getBalance();
            if (totalWithdrawal < 0) {
                totalWithdrawal = 0;
            }
        }
        
        // 提现记录（简单模拟）
        List<java.util.Map<String, Object>> withdrawalRecords = new ArrayList<>();
        
        result.put("totalIncome", totalIncome);
        result.put("totalWithdrawal", totalWithdrawal);
        result.put("incomeRecords", incomeRecords);
        result.put("withdrawalRecords", withdrawalRecords);
        
        return result;
    }
    
    // 用户提现接口
    @PostMapping("/{userId}/withdraw")
    public java.util.Map<String, Object> withdraw(@PathVariable Long userId, @RequestBody java.util.Map<String, Object> request) {
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        
        User user = userService.findById(userId);
        if (user == null) {
            result.put("success", false);
            result.put("message", "用户不存在");
            return result;
        }
        
        // 获取提现金额
        double amount = Double.parseDouble(request.get("amount").toString());
        double balance = user.getBalance() != null ? user.getBalance() : 0.0;
        
        if (amount <= 0) {
            result.put("success", false);
            result.put("message", "提现金额必须大于0");
            return result;
        }
        
        if (amount > balance) {
            result.put("success", false);
            result.put("message", "提现金额不能大于可用余额");
            return result;
        }
        
        // 更新用户余额
        user.setBalance(balance - amount);
        userService.update(user);
        
        result.put("success", true);
        result.put("message", "提现申请成功");
        result.put("newBalance", user.getBalance());
        return result;
    }
}