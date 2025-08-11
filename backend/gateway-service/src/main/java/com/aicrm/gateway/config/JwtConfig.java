package com.aicrm.gateway.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * JWT配置
 * 
 * @author AI CRM Team
 * @since 1.0.0
 */
@Data
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtConfig {
    
    /**
     * JWT密钥
     */
    private String secret = "ai-crm-jwt-secret-key-2024";
    
    /**
     * JWT过期时间(毫秒)
     */
    private Long expiration = 86400000L;
    
    // 手动getter方法确保编译正确
    public String getSecret() {
        return this.secret;
    }
    
    public Long getExpiration() {
        return this.expiration;
    }
}
