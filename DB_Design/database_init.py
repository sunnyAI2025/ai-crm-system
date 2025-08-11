#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CRM系统数据库初始化脚本
用于创建数据库表结构和初始化数据
"""

import psycopg2
import sys
import os
from datetime import datetime

# 导入数据库配置
from database_config import get_env_config

def read_sql_file(file_path):
    """
    读取SQL文件内容
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except FileNotFoundError:
        print(f"错误: 找不到SQL文件 {file_path}")
        return None
    except Exception as e:
        print(f"错误: 读取SQL文件失败 - {str(e)}")
        return None

def execute_sql_script(cursor, sql_script):
    """
    执行SQL脚本
    """
    try:
        # 分割SQL语句（以分号为分隔符）
        statements = [stmt.strip() for stmt in sql_script.split(';') if stmt.strip()]
        
        success_count = 0
        error_count = 0
        
        for i, statement in enumerate(statements, 1):
            # 跳过注释行
            if statement.startswith('--') or statement.startswith('/*'):
                continue
                
            try:
                cursor.execute(statement)
                success_count += 1
                print(f"✓ 第{i}条SQL语句执行成功")
            except Exception as e:
                error_count += 1
                print(f"✗ 第{i}条SQL语句执行失败: {str(e)}")
                print(f"  失败的SQL: {statement[:100]}...")
        
        print(f"\nSQL执行完成: 成功{success_count}条, 失败{error_count}条")
        return error_count == 0
        
    except Exception as e:
        print(f"执行SQL脚本时发生错误: {str(e)}")
        return False

def check_table_exists(cursor, table_name):
    """
    检查表是否存在
    """
    try:
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = %s
            );
        """, (table_name,))
        
        return cursor.fetchone()[0]
    except Exception as e:
        print(f"检查表 {table_name} 是否存在时发生错误: {str(e)}")
        return False

def get_table_count(cursor, table_name):
    """
    获取表的记录数
    """
    try:
        cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
        return cursor.fetchone()[0]
    except Exception as e:
        print(f"获取表 {table_name} 记录数时发生错误: {str(e)}")
        return -1

def check_database_structure():
    """
    检查数据库结构
    """
    print("\n" + "="*60)
    print("检查数据库结构")
    print("="*60)
    
    try:
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
        
        # 需要检查的表列表
        required_tables = [
            'departments', 'roles', 'users',
            'leads', 'customers', 'orders', 'order_items', 'payments',
            'campaigns', 'campaign_daily_stats',
            'tracking_records', 'operation_logs', 'login_logs', 'files'
        ]
        
        print(f"检查 {len(required_tables)} 个必需的表...")
        
        existing_tables = []
        missing_tables = []
        
        for table in required_tables:
            if check_table_exists(cursor, table):
                count = get_table_count(cursor, table)
                existing_tables.append(table)
                print(f"✓ {table} (记录数: {count})")
            else:
                missing_tables.append(table)
                print(f"✗ {table} (不存在)")
        
        print(f"\n检查结果:")
        print(f"✓ 已存在的表: {len(existing_tables)}")
        print(f"✗ 缺失的表: {len(missing_tables)}")
        
        if missing_tables:
            print(f"缺失的表: {', '.join(missing_tables)}")
        
        cursor.close()
        conn.close()
        
        return len(missing_tables) == 0
        
    except Exception as e:
        print(f"检查数据库结构时发生错误: {str(e)}")
        return False

def init_database():
    """
    初始化数据库
    """
    print("\n" + "="*60)
    print(f"CRM系统数据库初始化 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    
    # 1. 测试数据库连接
    print("\n1. 测试数据库连接...")
    try:
        config = get_env_config()
        
        conn = psycopg2.connect(
            host=config['host'],
            port=config['port'],
            database=config['database'],
            user=config['username'],
            password=config['password'],
            sslmode=config['sslmode']
        )
        
        print("✓ 数据库连接成功")
        
    except Exception as e:
        print(f"✗ 数据库连接失败: {str(e)}")
        return False
    
    # 2. 读取SQL文件
    print("\n2. 读取数据库设计文件...")
    sql_file_path = "database_design.sql"
    sql_content = read_sql_file(sql_file_path)
    
    if not sql_content:
        print(f"✗ 无法读取SQL文件: {sql_file_path}")
        return False
    
    print(f"✓ 成功读取SQL文件，大小: {len(sql_content)} 字符")
    
    # 3. 执行SQL脚本
    print("\n3. 执行数据库创建脚本...")
    try:
        cursor = conn.cursor()
        
        success = execute_sql_script(cursor, sql_content)
        
        if success:
            conn.commit()
            print("✓ 数据库初始化成功，事务已提交")
        else:
            conn.rollback()
            print("✗ 数据库初始化失败，事务已回滚")
            cursor.close()
            conn.close()
            return False
            
    except Exception as e:
        print(f"✗ 执行SQL脚本时发生错误: {str(e)}")
        conn.rollback()
        cursor.close()
        conn.close()
        return False
    
    # 4. 验证表结构
    print("\n4. 验证表结构...")
    cursor.close()
    conn.close()
    
    structure_ok = check_database_structure()
    
    if structure_ok:
        print("\n✓ 数据库初始化完成！所有表已成功创建。")
        return True
    else:
        print("\n✗ 数据库初始化不完整，请检查错误信息。")
        return False

def reset_database():
    """
    重置数据库（删除所有表后重新创建）
    """
    print("\n" + "="*60)
    print("警告: 即将重置数据库，所有数据将被删除！")
    print("="*60)
    
    confirm = input("\n确认要重置数据库吗？输入 'YES' 确认: ")
    if confirm != 'YES':
        print("操作已取消")
        return False
    
    try:
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
        
        # 获取所有表名
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        
        tables = [table[0] for table in cursor.fetchall()]
        
        print(f"\n找到 {len(tables)} 个表，开始删除...")
        
        # 删除所有表
        for table in tables:
            try:
                cursor.execute(f"DROP TABLE IF EXISTS {table} CASCADE;")
                print(f"✓ 删除表: {table}")
            except Exception as e:
                print(f"✗ 删除表 {table} 失败: {str(e)}")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("\n所有表已删除，开始重新创建...")
        
        # 重新初始化数据库
        return init_database()
        
    except Exception as e:
        print(f"重置数据库时发生错误: {str(e)}")
        return False

def main():
    """
    主函数
    """
    if len(sys.argv) < 2:
        print("用法:")
        print("  python database_init.py init    # 初始化数据库")
        print("  python database_init.py check   # 检查数据库结构")
        print("  python database_init.py reset   # 重置数据库")
        return
    
    command = sys.argv[1].lower()
    
    if command == 'init':
        success = init_database()
        sys.exit(0 if success else 1)
        
    elif command == 'check':
        success = check_database_structure()
        sys.exit(0 if success else 1)
        
    elif command == 'reset':
        success = reset_database()
        sys.exit(0 if success else 1)
        
    else:
        print(f"未知命令: {command}")
        print("支持的命令: init, check, reset")
        sys.exit(1)

if __name__ == "__main__":
    main()
