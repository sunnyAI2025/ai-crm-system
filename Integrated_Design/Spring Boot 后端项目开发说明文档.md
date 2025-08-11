# Spring Boot 后端项目开发说明文档

## 项目简介

本项目是一个基于Spring Boot框架开发的API后端系统，主要用于提供RESTful API接口。项目采用Maven作为构建工具，使用Neon作为数据库。

## 技术栈

- **后端框架**：Spring Boot 3.2.x
- **构建工具**：Maven 3.9+
- **数据库**：Neon (PostgreSQL compatible)
- **ORM**：Spring Data JPA + Hibernate
- **身份认证**：JWT (Spring Security + jjwt)
- **其他**：Spring Web, Spring Security, Spring Data JPA, Spring Boot Starter

## 项目结构

```
project_name/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── company/
│   │   │           └── projectname/
│   │   │               ├── ProjectNameApplication.java  # 主启动类
│   │   │               ├── config/                      # 配置类
│   │   │               │   ├── SecurityConfig.java     # 安全配置
│   │   │               │   ├── JwtConfig.java          # JWT配置
│   │   │               │   └── DatabaseConfig.java     # 数据库配置
│   │   │               ├── controller/                 # 控制器层
│   │   │               │   ├── auth/                   # 需要鉴权的API控制器
│   │   │               │   │   ├── UserController.java
│   │   │               │   │   ├── CustomerController.java
│   │   │               │   │   └── OrderController.java
│   │   │               │   └── public/                 # 公共API控制器(无需鉴权)
│   │   │               │       ├── LoginController.java
│   │   │               │       └── RegisterController.java
│   │   │               ├── service/                    # 服务层
│   │   │               │   ├── UserService.java
│   │   │               │   ├── CustomerService.java
│   │   │               │   ├── OrderService.java
│   │   │               │   ├── LoginService.java
│   │   │               │   └── RegisterService.java
│   │   │               ├── repository/                 # 数据访问层
│   │   │               │   ├── UserRepository.java
│   │   │               │   ├── CustomerRepository.java
│   │   │               │   └── OrderRepository.java
│   │   │               ├── entity/                     # 实体类
│   │   │               │   ├── User.java
│   │   │               │   ├── Customer.java
│   │   │               │   └── Order.java
│   │   │               ├── dto/                        # 数据传输对象
│   │   │               │   ├── request/
│   │   │               │   │   ├── LoginRequest.java
│   │   │               │   │   ├── RegisterRequest.java
│   │   │               │   │   └── UserCreateRequest.java
│   │   │               │   └── response/
│   │   │               │       ├── LoginResponse.java
│   │   │               │       ├── UserResponse.java
│   │   │               │       └── PageResponse.java
│   │   │               ├── security/                   # 安全相关
│   │   │               │   ├── JwtTokenProvider.java
│   │   │               │   ├── JwtAuthenticationFilter.java
│   │   │               │   └── CustomUserDetailsService.java
│   │   │               ├── exception/                  # 异常处理
│   │   │               │   ├── GlobalExceptionHandler.java
│   │   │               │   ├── BusinessException.java
│   │   │               │   └── ResourceNotFoundException.java
│   │   │               └── utils/                      # 工具类
│   │   │                   ├── ResponseUtil.java
│   │   │                   └── DateUtil.java
│   │   └── resources/
│   │       ├── application.yml                         # 主配置文件
│   │       ├── application-dev.yml                     # 开发环境配置
│   │       ├── application-prod.yml                    # 生产环境配置
│   │       └── static/                                 # 静态资源
│   └── test/
│       └── java/
│           └── com/
│               └── company/
│                   └── projectname/
│                       ├── controller/                 # 控制器测试
│                       ├── service/                    # 服务测试
│                       └── repository/                 # 数据访问测试
├── pom.xml                                             # Maven配置文件
├── README.md                                           # 项目说明文档
└── .gitignore                                          # Git忽略文件
```

## 开发规范

### 1. 接口开发规范

#### 1.1 项目结构规范

采用标准的Spring Boot分层架构：

- **Controller层**: 负责接收HTTP请求和返回响应
- **Service层**: 业务逻辑处理
- **Repository层**: 数据访问层
- **Entity层**: 数据库实体类
- **DTO层**: 数据传输对象

#### 1.2 API分类

**公共API (controller/public/)**

- 不需要身份验证的接口
  - 例如：登录、注册等
  - URL前缀: `/api/public`

**需要鉴权的API (controller/auth/)**

- 需要JWT身份验证的接口
  - 例如：用户管理、客户管理、订单管理等
  - URL前缀: `/api/auth`

#### 1.3 HTTP方法规范

- **查询类接口**: 使用 `GET` 请求
- **新增类接口**: 使用 `POST` 请求
- **修改类接口**: 使用 `PUT` 请求
- **删除类接口**: 使用 `DELETE` 请求

#### 1.4 请求参数规范

所有API接口都使用JSON格式传参：
- Content-Type: `application/json`
- 数据格式：JSON对象

**列表查询接口默认参数**:

```json
{
    "page": 0,          // 页码，默认0（Spring Data JPA从0开始）
    "size": 10,         // 每页数量，默认10
    "sort": "id,desc",  // 排序字段，默认按id降序
    // 其他筛选参数...
}
```

**批量操作接口参数**:

```json
{
    "ids": [1, 2, 3]     // ID数组
}
```

#### 1.5 身份认证规范

需要鉴权的接口必须在请求头中包含Authorization参数:

```
Authorization: Bearer <JWT_TOKEN>
```

### 2. 响应格式规范

#### 2.1 成功响应（HTTP 200）

```json
{
    "code": 0,
    "message": "操作成功",
    "data": {
        "content": [...],     // 数据内容
        "page": 0,           // 当前页码(列表接口)
        "size": 10,          // 每页数量(列表接口)
        "totalElements": 100, // 总记录数(列表接口)
        "totalPages": 10      // 总页数(列表接口)
    }
}
```

#### 2.2 错误响应（HTTP 非200）

```json
{
    "code": 1,
    "message": "错误原因",
    "timestamp": "2024-01-01T12:00:00Z"
}
```

#### 2.3 HTTP状态码对照表

| 状态码 | 说明 | message内容 |
| --- | --- | --- |
| 200 | 成功 | "操作成功" |
| 400 | 错误请求 | "错误请求，客户端错误，服务器无法处理请求" |
| 401 | 未授权 | "未授权，需要身份验证，未提供有效认证。" |
| 403 | 禁止访问 | "禁止访问，客户端无权限访问该资源。" |
| 404 | 未找到 | "未找到，服务器无法找到请求的资源。" |
| 429 | 请求过多 | "请求过多，在规定时间内发送了过多请求" |
| 500 | 内部服务器错误 | "内部服务器错误，服务器遇到未定义错误，无法处理请求。" |

### 3. 数据库设计规范

#### 3.1 实体类规范

每个实体类都需要使用JPA注解，包含以下基础字段：

- `id`: 主键，自增长整数
- `createdAt`: 创建时间
- `updatedAt`: 更新时间
- `status`: 状态字段（1:正常，0:禁用）

#### 3.2 实体类定义示例

```java
package com.company.projectname.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "examples")
@EntityListeners(AuditingEntityListener.class)
public class Example {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    
    @Column(name = "status", nullable = false)
    private Integer status = 1; // 1:正常 0:禁用
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // 构造函数
    public Example() {}
    
    public Example(String name) {
        this.name = name;
    }
    
    // getter和setter方法
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public Integer getStatus() {
        return status;
    }
    
    public void setStatus(Integer status) {
        this.status = status;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
```

#### 3.3 Repository操作规范

每个Repository接口都需要继承JpaRepository：

```java
package com.company.projectname.repository;

import com.company.projectname.entity.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExampleRepository extends JpaRepository<Example, Long> {
    
    // 根据状态查询
    List<Example> findByStatus(Integer status);
    
    // 分页查询正常状态的记录
    Page<Example> findByStatus(Integer status, Pageable pageable);
    
    // 根据名称模糊查询
    @Query("SELECT e FROM Example e WHERE e.name LIKE %:name% AND e.status = 1")
    List<Example> findByNameContaining(@Param("name") String name);
    
    // 自定义查询
    @Query("SELECT e FROM Example e WHERE e.status = 1 ORDER BY e.createdAt DESC")
    List<Example> findActiveExamplesOrderByCreatedAtDesc();
}
```

### 4. 代码风格规范

#### 4.1 命名规范

- **包名**: 小写字母，如`com.company.projectname.controller`
- **类名**: 驼峰命名法，如`UserController`, `CustomerService`
- **方法名**: 驼峰命名法，如`getUserById()`, `createUser()`
- **变量名**: 驼峰命名法，如`userId`, `customerList`
- **常量名**: 大写字母+下划线，如`MAX_RETRY_COUNT`

#### 4.2 文档注释

所有类和公共方法都需要添加JavaDoc注释：

```java
/**
 * 用户服务类
 * 提供用户相关的业务逻辑处理
 * 
 * @author 开发者姓名
 * @since 1.0.0
 */
@Service
public class UserService {
    
    /**
     * 根据用户ID获取用户信息
     * 
     * @param userId 用户ID
     * @return 用户信息
     * @throws ResourceNotFoundException 当用户不存在时抛出
     */
    public UserResponse getUserById(Long userId) {
        // 方法实现
    }
}
```

#### 4.3 异常处理

使用统一的异常处理器：

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(404, ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex) {
        ErrorResponse error = new ErrorResponse(400, ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        ErrorResponse error = new ErrorResponse(500, "内部服务器错误");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
```

### 5. 环境配置

#### 5.1 Maven配置 (pom.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.1</version>
        <relativePath/>
    </parent>
    
    <groupId>com.company</groupId>
    <artifactId>project-name</artifactId>
    <version>1.0.0</version>
    <name>project-name</name>
    <description>Spring Boot API项目</description>
    
    <properties>
        <java.version>17</java.version>
        <jjwt.version>0.12.3</jjwt.version>
    </properties>
    
    <dependencies>
        <!-- Spring Boot Starter Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <!-- Spring Boot Starter Security -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        
        <!-- Spring Boot Starter Data JPA -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        
        <!-- PostgreSQL Driver -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        
        <!-- JWT -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>${jjwt.version}</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        
        <!-- Spring Boot Starter Validation -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        
        <!-- Spring Boot Starter Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        
        <!-- Spring Security Test -->
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

#### 5.2 应用配置文件

**application.yml (主配置文件)**

```yaml
spring:
  profiles:
    active: dev
  application:
    name: project-name
  
  # JPA配置
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
  
  # 数据源配置
  datasource:
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5

# JWT配置
jwt:
  secret: your-jwt-secret-key-here
  expiration: 86400000 # 24小时（毫秒）

# 服务器配置
server:
  port: 8080
  servlet:
    context-path: /

# 日志配置
logging:
  level:
    com.company.projectname: INFO
    org.springframework.security: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
```

**application-dev.yml (开发环境配置)**

```yaml
spring:
  # 数据源配置
  datasource:
    url: jdbc:postgresql://your-neon-endpoint:5432/your-database-name
    username: your-username
    password: your-password
  
  # JPA配置
  jpa:
    show-sql: true
    hibernate:
      ddl-auto: update

# 日志配置
logging:
  level:
    com.company.projectname: DEBUG
    org.springframework.web: DEBUG
```

**application-prod.yml (生产环境配置)**

```yaml
spring:
  # 数据源配置
  datasource:
    url: ${DATABASE_URL}
    username: ${DATABASE_USERNAME}
    password: ${DATABASE_PASSWORD}
  
  # JPA配置
  jpa:
    show-sql: false
    hibernate:
      ddl-auto: validate

# JWT配置
jwt:
  secret: ${JWT_SECRET}

# 日志配置
logging:
  level:
    com.company.projectname: WARN
  file:
    name: ./logs/application.log
```

#### 5.3 环境变量配置

生产环境建议使用环境变量：

```bash
# 数据库配置
DATABASE_URL=jdbc:postgresql://your-neon-endpoint:5432/your-database-name
DATABASE_USERNAME=your-username
DATABASE_PASSWORD=your-password

# JWT配置
JWT_SECRET=your-jwt-secret-key-here
```

## API使用示例

### 1. 用户注册

```bash
# 用户注册
curl -X POST http://localhost:8080/api/public/register \
-H "Content-Type: application/json" \
-d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "123456"
}'
```

### 2. 用户登录

```bash
curl -X POST http://localhost:8080/api/public/login \
-H "Content-Type: application/json" \
-d '{
    "username": "testuser",
    "password": "123456"
}'
```

### 3. 获取用户列表（需要认证）

```bash
curl -X GET "http://localhost:8080/api/auth/users?page=0&size=10" \
-H "Authorization: Bearer <JWT_TOKEN>"
```

## 开发流程

### 1. 新增API接口

1. 在`entity`包中创建实体类
2. 在`repository`包中创建Repository接口
3. 在`service`包中创建Service类实现业务逻辑
4. 在`controller`包中创建Controller类定义API路由
5. 在`dto`包中创建请求和响应DTO类

### 2. 数据库迁移

当修改数据模型时：

1. 修改Entity类
2. 使用Spring Boot的自动建表功能（开发环境）
3. 生产环境建议使用Flyway或Liquibase进行版本控制

### 3. 测试流程

1. 编写单元测试（使用JUnit 5）
2. 编写集成测试（使用@SpringBootTest）
3. 使用Postman或curl测试API接口
4. 检查响应格式是否符合规范
5. 测试各种异常情况
6. 验证JWT鉴权是否正常工作

### 4. 项目构建和运行

```bash
# 编译项目
mvn clean compile

# 运行测试
mvn test

# 打包项目
mvn clean package

# 运行项目
java -jar target/project-name-1.0.0.jar

# 或者直接使用Maven运行
mvn spring-boot:run
```

## 常见问题

### 1. 数据库连接失败

检查`application.yml`文件中的数据库配置信息是否正确，确保Neon数据库连接字符串、用户名和密码正确。

### 2. JWT Token过期

Token默认有效期为24小时，过期后需要重新登录获取新Token。

### 3. 跨域问题

如需支持跨域请求，可以在配置类中添加CORS配置：

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*");
    }
}
```

### 4. 日志记录

Spring Boot自带日志功能，可以在`application.yml`中配置日志级别和输出格式。

### 5. 性能优化

- 使用连接池管理数据库连接
- 合理使用JPA的延迟加载
- 添加适当的数据库索引
- 使用缓存减少数据库查询

