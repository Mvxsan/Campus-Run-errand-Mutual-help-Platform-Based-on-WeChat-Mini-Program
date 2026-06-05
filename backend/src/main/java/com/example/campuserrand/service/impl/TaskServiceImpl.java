package com.example.campuserrand.service.impl;

import com.example.campuserrand.model.Task;
import com.example.campuserrand.model.User;
import com.example.campuserrand.model.Order;
import com.example.campuserrand.repository.TaskRepository;
import com.example.campuserrand.service.TaskService;
import com.example.campuserrand.service.UserService;
import com.example.campuserrand.service.MessageService;
import com.example.campuserrand.service.OrderService;
import com.example.campuserrand.model.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class TaskServiceImpl implements TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private MessageService messageService;

    @Autowired
    private OrderService orderService;

    @Override
    public Task publish(Task task) {
        if (task.getPublisher() != null) {
            User publisher = userService.findById(task.getPublisher().getId());
            if (publisher == null) {
                throw new RuntimeException("用户不存在");
            }
            if (publisher.getStatus() == null || publisher.getStatus() == 0) {
                throw new RuntimeException("您的账号已被禁用，无法发布任务");
            }
        }
        task.setStatus(0); // 待接单状态
        return taskRepository.save(task);
    }

    @Override
    public Task accept(Long taskId, User acceptor) {
        try {
            if (acceptor.getStatus() == null || acceptor.getStatus() == 0) {
                throw new RuntimeException("您的账号已被禁用，无法接单");
            }
            Task task = taskRepository.findById(taskId).orElse(null);
            if (task == null) {
                throw new RuntimeException("任务不存在");
            }
            if (task.getStatus() != 0) {
                throw new RuntimeException("任务已被接单");
            }
            Integer oldStatus = task.getStatus();
            task.setAcceptor(acceptor);
            task.setStatus(1);
            Task updatedTask = taskRepository.save(task);
            
            // 创建订单记录
            Order order = new Order();
            order.setTask(task);
            order.setPublisher(task.getPublisher());
            order.setAcceptor(acceptor);
            order.setAmount(task.getReward());
            orderService.create(order);
            
            // 发送状态变更消息
            messageService.sendOrderStatusMessage(taskId, oldStatus, task.getStatus());
            return updatedTask;
        } catch (Exception e) {
            throw new RuntimeException("接单失败: " + e.getMessage());
        }
    }

    @Override
    public Task pickup(Long taskId) {
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null) {
            throw new RuntimeException("任务不存在");
        }
        if (task.getStatus() != 1) {
            throw new RuntimeException("任务状态错误，只有已接单的任务才能标记为已取货");
        }
        Integer oldStatus = task.getStatus();
        task.setStatus(2);
        Task updatedTask = taskRepository.save(task);
        // 发送状态变更消息
        messageService.sendOrderStatusMessage(taskId, oldStatus, task.getStatus());
        return updatedTask;
    }

    @Override
    public Task deliver(Long taskId) {
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null) {
            throw new RuntimeException("任务不存在");
        }
        if (task.getStatus() != 2) {
            throw new RuntimeException("任务状态错误，只有已取货的任务才能标记为已送达");
        }
        Integer oldStatus = task.getStatus();
        task.setStatus(3);
        Task updatedTask = taskRepository.save(task);
        // 发送状态变更消息
        messageService.sendOrderStatusMessage(taskId, oldStatus, task.getStatus());
        return updatedTask;
    }

    @Override
    public Task complete(Long taskId) {
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null) {
            throw new RuntimeException("任务不存在");
        }
        // 只有已接单(1)、已取货(2)、已送达(3)的任务才能标记为已完成
        if (task.getStatus() != 1 && task.getStatus() != 2 && task.getStatus() != 3) {
            throw new RuntimeException("任务状态错误，只有进行中的任务（已接单、已取货、已送达）才能标记为已完成");
        }

        Integer oldStatus = task.getStatus();
        task.setStatus(4);
        Task updatedTask = taskRepository.save(task);
        // 发送状态变更消息
        messageService.sendOrderStatusMessage(taskId, oldStatus, task.getStatus());
        return updatedTask;
    }

    @Override
    public Task cancel(Long taskId) {
        try {
            Task task = taskRepository.findById(taskId).orElse(null);
            if (task == null) {
                throw new RuntimeException("任务不存在");
            }
            if (task.getStatus() == 4 || task.getStatus() == 5) {
                throw new RuntimeException("任务已完成或已取消，无法取消");
            }
            if (task.getStatus() >= 2) {
                throw new RuntimeException("任务已取货，无法取消");
            }
            Integer oldStatus = task.getStatus();
            task.setStatus(5);
            task.setAcceptor(null);
            // 设置取消类型为1（用户主动取消）
            try {
                task.setCancelType(1);
            } catch (Exception e) {
            }
            Task updatedTask = taskRepository.save(task);
            messageService.sendOrderStatusMessage(taskId, oldStatus, task.getStatus());
            return updatedTask;
        } catch (Exception e) {
            throw new RuntimeException("取消任务失败: " + e.getMessage());
        }
    }

    @Override
    public Task cancelAccept(Long taskId) {
        try {
            Task task = taskRepository.findById(taskId).orElse(null);
            if (task == null) {
                throw new RuntimeException("任务不存在");
            }
            if (task.getStatus() != 1) {
                throw new RuntimeException("任务状态错误，只有已接单的任务才能取消接单");
            }
            Integer oldStatus = task.getStatus();
            // 取消接单后，将任务状态设置为0（待接单），以便任务可以被再次接单
            task.setStatus(0);
            task.setAcceptor(null);
            // 不设置cancelType字段
            try {
                task.setCancelType(null);
            } catch (Exception e) {
            }
            Task updatedTask = taskRepository.save(task);
            messageService.sendOrderStatusMessage(taskId, oldStatus, task.getStatus());
            return updatedTask;
        } catch (Exception e) {
            throw new RuntimeException("取消接单失败: " + e.getMessage());
        }
    }

    @Override
    public Task disable(Long taskId) {
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null) {
            throw new RuntimeException("任务不存在");
        }
        if (task.getStatus() == 6) {
            throw new RuntimeException("任务已确认收货，无法禁止");
        }
        Integer oldStatus = task.getStatus();
        task.setStatus(5);
        try {
            task.setCancelType(2);
        } catch (Exception e) {
        }
        try {
            Task updatedTask = taskRepository.save(task);
            messageService.sendOrderStatusMessage(taskId, oldStatus, task.getStatus());
            return updatedTask;
        } catch (Exception e) {
            try {
                task.setCancelType(null);
                Task updatedTask = taskRepository.save(task);
                messageService.sendOrderStatusMessage(taskId, oldStatus, task.getStatus());
                return updatedTask;
            } catch (Exception ex) {
                throw new RuntimeException("禁止任务失败: " + ex.getMessage());
            }
        }
    }

    @Override
    public Task restore(Long taskId) {
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null) {
            throw new RuntimeException("任务不存在");
        }
        boolean isDisabledByAdmin = false;
        try {
            isDisabledByAdmin = task.getStatus() == 5 && task.getCancelType() != null && task.getCancelType() == 2;
        } catch (Exception e) {
        }
        if (!isDisabledByAdmin) {
            throw new RuntimeException("只有被管理员禁止的任务才能恢复");
        }
        Integer oldStatus = task.getStatus();
        task.setStatus(0);
        task.setAcceptor(null);
        try {
            task.setCancelType(null);
        } catch (Exception e) {
        }
        try {
            Task updatedTask = taskRepository.save(task);
            messageService.sendOrderStatusMessage(taskId, oldStatus, task.getStatus());
            return updatedTask;
        } catch (Exception e) {
            try {
                task.setCancelType(null);
                Task updatedTask = taskRepository.save(task);
                messageService.sendOrderStatusMessage(taskId, oldStatus, task.getStatus());
                return updatedTask;
            } catch (Exception ex) {
                throw new RuntimeException("恢复任务失败: " + ex.getMessage());
            }
        }
    }

    @Override
    public Task confirm(Long taskId) {
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null) {
            throw new RuntimeException("任务不存在");
        }
        if (task.getStatus() != 4) {
            throw new RuntimeException("任务状态错误，只有已完成的任务才能确认收货");
        }

        // 发布者确认收货后，接单者获得报酬
        if (task.getAcceptor() != null && task.getAcceptor().getId() != null) {
            Long acceptorId = task.getAcceptor().getId();
            // 从数据库重新获取用户对象，避免懒加载问题
            User acceptor = userService.findById(acceptorId);
            if (acceptor != null) {
                // 获取任务金额
                double taskAmount = task.getReward();
                // 更新用户余额
                double currentBalance = acceptor.getBalance() != null ? acceptor.getBalance() : 0.0;
                acceptor.setBalance(currentBalance + taskAmount);
                // 保存更新后的用户信息
                userService.update(acceptor);
            }
        }

        // 确认收货，更新状态为已确认收货
        Integer oldStatus = task.getStatus();
        task.setStatus(6); // 6: 已确认收货
        Task updatedTask = taskRepository.save(task);
        // 发送状态变更消息
        messageService.sendOrderStatusMessage(taskId, oldStatus, task.getStatus());
        return updatedTask;
    }

    @Override
    public Task findById(Long id) {
        return taskRepository.findById(id).orElse(null);
    }

    @Override
    public List<Task> findByPublisher(User publisher) {
        return taskRepository.findByPublisher(publisher);
    }

    @Override
    public List<Task> findByAcceptor(User acceptor) {
        return taskRepository.findByAcceptor(acceptor);
    }

    @Override
    public List<Task> findByStatus(Integer status) {
        return taskRepository.findByStatus(status);
    }

    @Override
    public List<Task> findAll() {
        return taskRepository.findAll();
    }

    @Override
    public long countTotalPublishedTasks() {
        // 统计所有已发布的任务（状态不为已取消的任务）
        return taskRepository.count();
    }

    @Override
    public long countTotalCompletedTasks() {
        // 统计已完成的任务（状态为4和6）
        long status4Count = taskRepository.countByStatus(4);
        long status6Count = taskRepository.countByStatus(6);
        return status4Count + status6Count;
    }

    @Override
    public Map<String, Long> getTaskStats() {
        Map<String, Long> stats = new java.util.HashMap<>();
        // 总发布任务数
        stats.put("publishedTasks", countTotalPublishedTasks());
        // 总完成任务数
        stats.put("completedTasks", countTotalCompletedTasks());
        // 总接取任务数（状态大于0且小于4的任务）
        long acceptedTasks = taskRepository.countByStatusGreaterThan(0) - taskRepository.countByStatus(5);
        stats.put("acceptedTasks", acceptedTasks);
        // 已禁止任务数（状态为5且cancelType为2的任务，即管理员禁止的任务）
        long disabledTasks = 0;
        try {
            disabledTasks = taskRepository.countByStatusAndCancelType(5, 2);
        } catch (Exception e) {
            // 如果数据库表没有cancelType字段，使用默认值0
            disabledTasks = 0;
        }
        stats.put("disabledTasks", disabledTasks);
        return stats;
    }

    @Override
    public List<Task> findDisabledTasks() {
        try {
            return taskRepository.findByStatusAndCancelType(5, 2);
        } catch (Exception e) {
            return taskRepository.findByStatus(5);
        }
    }

    @Override
    public List<Task> searchDisabledTasks(String keyword) {
        try {
            return taskRepository.findByStatusAndCancelTypeAndTitleContaining(5, 2, keyword);
        } catch (Exception e) {
            return taskRepository.findByStatusAndTitleContaining(5, keyword);
        }
    }
}