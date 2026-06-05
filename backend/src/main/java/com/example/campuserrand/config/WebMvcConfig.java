package com.example.campuserrand.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 获取项目根目录的绝对路径
        String projectRoot = System.getProperty("user.dir");
        // 上传文件存储目录
        String uploadPath = new File(projectRoot, "uploads").getAbsolutePath();
        
        // 配置静态资源映射：将 /api/uploads/** 请求映射到实际的uploads目录
        // 因为后端配置了 context-path: /api，所以需要映射 /api/uploads/**
        registry.addResourceHandler("/api/uploads/**")
                .addResourceLocations("file:" + uploadPath + "/");
        
        // 同时也配置 /uploads/** 的映射，以防直接访问
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadPath + "/");
        
        System.out.println("静态资源映射配置完成: /api/uploads/** -> " + uploadPath);
        System.out.println("静态资源映射配置完成: /uploads/** -> " + uploadPath);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // 配置跨域
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);
    }
}
