package com.aicrm.auth.config;

import com.aicrm.auth.entity.User;
import com.aicrm.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * 数据初始化
 * 
 * @author AI CRM Team
 * @since 1.0.0
 */
@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // 检查是否已有管理员用户
        if (!userRepository.existsByUsername("admin")) {
            // 创建默认管理员用户
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .name("系统管理员")
                    .phone("13800138000")
                    .departmentId(1L)
                    .roleId(1L)
                    .status(1)
                    .build();
            
            userRepository.save(admin);
            System.out.println("默认管理员账号已创建: admin / admin123");
        }
        
        // 创建测试用户
        if (!userRepository.existsByUsername("test")) {
            User testUser = User.builder()
                    .username("test")
                    .password(passwordEncoder.encode("test123"))
                    .name("测试用户")
                    .phone("13800138001")
                    .departmentId(2L)
                    .roleId(3L)
                    .status(1)
                    .build();
            
            userRepository.save(testUser);
            System.out.println("测试用户账号已创建: test / test123");
        }
    }
}
