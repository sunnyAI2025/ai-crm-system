package com.aicrm.dashboard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * 仪表盘服务启动类
 * 
 * @author AI CRM Team
 * @since 1.0.0
 */
@SpringBootApplication
@EnableJpaAuditing
public class DashboardServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DashboardServiceApplication.class, args);
    }
}
