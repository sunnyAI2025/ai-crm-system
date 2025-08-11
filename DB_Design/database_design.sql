-- CRM系统完整数据库设计
-- 数据库: PostgreSQL (Neon云数据库)
-- 字符集: UTF-8
-- 时间: 2024-03-15

-- ===============================================
-- 1. 系统管理相关表
-- ===============================================

-- 部门表
CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '部门名称',
    description TEXT COMMENT '部门描述',
    parent_id BIGINT DEFAULT 0 COMMENT '上级部门ID，0表示顶级部门',
    manager_id BIGINT COMMENT '部门负责人ID',
    creator_id BIGINT COMMENT '创建人ID',
    status SMALLINT DEFAULT 1 COMMENT '状态：1-正常，0-停用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 角色表
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '角色名称',
    description TEXT COMMENT '角色描述',
    department_id BIGINT COMMENT '所属部门ID',
    permissions TEXT COMMENT '权限配置，JSON格式存储',
    status SMALLINT DEFAULT 1 COMMENT '状态：1-启用，0-停用',
    creator_id BIGINT COMMENT '创建人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 用户表
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '登录账号',
    password VARCHAR(255) NOT NULL COMMENT '密码(BCrypt加密)',
    name VARCHAR(100) NOT NULL COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    avatar VARCHAR(255) COMMENT '头像URL',
    description TEXT COMMENT '个人简介',
    department_id BIGINT COMMENT '所属部门ID',
    role_id BIGINT COMMENT '角色ID',
    last_login_time TIMESTAMP COMMENT '最后登录时间',
    login_count INT DEFAULT 0 COMMENT '登录次数',
    online_hours INT DEFAULT 0 COMMENT '在线时长(小时)',
    status SMALLINT DEFAULT 1 COMMENT '状态：1-正常，0-停用',
    creator_id BIGINT COMMENT '创建人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- ===============================================
-- 2. 销售管理相关表
-- ===============================================

-- 线索表
CREATE TABLE leads (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '客户姓名',
    phone VARCHAR(20) NOT NULL COMMENT '联系电话',
    business_type VARCHAR(50) COMMENT '业务类型(专业)',
    source_channel VARCHAR(50) COMMENT '数据来源渠道',
    source_type SMALLINT COMMENT '渠道类型：1-付费，0-免费',
    campaign_id BIGINT COMMENT '关联推广活动ID',
    assigned_user_id BIGINT COMMENT '分配给的销售人员ID',
    assigned_time TIMESTAMP COMMENT '分配时间',
    intention_level SMALLINT COMMENT '意向度：1-高，2-中，3-低',
    follow_status SMALLINT DEFAULT 1 COMMENT '跟进状态：1-待跟进，2-跟进中，3-已转化，4-无效',
    is_converted SMALLINT DEFAULT 0 COMMENT '是否已转化：1-是，0-否',
    converted_time TIMESTAMP COMMENT '转化时间',
    converted_customer_id BIGINT COMMENT '转化后的客户ID',
    creator_id BIGINT COMMENT '创建人ID',
    status SMALLINT DEFAULT 1 COMMENT '状态：1-正常，0-删除',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 客户表
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '客户姓名',
    phone VARCHAR(20) NOT NULL COMMENT '联系电话',
    business_type VARCHAR(50) COMMENT '业务类型',
    source_channel VARCHAR(50) COMMENT '来源渠道',
    source_lead_id BIGINT COMMENT '来源线索ID',
    assigned_user_id BIGINT COMMENT '负责销售人员ID',
    customer_level SMALLINT DEFAULT 1 COMMENT '客户等级：1-5星级',
    customer_status SMALLINT DEFAULT 1 COMMENT '客户状态：1-潜在，2-跟进中，3-已成单，4-流失',
    next_visit_time TIMESTAMP COMMENT '下次回访时间',
    total_order_amount DECIMAL(12,2) DEFAULT 0 COMMENT '累计成单金额',
    order_count INT DEFAULT 0 COMMENT '成单次数',
    creator_id BIGINT COMMENT '创建人ID',
    status SMALLINT DEFAULT 1 COMMENT '状态：1-正常，0-删除',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 订单表
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '订单号',
    customer_id BIGINT NOT NULL COMMENT '客户ID',
    total_amount DECIMAL(12,2) DEFAULT 0 COMMENT '订单总金额',
    paid_amount DECIMAL(12,2) DEFAULT 0 COMMENT '已支付金额',
    unpaid_amount DECIMAL(12,2) DEFAULT 0 COMMENT '待支付金额',
    order_status SMALLINT DEFAULT 1 COMMENT '订单状态：1-待付款，2-部分付款，3-已支付，4-进行中，5-已完成，6-已取消',
    payment_status SMALLINT DEFAULT 1 COMMENT '支付状态：1-待支付，2-部分付款，3-已支付',
    assigned_user_id BIGINT COMMENT '负责销售人员ID',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
    completion_date TIMESTAMP COMMENT '完成时间',
    creator_id BIGINT COMMENT '创建人ID',
    status SMALLINT DEFAULT 1 COMMENT '状态：1-正常，0-删除',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 订单商品表
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL COMMENT '订单ID',
    product_name VARCHAR(200) NOT NULL COMMENT '商品名称',
    product_type VARCHAR(50) COMMENT '商品类型',
    price DECIMAL(10,2) NOT NULL COMMENT '商品价格',
    quantity INT DEFAULT 1 COMMENT '购买数量',
    service_period INT COMMENT '服务期(月)',
    service_start_date DATE COMMENT '服务开始日期',
    service_end_date DATE COMMENT '服务结束日期',
    consumption_status SMALLINT DEFAULT 1 COMMENT '消耗状态：1-未开始，2-进行中，3-已完成',
    consumption_progress VARCHAR(50) COMMENT '消耗进度描述',
    remarks TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 支付记录表
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL COMMENT '订单ID',
    payment_no VARCHAR(50) COMMENT '支付流水号',
    payment_amount DECIMAL(10,2) NOT NULL COMMENT '支付金额',
    payment_method VARCHAR(50) COMMENT '支付方式：微信支付、支付宝、银行转账等',
    payment_channel VARCHAR(50) COMMENT '支付渠道',
    payment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '支付时间',
    payment_status SMALLINT DEFAULT 1 COMMENT '支付状态：1-支付成功，2-支付失败，3-退款',
    payment_type SMALLINT COMMENT '支付类型：1-定金，2-尾款，3-全款',
    transaction_id VARCHAR(100) COMMENT '第三方交易ID',
    remarks TEXT COMMENT '支付备注',
    creator_id BIGINT COMMENT '创建人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- ===============================================
-- 3. 营销管理相关表
-- ===============================================

-- 推广活动表
CREATE TABLE campaigns (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL COMMENT '活动名称',
    channel_type VARCHAR(50) COMMENT '渠道类型：SEM搜索、表单推广、海报活动、电话推广',
    channel_name VARCHAR(100) COMMENT '渠道名称',
    campaign_url VARCHAR(500) COMMENT '活动URL',
    qr_code_url VARCHAR(500) COMMENT '二维码URL',
    landing_page_config TEXT COMMENT '落地页配置，JSON格式',
    form_config TEXT COMMENT '表单配置，JSON格式',
    start_date DATE COMMENT '活动开始日期',
    end_date DATE COMMENT '活动结束日期',
    total_budget DECIMAL(12,2) DEFAULT 0 COMMENT '总预算',
    daily_budget DECIMAL(10,2) DEFAULT 0 COMMENT '日预算',
    actual_cost DECIMAL(12,2) DEFAULT 0 COMMENT '实际花费',
    pv_count INT DEFAULT 0 COMMENT '页面访问量',
    uv_count INT DEFAULT 0 COMMENT '独立访客数',
    leads_count INT DEFAULT 0 COMMENT '产生线索数',
    conversion_count INT DEFAULT 0 COMMENT '转化数量',
    conversion_rate DECIMAL(5,2) DEFAULT 0 COMMENT '转化率(%)',
    roi DECIMAL(8,2) DEFAULT 0 COMMENT '投资回报率',
    campaign_status SMALLINT DEFAULT 1 COMMENT '活动状态：1-进行中，2-已暂停，3-已结束',
    creator_id BIGINT COMMENT '创建人ID',
    status SMALLINT DEFAULT 1 COMMENT '状态：1-正常，0-删除',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 活动数据统计表(按日统计)
CREATE TABLE campaign_daily_stats (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL COMMENT '活动ID',
    stat_date DATE NOT NULL COMMENT '统计日期',
    daily_pv INT DEFAULT 0 COMMENT '当日PV',
    daily_uv INT DEFAULT 0 COMMENT '当日UV',
    daily_leads INT DEFAULT 0 COMMENT '当日线索数',
    daily_conversion INT DEFAULT 0 COMMENT '当日转化数',
    daily_cost DECIMAL(10,2) DEFAULT 0 COMMENT '当日花费',
    daily_conversion_rate DECIMAL(5,2) DEFAULT 0 COMMENT '当日转化率',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- ===============================================
-- 4. 跟踪记录相关表
-- ===============================================

-- 跟踪记录表(线索和客户通用)
CREATE TABLE tracking_records (
    id BIGSERIAL PRIMARY KEY,
    target_type SMALLINT NOT NULL COMMENT '目标类型：1-线索，2-客户',
    target_id BIGINT NOT NULL COMMENT '目标ID(线索ID或客户ID)',
    record_type VARCHAR(50) COMMENT '记录类型：首次接触、跟进沟通、成单确认、回访等',
    content TEXT NOT NULL COMMENT '跟踪内容',
    contact_method VARCHAR(50) COMMENT '联系方式：电话、微信、邮件、面谈等',
    next_follow_time TIMESTAMP COMMENT '下次跟进时间',
    intention_level SMALLINT COMMENT '意向度评估：1-高，2-中，3-低',
    creator_id BIGINT COMMENT '创建人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- ===============================================
-- 5. 系统日志相关表
-- ===============================================

-- 操作日志表
CREATE TABLE operation_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT COMMENT '操作用户ID',
    module VARCHAR(50) COMMENT '操作模块',
    operation VARCHAR(100) COMMENT '操作类型',
    target_type VARCHAR(50) COMMENT '操作对象类型',
    target_id BIGINT COMMENT '操作对象ID',
    description TEXT COMMENT '操作描述',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    operation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);

-- 登录日志表
CREATE TABLE login_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT COMMENT '用户ID',
    username VARCHAR(50) COMMENT '登录账号',
    login_type SMALLINT DEFAULT 1 COMMENT '登录类型：1-正常登录，2-退出登录',
    login_status SMALLINT DEFAULT 1 COMMENT '登录状态：1-成功，0-失败',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    error_message TEXT COMMENT '错误信息(登录失败时)',
    session_duration INT COMMENT '会话时长(秒)',
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '登录时间',
    logout_time TIMESTAMP COMMENT '退出时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);

-- ===============================================
-- 6. 文件管理相关表
-- ===============================================

-- 文件表
CREATE TABLE files (
    id BIGSERIAL PRIMARY KEY,
    original_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
    file_name VARCHAR(255) NOT NULL COMMENT '存储文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
    file_size BIGINT COMMENT '文件大小(字节)',
    file_type VARCHAR(50) COMMENT '文件类型',
    mime_type VARCHAR(100) COMMENT 'MIME类型',
    file_hash VARCHAR(64) COMMENT '文件哈希值',
    upload_user_id BIGINT COMMENT '上传用户ID',
    reference_type VARCHAR(50) COMMENT '关联类型：avatar、document等',
    reference_id BIGINT COMMENT '关联对象ID',
    is_public SMALLINT DEFAULT 0 COMMENT '是否公开：1-是，0-否',
    download_count INT DEFAULT 0 COMMENT '下载次数',
    status SMALLINT DEFAULT 1 COMMENT '状态：1-正常，0-删除',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- ===============================================
-- 7. 创建索引
-- ===============================================

-- 用户表索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_department_role ON users(department_id, role_id);
CREATE INDEX idx_users_status ON users(status);

-- 线索表索引
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_assigned_user ON leads(assigned_user_id);
CREATE INDEX idx_leads_source ON leads(source_channel, source_type);
CREATE INDEX idx_leads_status ON leads(follow_status, status);
CREATE INDEX idx_leads_created_at ON leads(created_at);

-- 客户表索引
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_assigned_user ON customers(assigned_user_id);
CREATE INDEX idx_customers_status ON customers(customer_status, status);
CREATE INDEX idx_customers_created_at ON customers(created_at);

-- 订单表索引
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_order_no ON orders(order_no);
CREATE INDEX idx_orders_assigned_user ON orders(assigned_user_id);
CREATE INDEX idx_orders_status ON orders(order_status, payment_status);
CREATE INDEX idx_orders_date ON orders(order_date);

-- 订单商品表索引
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- 支付记录表索引
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_time ON payments(payment_time);
CREATE INDEX idx_payments_status ON payments(payment_status);

-- 推广活动表索引
CREATE INDEX idx_campaigns_channel ON campaigns(channel_type);
CREATE INDEX idx_campaigns_status ON campaigns(campaign_status, status);
CREATE INDEX idx_campaigns_date ON campaigns(start_date, end_date);

-- 活动统计表索引
CREATE INDEX idx_campaign_stats_campaign_date ON campaign_daily_stats(campaign_id, stat_date);

-- 跟踪记录表索引
CREATE INDEX idx_tracking_target ON tracking_records(target_type, target_id);
CREATE INDEX idx_tracking_creator ON tracking_records(creator_id);
CREATE INDEX idx_tracking_created_at ON tracking_records(created_at);

-- 操作日志表索引
CREATE INDEX idx_operation_logs_user ON operation_logs(user_id);
CREATE INDEX idx_operation_logs_time ON operation_logs(operation_time);
CREATE INDEX idx_operation_logs_module ON operation_logs(module);

-- 登录日志表索引
CREATE INDEX idx_login_logs_user ON login_logs(user_id);
CREATE INDEX idx_login_logs_time ON login_logs(login_time);

-- 文件表索引
CREATE INDEX idx_files_upload_user ON files(upload_user_id);
CREATE INDEX idx_files_reference ON files(reference_type, reference_id);
CREATE INDEX idx_files_hash ON files(file_hash);

-- ===============================================
-- 8. 初始化数据
-- ===============================================

-- 插入默认部门
INSERT INTO departments (name, description, parent_id, manager_id, creator_id, status) VALUES
('总部', '公司总部', 0, NULL, 1, 1),
('销售部', '负责产品销售和客户维护', 1, NULL, 1, 1),
('营销部', '负责市场推广和活动策划', 1, NULL, 1, 1),
('技术部', '负责系统开发和维护', 1, NULL, 1, 1);

-- 插入默认角色
INSERT INTO roles (name, description, department_id, permissions, status, creator_id) VALUES
('系统管理员', '拥有所有权限的超级管理员', 1, '{"all": true}', 1, 1),
('销售经理', '销售部门经理，管理销售团队', 2, '{"sales": {"all": true}, "dashboard": {"view": true}}', 1, 1),
('销售员', '普通销售人员，负责线索和客户管理', 2, '{"sales": {"leads": true, "customers": true, "orders": true}, "dashboard": {"view": true}}', 1, 1),
('营销经理', '营销部门经理，管理营销活动', 3, '{"marketing": {"all": true}, "sales": {"view": true}, "dashboard": {"view": true}}', 1, 1),
('营销专员', '营销专员，负责活动执行', 3, '{"marketing": {"campaigns": true}, "dashboard": {"view": true}}', 1, 1);

-- 插入默认管理员用户
INSERT INTO users (username, password, name, phone, department_id, role_id, status, creator_id) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaLyd.r2SMJjS', '系统管理员', '13800138000', 1, 1, 1, 1);
-- 默认密码: admin123

-- ===============================================
-- 备注说明
-- ===============================================
/*
1. 所有表都包含标准字段：id(主键)、created_at(创建时间)、updated_at(更新时间)、status(状态)
2. 使用BIGSERIAL作为主键，确保高并发下的唯一性
3. 时间字段统一使用TIMESTAMP类型
4. 状态字段使用SMALLINT类型，1表示正常/启用，0表示删除/禁用
5. 金额字段使用DECIMAL类型，确保精度
6. 不使用外键约束，应用层维护数据一致性
7. 为高频查询字段创建了合适的索引
8. 权限配置使用JSON格式存储，便于灵活配置
9. 预留了足够的扩展字段，便于后续功能增加
10. 支持数据软删除，重要数据不会真正删除
*/
