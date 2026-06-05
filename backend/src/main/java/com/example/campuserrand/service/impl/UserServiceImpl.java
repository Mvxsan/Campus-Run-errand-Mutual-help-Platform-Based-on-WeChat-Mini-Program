package com.example.campuserrand.service.impl;

import com.example.campuserrand.model.User;
import com.example.campuserrand.repository.UserRepository;
import com.example.campuserrand.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public User register(User user) {
        // 检查手机号是否已存在
        if (userRepository.findByPhone(user.getPhone()) != null) {
            throw new RuntimeException("手机号已存在");
        }
        // 自动随机补充昵称
        if (user.getNickname() == null || user.getNickname().isEmpty()) {
            String[] adjectives = { "快乐的", "聪明的", "善良的", "勇敢的", "活泼的", "可爱的", "机智的", "友善的", "热情的", "耐心的" };
            String[] nouns = { "同学", "学霸", "运动健将", "文艺青年", "技术宅", "美食家", "旅行者", "摄影师", "音乐人", "画家" };
            String randomAdjective = adjectives[(int) (Math.random() * adjectives.length)];
            String randomNoun = nouns[(int) (Math.random() * nouns.length)];
            int randomNum = (int) (Math.random() * 1000);
            user.setNickname(randomAdjective + randomNoun + randomNum);
        }
        // 自动随机补充头像（使用默认头像）
        if (user.getAvatar() == null || user.getAvatar().isEmpty()) {
            // 这里可以使用默认头像URL，或者随机生成头像
            user.setAvatar("https://img.icons8.com/color/48/000000/user.png");
        }
        // 密码加密（这里简化处理，实际项目中应该使用BCrypt等加密方式）
        // user.setPassword(BCrypt.hashpw(user.getPassword(), BCrypt.gensalt()));
        return userRepository.save(user);
    }

    @Override
    public User login(String phone, String password) {
        User user = userRepository.findByPhone(phone);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        if (!password.equals(user.getPassword())) {
            throw new RuntimeException("密码错误");
        }
        if (user.getStatus() == null || user.getStatus() == 0) {
            throw new RuntimeException("该账号已被禁用，请联系管理员");
        }
        if (user.getAvatar() != null
                && (user.getAvatar().contains("http://tmp/") || user.getAvatar().contains("_tmp_"))) {
            user.setAvatar("https://img.icons8.com/color/48/000000/user.png");
        }
        return user;
    }

    @Override
    public User findByPhone(String phone) {
        return userRepository.findByPhone(phone);
    }

    @Override
    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public User update(User user) {
        // 检查并处理临时文件路径的头像
        if (user.getAvatar() != null
                && (user.getAvatar().contains("http://tmp/") || user.getAvatar().contains("_tmp_"))) {
            // 获取现有用户信息，保留其头像
            User existingUser = userRepository.findById(user.getId()).orElse(null);
            if (existingUser != null && existingUser.getAvatar() != null) {
                user.setAvatar(existingUser.getAvatar());
            } else {
                // 如果没有现有头像，使用默认头像
                user.setAvatar("https://img.icons8.com/color/48/000000/user.png");
            }
        }
        return userRepository.save(user);
    }

    @Override
    public java.util.List<User> searchUsers(String keyword) {
        return userRepository.findByPhoneOrNicknameContaining(keyword, keyword);
    }
}