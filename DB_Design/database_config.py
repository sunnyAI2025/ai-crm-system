# -*- coding: utf-8 -*-
"""
CRM系统数据库配置文件
根据DateBase.md文档要求创建的数据库连接配置
"""

import os
from urllib.parse import quote_plus

# ===============================================
# 数据库连接信息
# ===============================================

# Neon数据库连接信息
DATABASE_CONFIG = {
    # 基础连接信息
    'host': 'ep-plain-moon-aewc6a58-pooler.c-2.us-east-2.aws.neon.tech',
    'port': 5432,
    'database': 'neondb',
    'username': 'neondb_owner',
    'password': 'npg_TCx79eZizfGU',
    
    # 连接参数
    'sslmode': 'require',
    'channel_binding': 'require',
    
    # 连接池配置
    'pool_size': 20,
    'max_overflow': 30,
    'pool_timeout': 30,
    'pool_recycle': 3600,
    
    # 字符编码
    'charset': 'utf8mb4',
    'collation': 'utf8mb4_unicode_ci'
}

# ===============================================
# 连接字符串生成
# ===============================================

def get_postgresql_url():
    """
    生成PostgreSQL连接URL
    用于SQLAlchemy等ORM工具
    """
    password_encoded = quote_plus(DATABASE_CONFIG['password'])
    
    url = (
        f"postgresql://{DATABASE_CONFIG['username']}:{password_encoded}"
        f"@{DATABASE_CONFIG['host']}:{DATABASE_CONFIG['port']}"
        f"/{DATABASE_CONFIG['database']}"
        f"?sslmode={DATABASE_CONFIG['sslmode']}"
        f"&channel_binding={DATABASE_CONFIG['channel_binding']}"
    )
    
    return url

def get_psql_command():
    """
    生成psql命令行连接字符串
    用于终端直接连接数据库
    """
    return (
        f"psql 'postgresql://{DATABASE_CONFIG['username']}:{DATABASE_CONFIG['password']}"
        f"@{DATABASE_CONFIG['host']}:{DATABASE_CONFIG['port']}"
        f"/{DATABASE_CONFIG['database']}"
        f"?sslmode={DATABASE_CONFIG['sslmode']}"
        f"&channel_binding={DATABASE_CONFIG['channel_binding']}'"
    )

def get_jdbc_url():
    """
    生成JDBC连接URL
    用于Java Spring Boot项目
    """
    return (
        f"jdbc:postgresql://{DATABASE_CONFIG['host']}:{DATABASE_CONFIG['port']}"
        f"/{DATABASE_CONFIG['database']}"
        f"?sslmode={DATABASE_CONFIG['sslmode']}"
        f"&channel_binding={DATABASE_CONFIG['channel_binding']}"
    )

# ===============================================
# Spring Boot配置
# ===============================================

SPRING_BOOT_CONFIG = {
    'datasource': {
        'url': get_jdbc_url(),
        'username': DATABASE_CONFIG['username'],
        'password': DATABASE_CONFIG['password'],
        'driver-class-name': 'org.postgresql.Driver',
        'hikari': {
            'maximum-pool-size': DATABASE_CONFIG['pool_size'],
            'minimum-idle': 5,
            'connection-timeout': 30000,
            'idle-timeout': 600000,
            'max-lifetime': 1800000
        }
    },
    'jpa': {
        'hibernate': {
            'ddl-auto': 'update'
        },
        'show-sql': False,
        'properties': {
            'hibernate': {
                'dialect': 'org.hibernate.dialect.PostgreSQLDialect',
                'format_sql': True,
                'use_sql_comments': True
            }
        }
    }
}

# ===============================================
# 环境变量配置
# ===============================================

# 从环境变量读取配置（生产环境推荐）
def get_env_config():
    """
    从环境变量读取数据库配置
    用于生产环境部署
    """
    return {
        'host': os.getenv('DB_HOST', DATABASE_CONFIG['host']),
        'port': int(os.getenv('DB_PORT', DATABASE_CONFIG['port'])),
        'database': os.getenv('DB_NAME', DATABASE_CONFIG['database']),
        'username': os.getenv('DB_USERNAME', DATABASE_CONFIG['username']),
        'password': os.getenv('DB_PASSWORD', DATABASE_CONFIG['password']),
        'sslmode': os.getenv('DB_SSLMODE', DATABASE_CONFIG['sslmode']),
    }

# ===============================================
# 数据库操作工具函数
# ===============================================

def test_connection():
    """
    测试数据库连接
    """
    try:
        import psycopg2
        
        config = get_env_config()
        
        conn = psycopg2.connect(
            host=config['host'],
            port=config['port'],
            database=config['database'],
            user=config['username'],
            password=config['password'],
            sslmode=config['sslmode']
        )
        
        cursor = conn.cursor()
        cursor.execute('SELECT version();')
        version = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        print(f"数据库连接成功！")
        print(f"PostgreSQL版本: {version[0]}")
        return True
        
    except Exception as e:
        print(f"数据库连接失败: {str(e)}")
        return False

def get_table_info():
    """
    获取数据库表信息
    """
    try:
        import psycopg2
        
        config = get_env_config()
        
        conn = psycopg2.connect(
            host=config['host'],
            port=config['port'],
            database=config['database'],
            user=config['username'],
            password=config['password'],
            sslmode=config['sslmode']
        )
        
        cursor = conn.cursor()
        
        # 查询所有表
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        
        tables = cursor.fetchall()
        
        print("数据库表列表:")
        for table in tables:
            print(f"- {table[0]}")
        
        cursor.close()
        conn.close()
        
        return [table[0] for table in tables]
        
    except Exception as e:
        print(f"获取表信息失败: {str(e)}")
        return []

# ===============================================
# 使用示例
# ===============================================

if __name__ == "__main__":
    print("CRM系统数据库配置")
    print("=" * 50)
    
    print("\n1. PostgreSQL连接URL:")
    print(get_postgresql_url())
    
    print("\n2. PSQL命令:")
    print(get_psql_command())
    
    print("\n3. JDBC连接URL:")
    print(get_jdbc_url())
    
    print("\n4. 测试数据库连接:")
    test_connection()
    
    print("\n5. 查看数据库表:")
    get_table_info()
