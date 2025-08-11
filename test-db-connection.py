#!/usr/bin/env python3
"""
数据库连接测试脚本
测试 Neon PostgreSQL 数据库连接并执行初始化
"""
import psycopg2
import os
from psycopg2.extras import RealDictCursor

# 数据库连接配置
DATABASE_CONFIG = {
    'host': 'ep-plain-moon-aewc6a58-pooler.c-2.us-east-2.aws.neon.tech',
    'port': '5432',
    'database': 'neondb',
    'user': 'neondb_owner',
    'password': 'npg_TCx79eZizfGU',
    'sslmode': 'require'
}

def test_connection():
    """测试数据库连接"""
    try:
        print("正在连接数据库...")
        conn = psycopg2.connect(**DATABASE_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # 测试查询
        cursor.execute("SELECT version(), current_database(), current_user;")
        result = cursor.fetchone()
        
        print("✅ 数据库连接成功!")
        print(f"数据库版本: {result['version']}")
        print(f"当前数据库: {result['current_database']}")
        print(f"当前用户: {result['current_user']}")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ 数据库连接失败: {e}")
        return False

def check_tables():
    """检查表是否存在"""
    try:
        conn = psycopg2.connect(**DATABASE_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # 查询所有表
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        
        print(f"\n📋 当前数据库中的表 ({len(tables)} 个):")
        for table in tables:
            print(f"  - {table['table_name']}")
        
        cursor.close()
        conn.close()
        return tables
        
    except Exception as e:
        print(f"❌ 查询表失败: {e}")
        return []

def init_database():
    """初始化数据库表结构"""
    try:
        # 读取SQL文件
        sql_file = 'backend/database-init.sql'
        if not os.path.exists(sql_file):
            print(f"❌ SQL文件不存在: {sql_file}")
            return False
            
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        print("\n🔧 正在初始化数据库...")
        conn = psycopg2.connect(**DATABASE_CONFIG)
        cursor = conn.cursor()
        
        # 执行SQL脚本
        cursor.execute(sql_content)
        conn.commit()
        
        print("✅ 数据库初始化成功!")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ 数据库初始化失败: {e}")
        return False

def check_initial_data():
    """检查初始数据"""
    try:
        conn = psycopg2.connect(**DATABASE_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # 检查各表的记录数
        tables = ['users', 'roles', 'departments', 'leads', 'customers', 'orders', 'campaigns']
        
        print("\n📊 表数据统计:")
        for table in tables:
            try:
                cursor.execute(f"SELECT COUNT(*) as count FROM {table};")
                result = cursor.fetchone()
                print(f"  {table}: {result['count']} 条记录")
            except:
                print(f"  {table}: 表不存在")
        
        # 显示管理员用户
        cursor.execute("SELECT id, username, name FROM users WHERE role_id = 1;")
        admin_users = cursor.fetchall()
        
        print(f"\n👤 管理员用户 ({len(admin_users)} 个):")
        for user in admin_users:
            print(f"  ID: {user['id']}, 用户名: {user['username']}, 姓名: {user['name']}")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ 检查初始数据失败: {e}")
        return False

def main():
    print("🚀 AI CRM 数据库连接测试")
    print("=" * 50)
    
    # 1. 测试连接
    if not test_connection():
        return
    
    # 2. 检查现有表
    tables = check_tables()
    
    # 3. 如果表少于5个，执行初始化
    if len(tables) < 5:
        if not init_database():
            return
        check_tables()
    
    # 4. 检查初始数据
    check_initial_data()
    
    print("\n✅ 数据库配置验证完成!")

if __name__ == "__main__":
    main()
