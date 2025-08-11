package com.aicrm.sales;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * 销售管理服务启动类
 * 
 * @author AI CRM Team
 * @since 1.0.0
 */
@SpringBootApplication
@EnableJpaAuditing
public class SalesServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(SalesServiceApplication.class, args);
    }
}
