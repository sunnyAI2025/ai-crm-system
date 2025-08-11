-- AI CRM 系统数据库初始化脚本
-- 创建基础表结构

-- 1. 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar VARCHAR(255),
    description TEXT,
    department_id BIGINT,
    role_id BIGINT,
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 部门表
CREATE TABLE IF NOT EXISTS departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id BIGINT,
    manager_id BIGINT,
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 角色表
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions JSON,
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 线索表
CREATE TABLE IF NOT EXISTS leads (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    business_type VARCHAR(50),
    source_channel VARCHAR(50),
    source_type SMALLINT,
    campaign_id BIGINT,
    assigned_user_id BIGINT,
    assigned_time TIMESTAMP,
    intention_level SMALLINT DEFAULT 3,
    follow_status SMALLINT DEFAULT 1,
    is_converted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. 客户表
CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    business_type VARCHAR(50),
    source_channel VARCHAR(50),
    source_lead_id BIGINT,
    assigned_user_id BIGINT,
    customer_level SMALLINT DEFAULT 1,
    customer_status SMALLINT DEFAULT 1,
    next_visit_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. 订单表
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    order_status SMALLINT DEFAULT 1,
    payment_status SMALLINT DEFAULT 1,
    assigned_user_id BIGINT,
    order_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. 活动表
CREATE TABLE IF NOT EXISTS campaigns (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50),
    budget DECIMAL(12,2),
    start_date DATE,
    end_date DATE,
    status SMALLINT DEFAULT 1,
    creator_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. 跟踪记录表
CREATE TABLE IF NOT EXISTS tracking_records (
    id BIGSERIAL PRIMARY KEY,
    target_type SMALLINT NOT NULL,
    target_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    record_type VARCHAR(50),
    contact_method VARCHAR(50),
    intention_level SMALLINT,
    next_follow_time TIMESTAMP,
    creator_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_department_id ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_user_id ON leads(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_leads_campaign_id ON leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_leads_follow_status ON leads(follow_status);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_assigned_user_id ON customers(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_customers_source_lead_id ON customers(source_lead_id);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_user_id ON orders(assigned_user_id);

CREATE INDEX IF NOT EXISTS idx_campaigns_creator_id ON campaigns(creator_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

CREATE INDEX IF NOT EXISTS idx_tracking_records_target ON tracking_records(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_tracking_records_creator_id ON tracking_records(creator_id);

-- 插入初始数据
-- 1. 初始角色
INSERT INTO roles (id, name, description, permissions) VALUES 
(1, '系统管理员', '系统管理员角色，拥有所有权限', '{"all": true}'),
(2, '销售经理', '销售经理角色', '{"sales": ["read", "write", "delete"], "dashboard": ["read"]}'),
(3, '销售专员', '销售专员角色', '{"sales": ["read", "write"], "dashboard": ["read"]}')
ON CONFLICT (id) DO NOTHING;

-- 2. 初始部门
INSERT INTO departments (id, name, description) VALUES 
(1, '技术部', '技术开发部门'),
(2, '销售部', '销售业务部门'),
(3, '市场部', '市场营销部门')
ON CONFLICT (id) DO NOTHING;

-- 3. 初始管理员用户 (密码: admin123)
INSERT INTO users (id, username, password, name, department_id, role_id) VALUES 
(1, 'admin', '$2a$10$rPwOyV1RGr3dNFtf6yGS8OzFwP0W.0QvK.9vNGOFW.JR6W1qGKHn2', '系统管理员', 1, 1)
ON CONFLICT (id) DO NOTHING;
