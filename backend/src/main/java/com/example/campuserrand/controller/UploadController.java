package com.example.campuserrand.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
public class UploadController {

    /**
     * 上传文件接口
     * 
     * @param file 上传的文件
     * @return 上传结果
     */
    @PostMapping("/upload")
    public Map<String, Object> uploadFile(@RequestParam("file") MultipartFile file) {
        Map<String, Object> result = new HashMap<>();

        if (file.isEmpty()) {
            result.put("code", 400);
            result.put("message", "文件不能为空");
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

            // 构建文件访问URL - 返回相对路径，前端会添加服务器地址和/api前缀
            String fileUrl = "/uploads/" + filename;
            result.put("code", 200);
            result.put("data", fileUrl);
            result.put("filename", filename);
            
            System.out.println("文件上传成功: " + fileUrl);
            System.out.println("文件实际存储位置: " + dest.getAbsolutePath());

        } catch (IOException e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("message", "文件上传失败: " + e.getMessage());
        }

        return result;
    }
}
