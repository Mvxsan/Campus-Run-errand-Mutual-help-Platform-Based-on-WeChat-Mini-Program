package com.example.campuserrand.repository;

import com.example.campuserrand.model.Task;
import com.example.campuserrand.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByPublisher(User publisher);
    List<Task> findByAcceptor(User acceptor);
    List<Task> findByStatus(Integer status);
    long countByPublisherId(Long publisherId);
    long countByAcceptorId(Long acceptorId);
    long countByAcceptorIdAndStatus(Long acceptorId, Integer status);
    
    // 统计方法
    long countByStatus(Integer status);
    long countByStatusGreaterThan(Integer status);
    long countByStatusAndCancelType(Integer status, Integer cancelType);
    
    // 查询禁止任务列表
    List<Task> findByStatusAndCancelType(Integer status, Integer cancelType);
    
    // 搜索禁止任务
    List<Task> findByStatusAndCancelTypeAndTitleContaining(Integer status, Integer cancelType, String title);
    
    // 根据状态和标题搜索任务
    List<Task> findByStatusAndTitleContaining(Integer status, String title);
    
    // 根据接单人ID和状态查询任务
    List<Task> findByAcceptorIdAndStatus(Long acceptorId, Integer status);
}