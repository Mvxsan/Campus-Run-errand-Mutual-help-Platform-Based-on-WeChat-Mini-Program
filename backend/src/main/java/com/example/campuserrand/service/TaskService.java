package com.example.campuserrand.service;

import com.example.campuserrand.model.Task;
import com.example.campuserrand.model.User;

import java.util.List;
import java.util.Map;

public interface TaskService {
    Task publish(Task task);
    Task accept(Long taskId, User acceptor);
    Task pickup(Long taskId);
    Task deliver(Long taskId);
    Task complete(Long taskId);
    Task cancel(Long taskId);
    Task cancelAccept(Long taskId);
    Task confirm(Long taskId);
    Task findById(Long id);
    List<Task> findByPublisher(User publisher);
    List<Task> findByAcceptor(User acceptor);
    List<Task> findByStatus(Integer status);
    List<Task> findAll();
    
    // 统计方法
    long countTotalPublishedTasks();
    long countTotalCompletedTasks();
    Map<String, Long> getTaskStats();
    
    // 管理员禁止任务
    Task disable(Long taskId);
    
    // 管理员恢复任务
    Task restore(Long taskId);
    
    // 获取被禁止的任务列表
    List<Task> findDisabledTasks();
    
    // 搜索被禁止的任务
    List<Task> searchDisabledTasks(String keyword);
}