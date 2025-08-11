package com.aicrm.auth.service;

import com.aicrm.auth.dto.LoginRequest;
import com.aicrm.auth.dto.LoginResponse;
import com.aicrm.auth.entity.User;
import com.aicrm.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * 认证服务
 * 
 * @author AI CRM Team
 * @since 1.0.0
 */
@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * 用户登录
     */
    public LoginResponse login(LoginRequest request) {
        // 查找用户
        Optional<User> userOpt = userRepository.findByUsernameAndStatus(request.getUsername(), 1);
        if (!userOpt.isPresent()) {
            throw new RuntimeException("用户名或密码错误");
        }
        
        User user = userOpt.get();
        
        // 验证密码
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }
        
        // 生成JWT令牌
        String token = jwtService.generateToken(user);
        
        // 构建用户信息
        LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo(
            user.getId(),
            user.getUsername(),
            user.getName(),
            user.getPhone(),
            user.getAvatar(),
            "技术部", // TODO: 从部门表获取
            "系统管理员" // TODO: 从角色表获取
        );
        
        return new LoginResponse(token, 86400L, userInfo);
    }
    
    /**
     * 验证令牌
     */
    public User validateToken(String token) {
        try {
            Long userId = jwtService.extractUserId(token);
            if (userId == null) {
                return null;
            }
            
            Optional<User> userOpt = userRepository.findById(userId);
            return userOpt.orElse(null);
            
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * 获取用户信息
     */
    public LoginResponse.UserInfo getCurrentUser(String token) {
        User user = validateToken(token);
        if (user == null) {
            throw new RuntimeException("无效的令牌");
        }
        
        return new LoginResponse.UserInfo(
            user.getId(),
            user.getUsername(),
            user.getName(),
            user.getPhone(),
            user.getAvatar(),
            "技术部", // TODO: 从部门表获取
            "系统管理员" // TODO: 从角色表获取
        );
    }
}
