-- CRM系统数据库创建和数据初始化脚本
-- PostgreSQL 兼容版本

-- 删除已存在的表（如果存在）
DROP TABLE IF EXISTS campaign_daily_stats CASCADE;
DROP TABLE IF EXISTS tracking_records CASCADE;
DROP TABLE IF EXISTS operation_logs CASCADE;
DROP TABLE IF EXISTS login_logs CASCADE;
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- 1. 部门表
CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id BIGINT DEFAULT 0,
    manager_id BIGINT,
    creator_id BIGINT,
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 角色表
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    department_id BIGINT,
    permissions TEXT,
    status SMALLINT DEFAULT 1,
    creator_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 用户表
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
    last_login_time TIMESTAMP,
    login_count INT DEFAULT 0,
    online_hours INT DEFAULT 0,
    status SMALLINT DEFAULT 1,
    creator_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 线索表
CREATE TABLE leads (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    source VARCHAR(50),
    status VARCHAR(20),
    assigned_to VARCHAR(100),
    notes TEXT,
    business_type VARCHAR(50),
    source_channel VARCHAR(50),
    source_type SMALLINT,
    campaign_id BIGINT,
    assigned_user_id BIGINT,
    assigned_time TIMESTAMP,
    intention_level SMALLINT,
    follow_status SMALLINT DEFAULT 1,
    is_converted SMALLINT DEFAULT 0,
    converted_time TIMESTAMP,
    converted_customer_id BIGINT,
    creator_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. 客户表
CREATE TABLE customers (
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
    total_order_amount DECIMAL(12,2) DEFAULT 0,
    order_count INT DEFAULT 0,
    creator_id BIGINT,
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. 订单表
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    total_amount DECIMAL(12,2) DEFAULT 0,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    unpaid_amount DECIMAL(12,2) DEFAULT 0,
    order_status SMALLINT DEFAULT 1,
    payment_status SMALLINT DEFAULT 1,
    assigned_user_id BIGINT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_date TIMESTAMP,
    creator_id BIGINT,
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. 订单商品表
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    product_type VARCHAR(50),
    price DECIMAL(10,2) NOT NULL,
    quantity INT DEFAULT 1,
    service_period INT,
    service_start_date DATE,
    service_end_date DATE,
    consumption_status SMALLINT DEFAULT 1,
    consumption_progress VARCHAR(50),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. 支付记录表
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    payment_no VARCHAR(50),
    payment_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_channel VARCHAR(50),
    payment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_status SMALLINT DEFAULT 1,
    payment_type SMALLINT,
    transaction_id VARCHAR(100),
    remarks TEXT,
    creator_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. 推广活动表
CREATE TABLE campaigns (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    channel_type VARCHAR(50),
    channel_name VARCHAR(100),
    campaign_url VARCHAR(500),
    qr_code_url VARCHAR(500),
    landing_page_config TEXT,
    form_config TEXT,
    start_date DATE,
    end_date DATE,
    total_budget DECIMAL(12,2) DEFAULT 0,
    daily_budget DECIMAL(10,2) DEFAULT 0,
    actual_cost DECIMAL(12,2) DEFAULT 0,
    pv_count INT DEFAULT 0,
    uv_count INT DEFAULT 0,
    leads_count INT DEFAULT 0,
    conversion_count INT DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    roi DECIMAL(8,2) DEFAULT 0,
    campaign_status SMALLINT DEFAULT 1,
    creator_id BIGINT,
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. 活动数据统计表
CREATE TABLE campaign_daily_stats (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL,
    stat_date DATE NOT NULL,
    daily_pv INT DEFAULT 0,
    daily_uv INT DEFAULT 0,
    daily_leads INT DEFAULT 0,
    daily_conversion INT DEFAULT 0,
    daily_cost DECIMAL(10,2) DEFAULT 0,
    daily_conversion_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. 跟踪记录表
CREATE TABLE tracking_records (
    id BIGSERIAL PRIMARY KEY,
    target_type SMALLINT NOT NULL,
    target_id BIGINT NOT NULL,
    record_type VARCHAR(50),
    content TEXT NOT NULL,
    contact_method VARCHAR(50),
    next_follow_time TIMESTAMP,
    intention_level SMALLINT,
    creator_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. 操作日志表
CREATE TABLE operation_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    module VARCHAR(50),
    operation VARCHAR(100),
    target_type VARCHAR(50),
    target_id BIGINT,
    description TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    operation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. 登录日志表
CREATE TABLE login_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    username VARCHAR(50),
    login_type SMALLINT DEFAULT 1,
    login_status SMALLINT DEFAULT 1,
    ip_address VARCHAR(50),
    user_agent TEXT,
    error_message TEXT,
    session_duration INT,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. 文件表
CREATE TABLE files (
    id BIGSERIAL PRIMARY KEY,
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(50),
    mime_type VARCHAR(100),
    file_hash VARCHAR(64),
    upload_user_id BIGINT,
    reference_type VARCHAR(50),
    reference_id BIGINT,
    is_public SMALLINT DEFAULT 0,
    download_count INT DEFAULT 0,
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_department_role ON users(department_id, role_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_user ON leads(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source_channel, source_type);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(follow_status, status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_assigned_user ON customers(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(customer_status, status);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_user ON orders(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status, payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);

-- 插入初始数据
-- 1. 部门数据
INSERT INTO departments (name, description, parent_id, manager_id, creator_id, status) VALUES
('总部', '公司总部', 0, NULL, 1, 1),
('销售部', '负责产品销售和客户维护', 1, NULL, 1, 1),
('营销部', '负责市场推广和活动策划', 1, NULL, 1, 1),
('技术部', '负责系统开发和维护', 1, NULL, 1, 1),
('财务部', '负责财务管理和核算', 1, NULL, 1, 1),
('人事部', '负责人力资源管理', 1, NULL, 1, 1),
('客服部', '负责客户服务支持', 1, NULL, 1, 1),
('产品部', '负责产品规划和设计', 1, NULL, 1, 1),
('运营部', '负责产品运营和推广', 1, NULL, 1, 1),
('法务部', '负责法律事务处理', 1, NULL, 1, 1);

-- 继续插入部门数据到60条
INSERT INTO departments (name, description, parent_id, manager_id, creator_id, status) 
SELECT 
    '部门' || generate_series(11, 60),
    '部门描述' || generate_series(11, 60),
    ((generate_series(11, 60) - 1) % 10) + 1,
    NULL,
    1,
    1;

-- 2. 角色数据
INSERT INTO roles (name, description, department_id, permissions, status, creator_id) VALUES
('系统管理员', '拥有所有权限的超级管理员', 1, '{"all": true}', 1, 1),
('销售经理', '销售部门经理，管理销售团队', 2, '{"sales": {"all": true}}', 1, 1),
('销售员', '普通销售人员，负责线索和客户管理', 2, '{"sales": {"leads": true}}', 1, 1),
('营销经理', '营销部门经理，管理营销活动', 3, '{"marketing": {"all": true}}', 1, 1),
('营销专员', '营销专员，负责活动执行', 3, '{"marketing": {"campaigns": true}}', 1, 1);

-- 继续插入角色数据到60条
INSERT INTO roles (name, description, department_id, permissions, status, creator_id) 
SELECT 
    '角色' || generate_series(6, 60),
    '角色描述' || generate_series(6, 60),
    ((generate_series(6, 60) - 1) % 10) + 1,
    '{"basic": true}',
    1,
    1;

-- 3. 用户数据
-- 插入管理员
INSERT INTO users (username, password, name, phone, avatar, department_id, role_id, last_login_time, login_count, online_hours, status, creator_id) 
VALUES ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaLyd.r2SMJjS', '系统管理员', '13800138000', NULL, 1, 1, NULL, 0, 0, 1, NULL);

-- 继续插入用户数据到60条
INSERT INTO users (username, password, name, phone, avatar, department_id, role_id, last_login_time, login_count, online_hours, status, creator_id) 
SELECT 
    'user' || LPAD(generate_series(1, 59)::text, 3, '0'),
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaLyd.r2SMJjS',
    '用户' || generate_series(1, 59),
    '138' || LPAD((random() * 100000000)::bigint::text, 8, '0'),
    NULL,
    ((generate_series(1, 59) - 1) % 10) + 1,
    ((generate_series(1, 59) - 1) % 5) + 1,
    NOW() - INTERVAL '1 day' * (random() * 30)::int,
    (random() * 100)::int,
    (random() * 200)::int,
    1,
    1;

-- 4. 线索数据
INSERT INTO leads (name, phone, email, source, status, assigned_to, notes, business_type, source_channel, source_type, campaign_id, assigned_user_id, assigned_time, intention_level, follow_status, is_converted, converted_time, converted_customer_id, creator_id, status)
SELECT 
    '线索' || generate_series(1, 60),
    '139' || LPAD((random() * 100000000)::bigint::text, 8, '0'),
    'lead' || generate_series(1, 60) || '@example.com',
    (ARRAY['网站咨询', '电话营销', '微信推广', '百度竞价', '抖音广告'])[ceil(random() * 5)],
    (ARRAY['待跟进', '已联系', '有意向', '无意向', '已转化'])[ceil(random() * 5)],
    '销售' || ceil(random() * 10),
    '线索备注信息' || generate_series(1, 60),
    (ARRAY['工商注册', '代理记账', '税务筹划', '法律咨询', '知识产权'])[ceil(random() * 5)],
    (ARRAY['网站咨询', '电话营销', '微信推广', '百度竞价', '抖音广告'])[ceil(random() * 5)],
    (random() > 0.5)::int,
    ceil(random() * 10),
    ceil(random() * 60),
    NULL,
    ceil(random() * 3),
    ceil(random() * 4),
    (random() > 0.8)::int,
    NULL,
    NULL,
    ceil(random() * 10),
    1;

-- 5. 客户数据
INSERT INTO customers (name, phone, business_type, source_channel, source_lead_id, assigned_user_id, customer_level, customer_status, next_visit_time, total_order_amount, order_count, creator_id, status)
SELECT 
    '客户' || generate_series(1, 60),
    '137' || LPAD((random() * 100000000)::bigint::text, 8, '0'),
    (ARRAY['工商注册', '代理记账', '税务筹划', '法律咨询', '知识产权'])[ceil(random() * 5)],
    (ARRAY['网站咨询', '电话营销', '微信推广', '百度竞价', '抖音广告'])[ceil(random() * 5)],
    ceil(random() * 60),
    ceil(random() * 60),
    ceil(random() * 5),
    ceil(random() * 4),
    NOW() + INTERVAL '1 day' * (random() * 30)::int,
    (random() * 50000)::decimal(12,2),
    (random() * 10)::int,
    ceil(random() * 10),
    1;

-- 6. 订单数据
INSERT INTO orders (order_no, customer_id, total_amount, paid_amount, unpaid_amount, order_status, payment_status, assigned_user_id, order_date, completion_date, creator_id, status)
SELECT 
    'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(generate_series(1, 60)::text, 4, '0'),
    ceil(random() * 60),
    (random() * 20000 + 1000)::decimal(12,2),
    (random() * 15000)::decimal(12,2),
    (random() * 5000)::decimal(12,2),
    ceil(random() * 6),
    ceil(random() * 3),
    ceil(random() * 60),
    NOW() - INTERVAL '1 day' * (random() * 90)::int,
    CASE WHEN random() > 0.5 THEN NOW() - INTERVAL '1 day' * (random() * 30)::int ELSE NULL END,
    ceil(random() * 10),
    1;

-- 7. 订单商品数据
INSERT INTO order_items (order_id, product_name, product_type, price, quantity, service_period, service_start_date, service_end_date, consumption_status, consumption_progress, remarks)
SELECT 
    ceil(random() * 60),
    (ARRAY['工商注册服务', '代理记账服务', '税务筹划服务', '法律咨询服务', '知识产权服务'])[ceil(random() * 5)],
    (ARRAY['基础版', '标准版', '专业版', '企业版'])[ceil(random() * 4)],
    (random() * 5000 + 500)::decimal(10,2),
    ceil(random() * 5),
    ceil(random() * 12),
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 month' * ceil(random() * 12),
    ceil(random() * 3),
    ceil(random() * 90) || '%',
    '服务进行中';

-- 8. 支付记录数据
INSERT INTO payments (order_id, payment_no, payment_amount, payment_method, payment_channel, payment_time, payment_status, payment_type, transaction_id, remarks, creator_id)
SELECT 
    ceil(random() * 60),
    'PAY' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(generate_series(1, 60)::text, 4, '0'),
    (random() * 10000 + 100)::decimal(10,2),
    (ARRAY['微信支付', '支付宝', '银行转账', '现金', '刷卡'])[ceil(random() * 5)],
    (ARRAY['线上', '线下', '银行'])[ceil(random() * 3)],
    NOW() - INTERVAL '1 day' * (random() * 60)::int,
    1,
    ceil(random() * 3),
    'TXN' || (random() * 900000 + 100000)::bigint,
    '支付成功',
    ceil(random() * 10);

-- 9. 推广活动数据
INSERT INTO campaigns (name, channel_type, channel_name, campaign_url, qr_code_url, landing_page_config, form_config, start_date, end_date, total_budget, daily_budget, actual_cost, pv_count, uv_count, leads_count, conversion_count, conversion_rate, roi, campaign_status, creator_id, status)
SELECT 
    '推广活动' || generate_series(1, 60),
    (ARRAY['SEM搜索', '表单推广', '海报活动', '电话推广', '微信推广', '抖音推广'])[ceil(random() * 6)],
    '渠道' || generate_series(1, 60),
    'https://campaign' || generate_series(1, 60) || '.example.com',
    'https://qr' || generate_series(1, 60) || '.example.com',
    '{"theme": "default"}',
    '{"fields": ["name", "phone"]}',
    CURRENT_DATE - INTERVAL '1 day' * (random() * 60)::int,
    CURRENT_DATE + INTERVAL '1 day' * (random() * 90)::int,
    (random() * 50000 + 5000)::decimal(12,2),
    (random() * 1000 + 100)::decimal(10,2),
    (random() * 30000 + 1000)::decimal(12,2),
    (random() * 10000 + 1000)::int,
    (random() * 5000 + 500)::int,
    (random() * 200 + 10)::int,
    (random() * 50 + 1)::int,
    (random() * 20 + 5)::decimal(5,2),
    (random() * 4 + 1.5)::decimal(8,2),
    ceil(random() * 3),
    ceil(random() * 10),
    1;

-- 10. 活动统计数据
INSERT INTO campaign_daily_stats (campaign_id, stat_date, daily_pv, daily_uv, daily_leads, daily_conversion, daily_cost, daily_conversion_rate)
SELECT 
    ceil(random() * 60),
    CURRENT_DATE - INTERVAL '1 day' * (random() * 30)::int,
    (random() * 1000 + 100)::int,
    (random() * 500 + 50)::int,
    (random() * 50 + 5)::int,
    (random() * 10 + 1)::int,
    (random() * 500 + 50)::decimal(10,2),
    (random() * 20 + 5)::decimal(5,2);

-- 11. 跟踪记录数据
INSERT INTO tracking_records (target_type, target_id, record_type, content, contact_method, next_follow_time, intention_level, creator_id)
SELECT 
    (ARRAY[1, 2])[ceil(random() * 2)],
    ceil(random() * 60),
    (ARRAY['首次接触', '跟进沟通', '需求确认', '方案介绍', '价格谈判', '成单确认', '回访'])[ceil(random() * 7)],
    '跟进记录内容' || generate_series(1, 60),
    (ARRAY['电话', '微信', '邮件', '面谈', '视频会议'])[ceil(random() * 5)],
    NOW() + INTERVAL '1 day' * (random() * 30)::int,
    ceil(random() * 3),
    ceil(random() * 10);

-- 12. 操作日志数据
INSERT INTO operation_logs (user_id, module, operation, target_type, target_id, description, ip_address, user_agent, operation_time)
SELECT 
    ceil(random() * 60),
    (ARRAY['用户管理', '线索管理', '客户管理', '订单管理', '营销管理', '系统设置'])[ceil(random() * 6)],
    (ARRAY['创建', '更新', '删除', '查看', '导出', '导入'])[ceil(random() * 6)],
    (ARRAY['user', 'lead', 'customer', 'order', 'campaign'])[ceil(random() * 5)],
    ceil(random() * 100),
    '用户执行了操作' || generate_series(1, 60),
    '192.168.1.' || ceil(random() * 254),
    'Mozilla/5.0 Chrome Browser',
    NOW() - INTERVAL '1 day' * (random() * 30)::int;

-- 13. 登录日志数据
INSERT INTO login_logs (user_id, username, login_type, login_status, ip_address, user_agent, error_message, session_duration, login_time, logout_time)
SELECT 
    ceil(random() * 60),
    'user' || LPAD(ceil(random() * 60)::text, 3, '0'),
    1,
    1,
    '192.168.1.' || ceil(random() * 254),
    'Mozilla/5.0 Chrome Browser',
    NULL,
    (random() * 28800)::int,
    NOW() - INTERVAL '1 day' * (random() * 30)::int,
    NOW() - INTERVAL '1 day' * (random() * 30)::int + INTERVAL '1 hour' * (random() * 8)::int;

-- 14. 文件数据
INSERT INTO files (original_name, file_name, file_path, file_size, file_type, mime_type, file_hash, upload_user_id, reference_type, reference_id, is_public, download_count, status)
SELECT 
    'file_' || generate_series(1, 60) || '.jpg',
    md5(random()::text) || '.jpg',
    '/uploads/' || md5(random()::text) || '.jpg',
    (random() * 10485760 + 1024)::bigint,
    (ARRAY['jpg', 'png', 'pdf', 'doc', 'xls', 'txt'])[ceil(random() * 6)],
    (ARRAY['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/excel', 'text/plain'])[ceil(random() * 6)],
    md5(random()::text),
    ceil(random() * 60),
    (ARRAY['avatar', 'document', 'attachment', 'image'])[ceil(random() * 4)],
    ceil(random() * 100),
    (random() > 0.5)::int,
    (random() * 100)::int,
    1;

-- 完成提示
SELECT '数据库表结构和测试数据创建完成！' as result;
SELECT '管理员账号: admin, 密码: admin123' as login_info;
