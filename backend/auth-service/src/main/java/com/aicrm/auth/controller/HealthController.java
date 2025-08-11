package com.aicrm.auth.controller;

import com.aicrm.auth.dto.ApiResponse;
import com.aicrm.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 健康检查控制器
 * 
 * @author AI CRM Team
 * @since 1.0.0
 */
@RestController
@RequestMapping("/health")
public class HealthController {
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * 健康检查
     */
    @GetMapping
    public ApiResponse<Map<String, Object>> health() {
        Map<String, Object> status = new HashMap<>();
        status.put("service", "auth-service");
        status.put("status", "UP");
        status.put("timestamp", LocalDateTime.now());
        
        try {
            // 测试数据库连接
            long userCount = userRepository.count();
            status.put("database", "UP");
            status.put("userCount", userCount);
        } catch (Exception e) {
            status.put("database", "DOWN");
            status.put("databaseError", e.getMessage());
        }
        
        return ApiResponse.success(status);
    }
}
