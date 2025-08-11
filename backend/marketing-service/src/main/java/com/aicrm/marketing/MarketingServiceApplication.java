package com.aicrm.marketing;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * 营销管理服务启动类
 * 
 * @author AI CRM Team
 * @since 1.0.0
 */
@SpringBootApplication
@EnableJpaAuditing
public class MarketingServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(MarketingServiceApplication.class, args);
    }
}
