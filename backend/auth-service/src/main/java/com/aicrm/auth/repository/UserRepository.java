package com.aicrm.auth.repository;

import com.aicrm.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 用户Repository
 * 
 * @author AI CRM Team
 * @since 1.0.0
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * 根据用户名查找用户
     */
    Optional<User> findByUsername(String username);
    
    /**
     * 根据用户名和状态查找用户
     */
    Optional<User> findByUsernameAndStatus(String username, Integer status);
    
    /**
     * 检查用户名是否存在
     */
    boolean existsByUsername(String username);
    
    /**
     * 检查手机号是否存在
     */
    boolean existsByPhone(String phone);
    
    /**
     * 根据手机号查找用户
     */
    Optional<User> findByPhone(String phone);
    
    /**
     * 根据ID和状态查找用户
     */
    Optional<User> findByIdAndStatus(Long id, Integer status);
    
    /**
     * 查询用户基本信息（排除密码）
     */
    @Query("SELECT u.id, u.username, u.name, u.phone, u.avatar, u.description, " +
           "u.departmentId, u.roleId, u.status, u.createdAt, u.updatedAt " +
           "FROM User u WHERE u.id = :id AND u.status = 1")
    Optional<Object[]> findUserInfoById(@Param("id") Long id);
}
