package com.example.campuserrand.controller;

import com.example.campuserrand.model.Rule;
import com.example.campuserrand.service.RuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/rules")
public class RuleController {
    
    @Autowired
    private RuleService ruleService;
    
    @GetMapping
    public Map<String, Object> getRule() {
        Rule rule = ruleService.getRule();
        Map<String, Object> response = new HashMap<>();
        response.put("content", rule.getContent());
        response.put("updateTime", rule.getUpdateTime().toString());
        return response;
    }
    
    @PutMapping
    public Map<String, Object> updateRule(@RequestBody Map<String, String> request) {
        String content = request.get("content");
        Rule rule = ruleService.updateRule(content);
        Map<String, Object> response = new HashMap<>();
        response.put("content", rule.getContent());
        response.put("updateTime", rule.getUpdateTime().toString());
        response.put("success", true);
        return response;
    }
}