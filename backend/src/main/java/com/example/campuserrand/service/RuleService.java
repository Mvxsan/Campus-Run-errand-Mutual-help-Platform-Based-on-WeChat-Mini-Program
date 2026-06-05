package com.example.campuserrand.service;

import com.example.campuserrand.model.Rule;

public interface RuleService {
    // 获取规则
    Rule getRule();
    
    // 更新规则
    Rule updateRule(String content);
}