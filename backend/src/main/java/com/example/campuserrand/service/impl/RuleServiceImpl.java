package com.example.campuserrand.service.impl;

import com.example.campuserrand.model.Rule;
import com.example.campuserrand.repository.RuleRepository;
import com.example.campuserrand.service.RuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class RuleServiceImpl implements RuleService {
    
    @Autowired
    private RuleRepository ruleRepository;
    
    @Override
    public Rule getRule() {
        try {
            Rule rule = ruleRepository.findFirstByOrderByIdDesc();
            if (rule == null) {
                // 如果没有规则，创建一个默认规则
                rule = new Rule();
                rule.setContent("暂无规则内容");
                rule.setUpdateTime(LocalDateTime.now());
                ruleRepository.save(rule);
            }
            return rule;
        } catch (Exception e) {
            // 如果数据库操作失败（例如表不存在），返回一个默认的规则对象
            Rule rule = new Rule();
            rule.setContent("暂无规则内容");
            rule.setUpdateTime(LocalDateTime.now());
            return rule;
        }
    }
    
    @Override
    public Rule updateRule(String content) {
        try {
            Rule rule = ruleRepository.findFirstByOrderByIdDesc();
            if (rule == null) {
                // 如果没有规则，创建一个新规则
                rule = new Rule();
            }
            rule.setContent(content);
            rule.setUpdateTime(LocalDateTime.now());
            return ruleRepository.save(rule);
        } catch (Exception e) {
            // 如果数据库操作失败（例如表不存在），返回一个更新后的规则对象
            Rule rule = new Rule();
            rule.setContent(content);
            rule.setUpdateTime(LocalDateTime.now());
            return rule;
        }
    }
}