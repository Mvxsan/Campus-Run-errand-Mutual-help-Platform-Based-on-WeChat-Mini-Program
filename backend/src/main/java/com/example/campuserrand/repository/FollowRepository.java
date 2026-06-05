package com.example.campuserrand.repository;

import com.example.campuserrand.model.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FollowRepository extends JpaRepository<Follow, Long> {
    
    // 检查是否已关注
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);
    
    // 删除关注关系
    void deleteByFollowerIdAndFollowingId(Long followerId, Long followingId);
    
    // 获取用户关注的所有用户 ID
    @Query("SELECT f.followingId FROM Follow f WHERE f.followerId = :followerId")
    List<Long> findFollowingIdsByFollowerId(@Param("followerId") Long followerId);
    
    // 获取用户的所有粉丝 ID
    @Query("SELECT f.followerId FROM Follow f WHERE f.followingId = :followingId")
    List<Long> findFollowerIdsByFollowingId(@Param("followingId") Long followingId);
    
    // 获取关注用户的数量
    long countByFollowerId(Long followerId);
    
    // 获取粉丝数量
    long countByFollowingId(Long followingId);
}
