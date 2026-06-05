package com.example.campuserrand.controller;

import com.example.campuserrand.model.Task;
import com.example.campuserrand.model.User;
import com.example.campuserrand.service.TaskService;
import com.example.campuserrand.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private UserService userService;

    @PostMapping
    public Task publish(@RequestBody Task task) {
        return taskService.publish(task);
    }

    @PutMapping("/{id}/accept")
    public Task accept(@PathVariable Long id, @RequestParam Long acceptorId) {
        User acceptor = userService.findById(acceptorId);
        if (acceptor == null) {
            throw new RuntimeException("用户不存在");
        }
        return taskService.accept(id, acceptor);
    }

    @PutMapping("/{id}/pickup")
    public Task pickup(@PathVariable Long id) {
        return taskService.pickup(id);
    }

    @PutMapping("/{id}/deliver")
    public Task deliver(@PathVariable Long id) {
        return taskService.deliver(id);
    }

    @PutMapping("/{id}/complete")
    public Task complete(@PathVariable Long id) {
        return taskService.complete(id);
    }

    @PutMapping("/{id}/cancel")
    public Task cancel(@PathVariable Long id) {
        return taskService.cancel(id);
    }

    @PutMapping("/{id}/cancel-accept")
    public Task cancelAccept(@PathVariable Long id) {
        return taskService.cancelAccept(id);
    }

    @PutMapping("/{id}/confirm")
    public Task confirm(@PathVariable Long id) {
        return taskService.confirm(id);
    }

    @GetMapping("/{id}")
    public Task findById(@PathVariable Long id) {
        return taskService.findById(id);
    }

    @GetMapping("/publisher/{publisherId}")
    public List<Task> findByPublisher(@PathVariable Long publisherId) {
        User publisher = userService.findById(publisherId);
        if (publisher == null) {
            throw new RuntimeException("用户不存在");
        }
        return taskService.findByPublisher(publisher);
    }

    @GetMapping("/acceptor/{acceptorId}")
    public List<Task> findByAcceptor(@PathVariable Long acceptorId) {
        User acceptor = userService.findById(acceptorId);
        if (acceptor == null) {
            throw new RuntimeException("用户不存在");
        }
        return taskService.findByAcceptor(acceptor);
    }

    @GetMapping("/status/{status}")
    public List<Task> findByStatus(@PathVariable Integer status) {
        return taskService.findByStatus(status);
    }

    @GetMapping
    public List<Task> findAll() {
        return taskService.findAll();
    }

    @GetMapping("/stats")
    public Map<String, Long> getStats() {
        return taskService.getTaskStats();
    }
    
    @PutMapping("/{id}/disable")
    public Task disable(@PathVariable Long id) {
        return taskService.disable(id);
    }
    
    @PutMapping("/{id}/restore")
    public Task restore(@PathVariable Long id) {
        return taskService.restore(id);
    }
    
    @GetMapping("/admin/disabled")
    public List<Task> findDisabledTasks() {
        return taskService.findDisabledTasks();
    }
    
    @GetMapping("/admin/search-disabled")
    public List<Task> searchDisabledTasks(@RequestParam String keyword) {
        return taskService.searchDisabledTasks(keyword);
    }
}