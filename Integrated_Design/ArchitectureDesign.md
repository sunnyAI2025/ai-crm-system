# CRM系统架构设计文档

## 项目概述

本项目是一个基于AI的客户关系管理（CRM）系统，采用前后端分离架构，支持销售管理、营销管理、系统管理和AI数据分析等核心功能。系统设计遵循微服务架构模式，确保系统的可扩展性、可维护性和高性能。

## 设计理念

- **前后端分离**: 前端专注UI交互，后端专注业务逻辑和数据处理
- **微服务架构**: 按业务域划分服务，降低耦合度，提升独立部署能力
- **模块化设计**: 清晰的功能模块划分，便于团队协作和维护
- **API优先**: 标准化的RESTful API设计，支持多端接入

## 技术栈

### 前端技术栈
- **框架**: React 18+
- **UI组件库**: Ant Design 5.x
- **状态管理**: React Context + useReducer
- **HTTP客户端**: Axios
- **路由**: React Router v6
- **构建工具**: Vite

### 后端技术栈
- **开发语言**: Java 17+
- **框架**: Spring Boot 3.2.x
- **安全认证**: Spring Security + JWT
- **数据库**: PostgreSQL (Neon云数据库)
- **ORM框架**: Spring Data JPA + Hibernate
- **API网关**: Spring Cloud Gateway
- **构建工具**: Maven 3.9+

## 系统架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        客户端层                                  │
├─────────────────────────────────────────────────────────────────┤
│                    React前端应用                                 │
│                   (端口: 300000)                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API网关层                                  │
├─────────────────────────────────────────────────────────────────┤
│                   Spring Cloud Gateway                         │
│                     (端口: 50001)                               │
│                - 路由分发 - 统一认证 - 负载均衡 -                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┼─────────┐
                    │         │         │
                    ▼         ▼         ▼
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│   认证服务       │   销售管理服务   │   营销管理服务   │   系统管理服务   │
│  (端口:50002)   │  (端口:50003)   │  (端口:50004)   │  (端口:50005)   │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ - 用户登录       │ - 线索管理      │ - 推广活动管理   │ - 账号管理      │
│ - JWT生成       │ - 客户管理      │ - 渠道管理      │ - 角色管理      │
│ - 权限验证       │ - 成单管理      │ - 活动统计      │ - 权限管理      │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
┌─────────────────┬─────────────────┬─────────────────┐
│   数据分析服务   │   仪表盘服务     │   文件服务       │
│  (端口:50006)   │  (端口:50007)   │  (端口:50008)   │
├─────────────────┼─────────────────┼─────────────────┤
│ - 智能预测分析   │ - 数据统计      │ - 头像上传      │
│ - 个性化推荐     │ - 报表生成      │ - 文件管理      │
│ - 风险评估      │ - 趋势分析      │ - 图片处理      │
│ - 情感分析      │                │                │
└─────────────────┴─────────────────┴─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       数据存储层                                  │
├─────────────────────────────────────────────────────────────────┤
│                    PostgreSQL数据库                             │
│                      (Neon云数据库)                              │
│              - 用户数据 - 业务数据 - 统计数据 -                     │
└─────────────────────────────────────────────────────────────────┘
```

## 功能模块设计

### 1. 前端模块划分

```
frontend/
├── src/
│   ├── components/          # 通用组件
│   │   ├── Layout/         # 主布局组件
│   │   ├── Common/         # 公共组件
│   │   └── AI/             # AI聊天组件
│   ├── pages/              # 页面组件
│   │   ├── Dashboard/      # 首页仪表盘
│   │   ├── Sales/          # 销售管理
│   │   │   ├── Leads/      # 线索管理
│   │   │   ├── Customers/  # 客户管理
│   │   │   └── Orders/     # 成单管理
│   │   ├── Marketing/      # 营销管理
│   │   │   └── Campaigns/  # 推广活动管理
│   │   ├── System/         # 系统管理
│   │   │   ├── Users/      # 账号管理
│   │   │   └── Roles/      # 角色管理
│   │   └── Auth/           # 认证页面
│   ├── services/           # API服务
│   ├── utils/              # 工具函数
│   ├── hooks/              # 自定义Hooks
│   └── styles/             # 样式文件
```

### 2. 后端微服务划分

#### 2.1 API网关服务 (端口: 50001)
**职责**: 统一入口、路由分发、认证鉴权、负载均衡
- 请求路由到对应的微服务
- JWT令牌验证
- 跨域处理
- API限流

#### 2.2 认证服务 (端口: 50002)
**职责**: 用户认证、权限管理
- 用户登录/登出
- JWT令牌生成和验证
- 权限校验
- 密码加密

#### 2.3 销售管理服务 (端口: 50003)
**职责**: 线索、客户、订单管理
- 线索管理：创建、查询、跟踪、转化
- 客户管理：客户信息维护、跟踪记录
- 成单管理：订单、商品、支付管理

#### 2.4 营销管理服务 (端口: 50004)
**职责**: 推广活动管理
- 活动创建、编辑、删除
- 表单构建和管理
- 活动数据统计
- 渠道管理

#### 2.5 系统管理服务 (端口: 50005)
**职责**: 账号、角色、权限管理
- 账号创建、修改、查询
- 角色定义和分配
- 权限配置
- 部门管理

#### 2.6 数据分析服务 (端口: 50006)
**职责**: AI智能分析功能
- 智能预测分析
- 个性化推荐
- 风险评估
- 情感分析

#### 2.7 仪表盘服务 (端口: 50007)
**职责**: 数据统计和报表
- 线索统计
- 成单统计
- 营销统计
- 销售统计

#### 2.8 文件服务 (端口: 50008)
**职责**: 文件上传和管理
- 头像上传
- 文件存储
- 图片处理

## 数据库设计

### 数据库基础规范
- **数据库**: PostgreSQL (Neon云数据库)
- **字符集**: UTF-8
- **主键**: 所有表使用`id`字段作为主键，BIGINT类型，自增
- **时间字段**: 统一使用`created_at`和`updated_at`
- **状态字段**: 使用`status`字段，1表示正常，0表示禁用
- **无外键约束**: 应用层维护数据一致性

### 核心数据表

#### 1. 用户认证相关表

```sql
-- 用户表
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar VARCHAR(255),
    description TEXT,
    department_id BIGINT,
    role_id BIGINT,
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 角色表
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    permissions TEXT, -- JSON格式存储权限
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 部门表
CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id BIGINT DEFAULT 0,
    creator_id BIGINT,
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. 销售管理相关表

```sql
-- 线索表
CREATE TABLE leads (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    business_type VARCHAR(50),
    source_channel VARCHAR(50),
    source_type TINYINT, -- 1:付费 0:免费
    assigned_user_id BIGINT,
    intention_level TINYINT, -- 1:高 2:中 3:低
    status TINYINT DEFAULT 1, -- 1:待跟进 2:跟进中 3:已转化 4:无效
    is_converted TINYINT DEFAULT 0,
    creator_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 客户表
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    business_type VARCHAR(50),
    source_channel VARCHAR(50),
    assigned_user_id BIGINT,
    customer_level TINYINT DEFAULT 1,
    next_visit_time TIMESTAMP,
    creator_id BIGINT,
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 订单表
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) DEFAULT 0,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    order_status TINYINT DEFAULT 1, -- 1:待付款 2:部分付款 3:已支付 4:进行中 5:已完成
    payment_status TINYINT DEFAULT 1, -- 1:待支付 2:部分付款 3:已支付
    assigned_user_id BIGINT,
    creator_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. 营销管理相关表

```sql
-- 推广活动表
CREATE TABLE campaigns (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    channel_type VARCHAR(50), -- SEM搜索、表单推广、海报活动、电话推广
    channel_name VARCHAR(100),
    url VARCHAR(500),
    qr_code VARCHAR(500),
    form_config TEXT, -- JSON格式存储表单配置
    budget DECIMAL(10,2) DEFAULT 0,
    cost DECIMAL(10,2) DEFAULT 0,
    pv INT DEFAULT 0,
    uv INT DEFAULT 0,
    leads_count INT DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    status TINYINT DEFAULT 1, -- 1:进行中 0:已结束
    creator_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. 跟踪记录表

```sql
-- 跟踪记录表（线索和客户通用）
CREATE TABLE tracking_records (
    id BIGSERIAL PRIMARY KEY,
    target_type TINYINT NOT NULL, -- 1:线索 2:客户
    target_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    record_type VARCHAR(50), -- 首次接触、跟进沟通、成单确认等
    creator_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API设计规范

### 1. 接口路径规范

```
/api/auth/login              # 用户登录
/api/auth/logout             # 用户登出

/api/sales/leads             # 线索管理
/api/sales/customers         # 客户管理
/api/sales/orders            # 订单管理

/api/marketing/campaigns     # 推广活动管理

/api/system/users            # 用户管理
/api/system/roles            # 角色管理
/api/system/departments      # 部门管理

/api/analytics/predict       # 智能预测
/api/analytics/recommend     # 个性化推荐
/api/analytics/report        # 报告生成
/api/analytics/risk          # 风险评估
/api/analytics/sentiment     # 情感分析

/api/dashboard/stats         # 仪表盘统计

/api/files/upload            # 文件上传
```

### 2. 响应格式规范

```json
{
    "code": 0,
    "message": "操作成功",
    "data": {
        "content": [...],
        "page": 0,
        "size": 10,
        "totalElements": 100,
        "totalPages": 10
    }
}
```

## 部署方案

### 本地开发环境

#### 端口分配
- **前端应用**: 300000
- **API网关**: 50001
- **认证服务**: 50002
- **销售管理服务**: 50003
- **营销管理服务**: 50004
- **系统管理服务**: 50005
- **数据分析服务**: 50006
- **仪表盘服务**: 50007
- **文件服务**: 50008

#### 启动顺序
1. 启动数据库 (Neon云数据库)
2. 启动各个微服务 (50002-50008)
3. 启动API网关 (50001)
4. 启动前端应用 (300000)

#### 开发环境配置
```yaml
# application-dev.yml
spring:
  datasource:
    url: jdbc:postgresql://neon-endpoint:5432/neondb
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  
server:
  port: ${SERVICE_PORT}

jwt:
  secret: dev-jwt-secret-key
  expiration: 86400000
```

## 项目结构

```
Ai_CRM_1/
├── frontend/                    # 前端项目(React)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── backend/                     # 后端微服务
│   ├── gateway-service/         # API网关服务 (50001)
│   ├── auth-service/           # 认证服务 (50002)
│   ├── sales-service/          # 销售管理服务 (50003)
│   ├── marketing-service/      # 营销管理服务 (50004)
│   ├── system-service/         # 系统管理服务 (50005)
│   ├── analytics-service/      # 数据分析服务 (50006)
│   ├── dashboard-service/      # 仪表盘服务 (50007)
│   └── file-service/           # 文件服务 (50008)
├── database/                   # 数据库脚本
│   ├── init.sql               # 初始化脚本
│   └── migrations/            # 数据迁移脚本
├── docs/                      # 项目文档
├── Design/                    # UI设计文档
├── ArchitectureDesign.md      # 架构设计文档
└── README.md                  # 项目说明
```

## 安全机制

### 1. 认证授权
- JWT令牌认证
- 基于角色的访问控制(RBAC)
- API网关统一鉴权

### 2. 数据安全
- 密码BCrypt加密
- 敏感信息脱敏显示
- 数据库连接加密

### 3. API安全
- 请求参数验证
- SQL注入防护
- XSS攻击防护

## 性能优化

### 1. 数据库优化
- 合理设计索引
- 分页查询
- 连接池管理

### 2. 服务优化
- 微服务独立部署
- 负载均衡
- 缓存策略

### 3. 前端优化
- 组件懒加载
- 代码分割
- 静态资源压缩

## 开发流程

### 1. 前端开发
1. 基于UI设计实现页面组件
2. 集成Ant Design组件库
3. 实现路由和状态管理
4. 调用后端API接口

### 2. 后端开发
1. 设计数据库表结构
2. 实现微服务业务逻辑
3. 开发RESTful API接口
4. 编写单元测试和集成测试

### 3. 联调测试
1. 前后端接口联调
2. 功能测试
3. 性能测试
4. 安全测试

## 总结

本架构设计基于微服务模式，将CRM系统按业务域划分为8个独立服务，采用前后端分离开发模式。系统具备良好的可扩展性、可维护性和安全性，能够满足企业级CRM系统的需求。通过标准化的API设计和规范化的开发流程，确保系统的高质量交付。
