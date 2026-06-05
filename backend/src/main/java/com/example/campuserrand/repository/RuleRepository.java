package com.example.campuserrand.repository;

import com.example.campuserrand.model.Rule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RuleRepository extends JpaRepository<Rule, Long> {
    // 查找最新的规则（假设只有一条规则记录）
    Rule findFirstByOrderByIdDesc();
}