#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CRM系统数据库创建和数据生成脚本
创建时间: 2025-08-11
"""

import psycopg2
import random
import hashlib
from datetime import datetime, timedelta, date
from decimal import Decimal
import json

# 数据库连接配置
DATABASE_CONFIG = {
    'host': 'ep-plain-moon-aewc6a58-pooler.c-2.us-east-2.aws.neon.tech',
    'port': 5432,
    'database': 'neondb',
    'user': 'neondb_owner',
    'password': 'npg_TCx79eZizfGU',
    'sslmode': 'require'
}

# PostgreSQL兼容的建表SQL（移除COMMENT语法）
CREATE_TABLES_SQL = """
-- 部门表
CREATE TABLE IF NOT EXISTS departments (
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

-- 角色表
CREATE TABLE IF NOT EXISTS roles (
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

-- 用户表
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
    last_login_time TIMESTAMP,
    login_count INT DEFAULT 0,
    online_hours INT DEFAULT 0,
    status SMALLINT DEFAULT 1,
    creator_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 线索表
CREATE TABLE IF NOT EXISTS leads (
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

-- 客户表
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
    total_order_amount DECIMAL(12,2) DEFAULT 0,
    order_count INT DEFAULT 0,
    creator_id BIGINT,
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
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

-- 订单商品表
CREATE TABLE IF NOT EXISTS order_items (
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

-- 支付记录表
CREATE TABLE IF NOT EXISTS payments (
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

-- 推广活动表
CREATE TABLE IF NOT EXISTS campaigns (
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

-- 活动数据统计表
CREATE TABLE IF NOT EXISTS campaign_daily_stats (
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

-- 跟踪记录表
CREATE TABLE IF NOT EXISTS tracking_records (
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

-- 操作日志表
CREATE TABLE IF NOT EXISTS operation_logs (
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

-- 登录日志表
CREATE TABLE IF NOT EXISTS login_logs (
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

-- 文件表
CREATE TABLE IF NOT EXISTS files (
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
"""

def connect_database():
    """连接数据库"""
    try:
        conn = psycopg2.connect(**DATABASE_CONFIG)
        print("✅ 数据库连接成功")
        return conn
    except Exception as e:
        print(f"❌ 数据库连接失败: {e}")
        return None

def create_tables(conn):
    """创建表结构"""
    try:
        cursor = conn.cursor()
        cursor.execute(CREATE_TABLES_SQL)
        conn.commit()
        print("✅ 数据库表结构创建成功")
        return True
    except Exception as e:
        print(f"❌ 创建表结构失败: {e}")
        conn.rollback()
        return False

def create_indexes(conn):
    """创建索引"""
    indexes_sql = """
    -- 用户表索引
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    CREATE INDEX IF NOT EXISTS idx_users_department_role ON users(department_id, role_id);
    CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

    -- 线索表索引
    CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
    CREATE INDEX IF NOT EXISTS idx_leads_assigned_user ON leads(assigned_user_id);
    CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source_channel, source_type);
    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(follow_status, status);
    CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

    -- 客户表索引
    CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
    CREATE INDEX IF NOT EXISTS idx_customers_assigned_user ON customers(assigned_user_id);
    CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(customer_status, status);
    CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

    -- 订单表索引
    CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no);
    CREATE INDEX IF NOT EXISTS idx_orders_assigned_user ON orders(assigned_user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status, payment_status);
    CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);
    """
    
    try:
        cursor = conn.cursor()
        cursor.execute(indexes_sql)
        conn.commit()
        print("✅ 数据库索引创建成功")
        return True
    except Exception as e:
        print(f"❌ 创建索引失败: {e}")
        conn.rollback()
        return False

def generate_phone():
    """生成随机手机号"""
    return f"1{random.choice([3,4,5,6,7,8,9])}{random.randint(10000000, 99999999)}"

def generate_email(name):
    """生成邮箱"""
    domains = ['gmail.com', 'qq.com', '163.com', 'sina.com', 'hotmail.com']
    return f"{name.lower()}{random.randint(100, 999)}@{random.choice(domains)}"

def generate_test_data(conn):
    """生成测试数据"""
    cursor = conn.cursor()
    
    print("开始生成测试数据...")
    
    # 1. 部门数据
    print("1. 生成部门数据...")
    departments_data = [
        ("总部", "公司总部", 0, None, 1, 1),
        ("销售部", "负责产品销售和客户维护", 1, None, 1, 1),
        ("营销部", "负责市场推广和活动策划", 1, None, 1, 1),
        ("技术部", "负责系统开发和维护", 1, None, 1, 1),
        ("财务部", "负责财务管理和核算", 1, None, 1, 1),
        ("人事部", "负责人力资源管理", 1, None, 1, 1),
        ("客服部", "负责客户服务支持", 1, None, 1, 1),
        ("产品部", "负责产品规划和设计", 1, None, 1, 1),
        ("运营部", "负责产品运营和推广", 1, None, 1, 1),
        ("法务部", "负责法律事务处理", 1, None, 1, 1),
    ]
    
    # 生成更多部门数据到60条
    for i in range(len(departments_data), 60):
        dept_names = ["研发中心", "设计中心", "数据中心", "质量中心", "采购中心", "物流中心"]
        name = f"{random.choice(dept_names)}{i-9}"
        departments_data.append((
            name, f"{name}负责相关业务", 
            random.choice([1, 2, 3, 4]), None, 1, 1
        ))
    
    cursor.executemany("""
        INSERT INTO departments (name, description, parent_id, manager_id, creator_id, status)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT DO NOTHING
    """, departments_data)

    # 2. 角色数据
    print("2. 生成角色数据...")
    roles_data = [
        ("系统管理员", "拥有所有权限的超级管理员", 1, '{"all": true}', 1, 1),
        ("销售经理", "销售部门经理，管理销售团队", 2, '{"sales": {"all": true}}', 1, 1),
        ("销售员", "普通销售人员，负责线索和客户管理", 2, '{"sales": {"leads": true}}', 1, 1),
        ("营销经理", "营销部门经理，管理营销活动", 3, '{"marketing": {"all": true}}', 1, 1),
        ("营销专员", "营销专员，负责活动执行", 3, '{"marketing": {"campaigns": true}}', 1, 1),
    ]
    
    # 生成更多角色数据到60条
    role_names = ["主管", "专员", "助理", "经理", "总监", "顾问"]
    dept_names = ["销售", "营销", "技术", "财务", "人事", "客服", "产品", "运营"]
    for i in range(len(roles_data), 60):
        role = f"{random.choice(dept_names)}{random.choice(role_names)}"
        roles_data.append((
            role, f"{role}岗位职责", 
            random.randint(1, 10), '{"basic": true}', 1, 1
        ))
    
    cursor.executemany("""
        INSERT INTO roles (name, description, department_id, permissions, status, creator_id)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT DO NOTHING
    """, roles_data)

    # 3. 用户数据
    print("3. 生成用户数据...")
    # 先插入管理员用户
    admin_data = [("admin", "$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaLyd.r2SMJjS", 
                   "系统管理员", "13800138000", None, 1, 1, None, 0, 0, 1, None)]
    
    cursor.executemany("""
        INSERT INTO users (username, password, name, phone, avatar, department_id, role_id, 
                          last_login_time, login_count, online_hours, status, creator_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (username) DO NOTHING
    """, admin_data)
    
    # 生成更多用户数据
    users_data = []
    surnames = ["张", "李", "王", "刘", "陈", "杨", "赵", "黄", "周", "吴", "徐", "孙", "胡", "朱", "高", "林", "何", "郭", "马", "罗"]
    given_names = ["伟", "芳", "娜", "秀英", "敏", "静", "丽", "强", "磊", "军", "洋", "勇", "艳", "杰", "娟", "涛", "明", "超", "秀兰", "霞"]
    
    for i in range(59):  # 59个用户加上管理员共60个
        name = f"{random.choice(surnames)}{random.choice(given_names)}"
        username = f"user{i+1:03d}"
        password = "$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaLyd.r2SMJjS"  # admin123
        phone = generate_phone()
        
        users_data.append((
            username, password, name, phone, None,
            random.randint(1, 10), random.randint(1, 5),
            datetime.now() - timedelta(days=random.randint(0, 30)),
            random.randint(1, 100), random.randint(10, 200), 1, 1
        ))
    
    cursor.executemany("""
        INSERT INTO users (username, password, name, phone, avatar, department_id, role_id,
                          last_login_time, login_count, online_hours, status, creator_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (username) DO NOTHING
    """, users_data)

    # 4. 线索数据
    print("4. 生成线索数据...")
    leads_data = []
    sources = ["网站咨询", "电话营销", "微信推广", "百度竞价", "抖音广告", "朋友推荐", "展会获取", "老客介绍"]
    statuses = ["待跟进", "已联系", "有意向", "无意向", "已转化"]
    business_types = ["工商注册", "代理记账", "税务筹划", "法律咨询", "知识产权", "人力资源"]
    
    for i in range(60):
        name = f"{random.choice(surnames)}{random.choice(given_names)}"
        leads_data.append((
            name, generate_phone(), generate_email(name),
            random.choice(sources), random.choice(statuses),
            f"销售{random.randint(1, 10)}", f"这是{name}的跟进备注信息",
            random.choice(business_types), random.choice(sources),
            random.choice([0, 1]), random.randint(1, 10),
            random.randint(1, 60), None,
            random.randint(1, 3), random.randint(1, 4),
            random.choice([0, 1]), None, None, random.randint(1, 10), 1
        ))
    
    cursor.executemany("""
        INSERT INTO leads (name, phone, email, source, status, assigned_to, notes,
                          business_type, source_channel, source_type, campaign_id, assigned_user_id,
                          assigned_time, intention_level, follow_status, is_converted, 
                          converted_time, converted_customer_id, creator_id, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, leads_data)

    # 5. 客户数据
    print("5. 生成客户数据...")
    customers_data = []
    customer_levels = [1, 2, 3, 4, 5]
    customer_statuses = [1, 2, 3, 4]  # 1-潜在，2-跟进中，3-已成单，4-流失
    
    for i in range(60):
        name = f"{random.choice(surnames)}{random.choice(given_names)}"
        total_amount = Decimal(str(random.uniform(1000, 50000))).quantize(Decimal('0.01'))
        customers_data.append((
            name, generate_phone(), random.choice(business_types),
            random.choice(sources), random.randint(1, 60),
            random.randint(1, 60), random.choice(customer_levels),
            random.choice(customer_statuses), 
            datetime.now() + timedelta(days=random.randint(1, 30)),
            total_amount, random.randint(0, 10), random.randint(1, 10), 1
        ))
    
    cursor.executemany("""
        INSERT INTO customers (name, phone, business_type, source_channel, source_lead_id,
                              assigned_user_id, customer_level, customer_status, next_visit_time,
                              total_order_amount, order_count, creator_id, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, customers_data)

    # 6. 订单数据
    print("6. 生成订单数据...")
    orders_data = []
    order_statuses = [1, 2, 3, 4, 5, 6]  # 1-待付款，2-部分付款，3-已支付，4-进行中，5-已完成，6-已取消
    payment_statuses = [1, 2, 3]  # 1-待支付，2-部分付款，3-已支付
    
    for i in range(60):
        order_no = f"ORD{datetime.now().strftime('%Y%m%d')}{i+1:04d}"
        total_amount = Decimal(str(random.uniform(1000, 20000))).quantize(Decimal('0.01'))
        paid_amount = Decimal(str(random.uniform(0, float(total_amount)))).quantize(Decimal('0.01'))
        unpaid_amount = total_amount - paid_amount
        
        orders_data.append((
            order_no, random.randint(1, 60), total_amount, paid_amount, unpaid_amount,
            random.choice(order_statuses), random.choice(payment_statuses),
            random.randint(1, 60), datetime.now() - timedelta(days=random.randint(0, 90)),
            None if random.choice([True, False]) else datetime.now() - timedelta(days=random.randint(0, 30)),
            random.randint(1, 10), 1
        ))
    
    cursor.executemany("""
        INSERT INTO orders (order_no, customer_id, total_amount, paid_amount, unpaid_amount,
                           order_status, payment_status, assigned_user_id, order_date,
                           completion_date, creator_id, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, orders_data)

    # 7. 订单商品数据
    print("7. 生成订单商品数据...")
    order_items_data = []
    products = ["工商注册服务", "代理记账服务", "税务筹划服务", "法律咨询服务", "知识产权服务", "人力资源服务"]
    product_types = ["基础版", "标准版", "专业版", "企业版"]
    
    for i in range(60):
        order_items_data.append((
            random.randint(1, 60), random.choice(products), random.choice(product_types),
            Decimal(str(random.uniform(500, 5000))).quantize(Decimal('0.01')),
            random.randint(1, 5), random.randint(1, 12),
            date.today(), date.today() + timedelta(days=random.randint(30, 365)),
            random.randint(1, 3), f"{random.randint(10, 90)}%", "服务进行中"
        ))
    
    cursor.executemany("""
        INSERT INTO order_items (order_id, product_name, product_type, price, quantity,
                                service_period, service_start_date, service_end_date,
                                consumption_status, consumption_progress, remarks)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, order_items_data)

    # 8. 支付记录数据
    print("8. 生成支付记录数据...")
    payments_data = []
    payment_methods = ["微信支付", "支付宝", "银行转账", "现金", "刷卡"]
    payment_channels = ["线上", "线下", "银行"]
    payment_types = [1, 2, 3]  # 1-定金，2-尾款，3-全款
    
    for i in range(60):
        payment_no = f"PAY{datetime.now().strftime('%Y%m%d')}{i+1:04d}"
        payments_data.append((
            random.randint(1, 60), payment_no,
            Decimal(str(random.uniform(100, 10000))).quantize(Decimal('0.01')),
            random.choice(payment_methods), random.choice(payment_channels),
            datetime.now() - timedelta(days=random.randint(0, 60)),
            1, random.choice(payment_types), 
            f"TXN{random.randint(100000, 999999)}", "支付成功", random.randint(1, 10)
        ))
    
    cursor.executemany("""
        INSERT INTO payments (order_id, payment_no, payment_amount, payment_method,
                             payment_channel, payment_time, payment_status, payment_type,
                             transaction_id, remarks, creator_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, payments_data)

    # 9. 推广活动数据
    print("9. 生成推广活动数据...")
    campaigns_data = []
    channel_types = ["SEM搜索", "表单推广", "海报活动", "电话推广", "微信推广", "抖音推广"]
    campaign_statuses = [1, 2, 3]  # 1-进行中，2-已暂停，3-已结束
    
    for i in range(60):
        total_budget = Decimal(str(random.uniform(5000, 50000))).quantize(Decimal('0.01'))
        actual_cost = Decimal(str(random.uniform(1000, float(total_budget)))).quantize(Decimal('0.01'))
        pv_count = random.randint(1000, 10000)
        uv_count = random.randint(500, pv_count)
        leads_count = random.randint(10, 200)
        conversion_count = random.randint(1, leads_count)
        
        campaigns_data.append((
            f"推广活动{i+1}", random.choice(channel_types), f"渠道{i+1}",
            f"https://campaign{i+1}.example.com", f"https://qr{i+1}.example.com",
            '{"theme": "default"}', '{"fields": ["name", "phone"]}',
            date.today() - timedelta(days=random.randint(0, 60)),
            date.today() + timedelta(days=random.randint(1, 90)),
            total_budget, Decimal(str(random.uniform(100, 1000))).quantize(Decimal('0.01')),
            actual_cost, pv_count, uv_count, leads_count, conversion_count,
            Decimal(str(conversion_count/leads_count*100)).quantize(Decimal('0.01')),
            Decimal(str(random.uniform(1.5, 5.0))).quantize(Decimal('0.01')),
            random.choice(campaign_statuses), random.randint(1, 10), 1
        ))
    
    cursor.executemany("""
        INSERT INTO campaigns (name, channel_type, channel_name, campaign_url, qr_code_url,
                              landing_page_config, form_config, start_date, end_date,
                              total_budget, daily_budget, actual_cost, pv_count, uv_count,
                              leads_count, conversion_count, conversion_rate, roi,
                              campaign_status, creator_id, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, campaigns_data)

    # 10. 活动统计数据
    print("10. 生成活动统计数据...")
    stats_data = []
    for i in range(60):
        stats_data.append((
            random.randint(1, 60), date.today() - timedelta(days=random.randint(0, 30)),
            random.randint(100, 1000), random.randint(50, 500),
            random.randint(5, 50), random.randint(1, 10),
            Decimal(str(random.uniform(50, 500))).quantize(Decimal('0.01')),
            Decimal(str(random.uniform(5, 25))).quantize(Decimal('0.01'))
        ))
    
    cursor.executemany("""
        INSERT INTO campaign_daily_stats (campaign_id, stat_date, daily_pv, daily_uv,
                                         daily_leads, daily_conversion, daily_cost, daily_conversion_rate)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, stats_data)

    # 11. 跟踪记录数据
    print("11. 生成跟踪记录数据...")
    tracking_data = []
    record_types = ["首次接触", "跟进沟通", "需求确认", "方案介绍", "价格谈判", "成单确认", "回访"]
    contact_methods = ["电话", "微信", "邮件", "面谈", "视频会议"]
    
    for i in range(60):
        tracking_data.append((
            random.choice([1, 2]), random.randint(1, 60), random.choice(record_types),
            f"这是第{i+1}条跟进记录的详细内容", random.choice(contact_methods),
            datetime.now() + timedelta(days=random.randint(1, 30)),
            random.randint(1, 3), random.randint(1, 10)
        ))
    
    cursor.executemany("""
        INSERT INTO tracking_records (target_type, target_id, record_type, content,
                                     contact_method, next_follow_time, intention_level, creator_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, tracking_data)

    # 12. 操作日志数据
    print("12. 生成操作日志数据...")
    log_data = []
    modules = ["用户管理", "线索管理", "客户管理", "订单管理", "营销管理", "系统设置"]
    operations = ["创建", "更新", "删除", "查看", "导出", "导入"]
    target_types = ["user", "lead", "customer", "order", "campaign"]
    
    for i in range(60):
        log_data.append((
            random.randint(1, 60), random.choice(modules), random.choice(operations),
            random.choice(target_types), random.randint(1, 100),
            f"用户执行了{random.choice(operations)}操作",
            f"192.168.1.{random.randint(1, 254)}", "Mozilla/5.0 Chrome Browser",
            datetime.now() - timedelta(days=random.randint(0, 30))
        ))
    
    cursor.executemany("""
        INSERT INTO operation_logs (user_id, module, operation, target_type, target_id,
                                   description, ip_address, user_agent, operation_time)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, log_data)

    # 13. 登录日志数据
    print("13. 生成登录日志数据...")
    login_data = []
    for i in range(60):
        login_time = datetime.now() - timedelta(days=random.randint(0, 30))
        logout_time = login_time + timedelta(hours=random.randint(1, 8))
        session_duration = int((logout_time - login_time).total_seconds())
        
        login_data.append((
            random.randint(1, 60), f"user{random.randint(1, 60):03d}",
            1, 1, f"192.168.1.{random.randint(1, 254)}",
            "Mozilla/5.0 Chrome Browser", None, session_duration,
            login_time, logout_time
        ))
    
    cursor.executemany("""
        INSERT INTO login_logs (user_id, username, login_type, login_status, ip_address,
                               user_agent, error_message, session_duration, login_time, logout_time)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, login_data)

    # 14. 文件数据
    print("14. 生成文件数据...")
    file_data = []
    file_types = ["jpg", "png", "pdf", "doc", "xls", "txt"]
    mime_types = ["image/jpeg", "image/png", "application/pdf", "application/msword", 
                  "application/excel", "text/plain"]
    reference_types = ["avatar", "document", "attachment", "image"]
    
    for i in range(60):
        original_name = f"file_{i+1}.{random.choice(file_types)}"
        file_name = f"{hashlib.md5(original_name.encode()).hexdigest()}.{random.choice(file_types)}"
        
        file_data.append((
            original_name, file_name, f"/uploads/{file_name}",
            random.randint(1024, 10485760), random.choice(file_types),
            random.choice(mime_types), hashlib.md5(file_name.encode()).hexdigest(),
            random.randint(1, 60), random.choice(reference_types),
            random.randint(1, 100), random.choice([0, 1]),
            random.randint(0, 100), 1
        ))
    
    cursor.executemany("""
        INSERT INTO files (original_name, file_name, file_path, file_size, file_type,
                          mime_type, file_hash, upload_user_id, reference_type, reference_id,
                          is_public, download_count, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, file_data)

    conn.commit()
    print("✅ 测试数据生成完成！")

def main():
    """主函数"""
    print("🚀 开始创建CRM数据库和生成测试数据...")
    
    # 连接数据库
    conn = connect_database()
    if not conn:
        return
    
    try:
        # 创建表结构
        if create_tables(conn):
            print("✅ 表结构创建成功")
        else:
            print("❌ 表结构创建失败")
            return
        
        # 创建索引
        if create_indexes(conn):
            print("✅ 索引创建成功")
        else:
            print("❌ 索引创建失败")
            return
        
        # 生成测试数据
        generate_test_data(conn)
        
        print("\n🎉 数据库初始化完成！")
        print("📊 每张表已生成60条测试数据")
        print("🔑 管理员账号: admin / admin123")
        
    except Exception as e:
        print(f"❌ 执行过程中出现错误: {e}")
        conn.rollback()
    finally:
        conn.close()
        print("📝 数据库连接已关闭")

if __name__ == "__main__":
    main()
