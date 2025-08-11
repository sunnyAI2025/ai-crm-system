package com.aicrm.analytics;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * AI数据分析服务启动类
 * 
 * @author AI CRM Team
 * @since 1.0.0
 */
@SpringBootApplication
@EnableJpaAuditing
public class AnalyticsServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AnalyticsServiceApplication.class, args);
    }
}
