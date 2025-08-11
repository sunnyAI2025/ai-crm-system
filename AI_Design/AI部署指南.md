# CRM系统AI功能部署指南

## 概述

本指南详细说明如何部署CRM系统的AI数据分析功能，包括Python机器学习服务、Java AI服务、依赖环境配置和运维监控。

## 架构概述

```
┌─────────────────────────────────────────────────────────────────┐
│                        CRM AI部署架构                            │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React)                                              │
│       ↓ HTTP/WebSocket                                         │
│  API Gateway (50001)                                           │
│       ↓ HTTP                                                   │
│  Java AI Service (50006) ←→ Python ML Service (5001)          │
│       ↓                           ↓                            │
│  PostgreSQL DB              Redis Cache                        │
│       ↓                           ↓                            │
│  External AI APIs          Model Storage (MinIO)               │
└─────────────────────────────────────────────────────────────────┘
```

## 环境要求

### 系统要求
- **操作系统**: Linux (Ubuntu 20.04+) / macOS / Windows 10+
- **内存**: 最低8GB，推荐16GB+
- **CPU**: 最低4核，推荐8核+
- **存储**: 最低50GB可用空间，推荐100GB+
- **网络**: 稳定的互联网连接（访问外部AI APIs）

### 软件依赖

#### Java环境
```bash
# Java 17+
java -version

# Maven 3.9+
mvn -version

# Spring Boot 3.2.x
# (项目依赖中包含)
```

#### Python环境
```bash
# Python 3.9+
python3 --version

# 创建虚拟环境
python3 -m venv ai_env
source ai_env/bin/activate  # Linux/macOS
# ai_env\Scripts\activate   # Windows

# 安装依赖
pip install -r requirements.txt
```

#### 数据库和缓存
```bash
# PostgreSQL 14+
sudo apt update
sudo apt install postgresql postgresql-contrib

# Redis 6+
sudo apt install redis-server

# 启动服务
sudo systemctl start postgresql
sudo systemctl start redis-server
sudo systemctl enable postgresql
sudo systemctl enable redis-server
```

## 安装部署步骤

### 1. 环境准备

#### 1.1 创建项目目录
```bash
mkdir -p /opt/crm-ai
cd /opt/crm-ai

# 创建必要的目录
mkdir -p {logs,models,storage,config}
```

#### 1.2 环境变量配置
```bash
# 创建环境变量文件
cat > /opt/crm-ai/.env << 'EOF'
# 基础配置
PROJECT_ROOT=/opt/crm-ai
NODE_ENV=production

# 数据库配置
DATABASE_URL=postgresql://neondb_owner:npg_TCx79eZizfGU@ep-plain-moon-aewc6a58-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=1

# AI服务配置
OPENAI_API_KEY=your-openai-api-key
TENCENT_SECRET_ID=your-tencent-secret-id
TENCENT_SECRET_KEY=your-tencent-secret-key
BAIDU_API_KEY=your-baidu-api-key
BAIDU_SECRET_KEY=your-baidu-secret-key

# 服务端口
AI_SERVICE_PORT=50006
ML_SERVICE_PORT=5001

# MinIO配置
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=crm-ai-models

# JWT配置
JWT_SECRET=your-jwt-secret-key

# 日志级别
LOG_LEVEL=INFO
EOF

# 设置权限
chmod 600 /opt/crm-ai/.env
```

### 2. Python ML服务部署

#### 2.1 创建Python虚拟环境
```bash
cd /opt/crm-ai
python3 -m venv ml_env
source ml_env/bin/activate
```

#### 2.2 安装Python依赖
```bash
# 创建requirements.txt
cat > requirements.txt << 'EOF'
flask==3.0.0
flask-cors==4.0.0
pandas==2.1.4
numpy==1.25.2
scikit-learn==1.3.2
xgboost==2.0.3
prophet==1.1.5
redis==5.0.1
joblib==1.3.2
requests==2.31.0
python-dotenv==1.0.0
gunicorn==21.2.0
psutil==5.9.6
matplotlib==3.8.2
seaborn==0.13.0
EOF

# 安装依赖
pip install -r requirements.txt
```

#### 2.3 配置ML服务
```bash
# 复制Python ML服务代码
cp python_ml_service.py /opt/crm-ai/
chmod +x /opt/crm-ai/python_ml_service.py

# 创建Gunicorn配置
cat > /opt/crm-ai/gunicorn.conf.py << 'EOF'
import os

# 服务器配置
bind = f"0.0.0.0:{os.getenv('ML_SERVICE_PORT', 5001)}"
workers = 4
worker_class = "sync"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 50

# 日志配置
accesslog = "/opt/crm-ai/logs/ml_access.log"
errorlog = "/opt/crm-ai/logs/ml_error.log"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# 进程配置
preload_app = True
timeout = 60
keepalive = 2

# 安全配置
limit_request_line = 4096
limit_request_fields = 100
limit_request_field_size = 8190
EOF
```

#### 2.4 创建ML服务启动脚本
```bash
cat > /opt/crm-ai/start_ml_service.sh << 'EOF'
#!/bin/bash

# 加载环境变量
source /opt/crm-ai/.env
source /opt/crm-ai/ml_env/bin/activate

# 设置Python路径
export PYTHONPATH="/opt/crm-ai:$PYTHONPATH"

# 创建日志目录
mkdir -p /opt/crm-ai/logs

# 启动Gunicorn
cd /opt/crm-ai
exec gunicorn --config gunicorn.conf.py python_ml_service:app
EOF

chmod +x /opt/crm-ai/start_ml_service.sh
```

### 3. Java AI服务部署

#### 3.1 编译Java项目
```bash
# 假设在开发环境已编译好JAR包
cd /path/to/your/spring-project
mvn clean package -DskipTests

# 复制JAR包到部署目录
cp target/analytics-service-*.jar /opt/crm-ai/analytics-service.jar
```

#### 3.2 配置Java服务
```bash
# 复制配置文件
cp ai-service-config.yml /opt/crm-ai/application.yml

# 创建Java服务启动脚本
cat > /opt/crm-ai/start_ai_service.sh << 'EOF'
#!/bin/bash

# 加载环境变量
source /opt/crm-ai/.env

# JVM配置
JAVA_OPTS="-Xms2g -Xmx4g"
JAVA_OPTS="$JAVA_OPTS -XX:+UseG1GC"
JAVA_OPTS="$JAVA_OPTS -XX:MaxGCPauseMillis=200"
JAVA_OPTS="$JAVA_OPTS -XX:+PrintGCDetails"
JAVA_OPTS="$JAVA_OPTS -Xloggc:/opt/crm-ai/logs/gc.log"

# Spring配置
SPRING_OPTS="--spring.config.location=file:/opt/crm-ai/application.yml"
SPRING_OPTS="$SPRING_OPTS --spring.profiles.active=prod"
SPRING_OPTS="$SPRING_OPTS --logging.file.name=/opt/crm-ai/logs/ai-service.log"

# 启动服务
cd /opt/crm-ai
exec java $JAVA_OPTS -jar analytics-service.jar $SPRING_OPTS
EOF

chmod +x /opt/crm-ai/start_ai_service.sh
```

### 4. 数据库初始化

#### 4.1 运行数据库脚本
```bash
# 复制数据库脚本
cp database_design.sql /opt/crm-ai/
cp database_init.py /opt/crm-ai/
cp database_config.py /opt/crm-ai/

# 安装Python数据库依赖
source /opt/crm-ai/ml_env/bin/activate
pip install psycopg2-binary

# 初始化数据库
cd /opt/crm-ai
python database_init.py init
```

### 5. MinIO对象存储部署

#### 5.1 安装MinIO
```bash
# 下载MinIO
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
sudo mv minio /usr/local/bin/

# 创建数据目录
sudo mkdir -p /opt/minio/data
sudo chown -R $USER:$USER /opt/minio

# 启动MinIO
MINIO_ROOT_USER=minioadmin MINIO_ROOT_PASSWORD=minioadmin \
minio server /opt/minio/data --console-address ":9001" &
```

#### 5.2 创建存储桶
```bash
# 安装MinIO客户端
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc
sudo mv mc /usr/local/bin/

# 配置MinIO客户端
mc alias set local http://localhost:9000 minioadmin minioadmin

# 创建存储桶
mc mb local/crm-ai-models
mc policy set public local/crm-ai-models
```

### 6. 系统服务配置

#### 6.1 创建systemd服务

**Python ML服务**:
```bash
sudo cat > /etc/systemd/system/crm-ml-service.service << 'EOF'
[Unit]
Description=CRM ML Service
After=network.target redis.service

[Service]
Type=exec
User=ubuntu
Group=ubuntu
WorkingDirectory=/opt/crm-ai
ExecStart=/opt/crm-ai/start_ml_service.sh
ExecReload=/bin/kill -HUP $MAINPID
Restart=always
RestartSec=10
Environment=PATH=/opt/crm-ai/ml_env/bin:/usr/local/bin:/usr/bin:/bin
EnvironmentFile=/opt/crm-ai/.env

# 资源限制
LimitNOFILE=65536
MemoryMax=4G

[Install]
WantedBy=multi-user.target
EOF
```

**Java AI服务**:
```bash
sudo cat > /etc/systemd/system/crm-ai-service.service << 'EOF'
[Unit]
Description=CRM AI Service
After=network.target postgresql.service redis.service crm-ml-service.service

[Service]
Type=exec
User=ubuntu
Group=ubuntu
WorkingDirectory=/opt/crm-ai
ExecStart=/opt/crm-ai/start_ai_service.sh
Restart=always
RestartSec=10
Environment=JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
EnvironmentFile=/opt/crm-ai/.env

# 资源限制
LimitNOFILE=65536
MemoryMax=6G

[Install]
WantedBy=multi-user.target
EOF
```

**MinIO服务**:
```bash
sudo cat > /etc/systemd/system/minio.service << 'EOF'
[Unit]
Description=MinIO Object Storage
After=network.target

[Service]
Type=exec
User=ubuntu
Group=ubuntu
WorkingDirectory=/opt/minio
ExecStart=/usr/local/bin/minio server /opt/minio/data --console-address ":9001"
Restart=always
RestartSec=10
Environment=MINIO_ROOT_USER=minioadmin
Environment=MINIO_ROOT_PASSWORD=minioadmin

[Install]
WantedBy=multi-user.target
EOF
```

#### 6.2 启用和启动服务
```bash
# 重新加载systemd配置
sudo systemctl daemon-reload

# 启用服务
sudo systemctl enable minio
sudo systemctl enable crm-ml-service
sudo systemctl enable crm-ai-service

# 启动服务
sudo systemctl start minio
sudo systemctl start crm-ml-service
sudo systemctl start crm-ai-service

# 检查服务状态
sudo systemctl status minio
sudo systemctl status crm-ml-service
sudo systemctl status crm-ai-service
```

### 7. 反向代理配置 (Nginx)

#### 7.1 安装Nginx
```bash
sudo apt update
sudo apt install nginx
```

#### 7.2 配置Nginx
```bash
sudo cat > /etc/nginx/sites-available/crm-ai << 'EOF'
upstream ml_service {
    server 127.0.0.1:5001;
    keepalive 32;
}

upstream ai_service {
    server 127.0.0.1:50006;
    keepalive 32;
}

upstream minio_service {
    server 127.0.0.1:9000;
    keepalive 32;
}

server {
    listen 80;
    server_name your-domain.com;
    
    # 安全配置
    server_tokens off;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # ML服务代理
    location /ml/ {
        proxy_pass http://ml_service/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
        proxy_connect_timeout 10s;
    }
    
    # AI服务代理
    location /api/analytics/ {
        proxy_pass http://ai_service/api/analytics/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
        proxy_connect_timeout 10s;
    }
    
    # MinIO代理
    location /storage/ {
        proxy_pass http://minio_service/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 100M;
    }
    
    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# 启用站点
sudo ln -s /etc/nginx/sites-available/crm-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. 监控配置

#### 8.1 日志轮转配置
```bash
sudo cat > /etc/logrotate.d/crm-ai << 'EOF'
/opt/crm-ai/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 ubuntu ubuntu
    postrotate
        systemctl reload crm-ml-service crm-ai-service
    endscript
}
EOF
```

#### 8.2 健康检查脚本
```bash
cat > /opt/crm-ai/health_check.sh << 'EOF'
#!/bin/bash

# 健康检查脚本
echo "CRM AI服务健康检查 - $(date)"

# 检查ML服务
echo -n "ML服务: "
if curl -s http://localhost:5001/health > /dev/null; then
    echo "✅ 正常"
else
    echo "❌ 异常"
fi

# 检查AI服务
echo -n "AI服务: "
if curl -s http://localhost:50006/actuator/health > /dev/null; then
    echo "✅ 正常"
else
    echo "❌ 异常"
fi

# 检查MinIO
echo -n "MinIO服务: "
if curl -s http://localhost:9000/minio/health/live > /dev/null; then
    echo "✅ 正常"
else
    echo "❌ 异常"
fi

# 检查Redis
echo -n "Redis服务: "
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ 正常"
else
    echo "❌ 异常"
fi

# 检查PostgreSQL
echo -n "PostgreSQL服务: "
if pg_isready > /dev/null 2>&1; then
    echo "✅ 正常"
else
    echo "❌ 异常"
fi

echo "检查完成"
EOF

chmod +x /opt/crm-ai/health_check.sh
```

#### 8.3 性能监控脚本
```bash
cat > /opt/crm-ai/performance_monitor.sh << 'EOF'
#!/bin/bash

# 性能监控脚本
LOG_FILE="/opt/crm-ai/logs/performance.log"

echo "$(date) - 性能监控开始" >> $LOG_FILE

# 系统负载
echo "系统负载: $(uptime)" >> $LOG_FILE

# 内存使用
echo "内存使用:" >> $LOG_FILE
free -h >> $LOG_FILE

# 磁盘使用
echo "磁盘使用:" >> $LOG_FILE
df -h >> $LOG_FILE

# 进程监控
echo "AI服务进程:" >> $LOG_FILE
ps aux | grep -E "(python_ml_service|analytics-service)" | grep -v grep >> $LOG_FILE

# 端口监听
echo "端口监听:" >> $LOG_FILE
netstat -tlnp | grep -E "(5001|50006|9000|6379|5432)" >> $LOG_FILE

echo "$(date) - 性能监控结束" >> $LOG_FILE
echo "---" >> $LOG_FILE
EOF

chmod +x /opt/crm-ai/performance_monitor.sh

# 添加到定时任务
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/crm-ai/performance_monitor.sh") | crontab -
```

## 验证部署

### 1. 服务验证

#### 1.1 检查服务状态
```bash
# 检查所有服务状态
sudo systemctl status minio crm-ml-service crm-ai-service

# 检查端口监听
netstat -tlnp | grep -E "(5001|50006|9000|6379|5432)"
```

#### 1.2 API测试
```bash
# 测试ML服务健康检查
curl http://localhost:5001/health

# 测试AI服务健康检查
curl http://localhost:50006/actuator/health

# 测试MinIO
curl http://localhost:9000/minio/health/live
```

### 2. 功能测试

#### 2.1 运行集成测试
```bash
cd /opt/crm-ai
source ml_env/bin/activate
python ai_integration_test.py
```

#### 2.2 手动API测试
```bash
# 测试销售趋势预测
curl -X POST http://localhost:5001/models/sales_trend/predict \
  -H "Content-Type: application/json" \
  -d '{"future_periods": 3}'

# 测试模型状态
curl http://localhost:5001/models/status
```

## 运维管理

### 1. 日志管理

#### 1.1 日志查看
```bash
# 查看服务日志
sudo journalctl -u crm-ml-service -f
sudo journalctl -u crm-ai-service -f

# 查看应用日志
tail -f /opt/crm-ai/logs/ml_*.log
tail -f /opt/crm-ai/logs/ai-service.log
```

#### 1.2 日志分析
```bash
# 错误日志统计
grep -c "ERROR" /opt/crm-ai/logs/*.log

# 性能分析
grep "Duration" /opt/crm-ai/logs/ai-service.log | tail -20
```

### 2. 性能调优

#### 2.1 JVM调优
```bash
# 编辑启动脚本中的JVM参数
nano /opt/crm-ai/start_ai_service.sh

# 常用调优参数
-Xms4g -Xmx8g                    # 堆内存大小
-XX:+UseG1GC                     # 使用G1垃圾收集器
-XX:MaxGCPauseMillis=200         # GC停顿时间目标
-XX:+UseStringDeduplication      # 字符串去重
```

#### 2.2 Python调优
```bash
# 编辑Gunicorn配置
nano /opt/crm-ai/gunicorn.conf.py

# 调整工作进程数
workers = min(4, (cpu_count() * 2) + 1)
```

### 3. 备份策略

#### 3.1 模型备份
```bash
cat > /opt/crm-ai/backup_models.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/crm-ai/backups/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# 备份模型文件
cp -r /opt/crm-ai/models $BACKUP_DIR/

# 备份到MinIO
mc cp --recursive $BACKUP_DIR/ local/crm-ai-backups/

# 清理30天前的备份
find /opt/crm-ai/backups -type d -mtime +30 -exec rm -rf {} \;

echo "模型备份完成: $BACKUP_DIR"
EOF

chmod +x /opt/crm-ai/backup_models.sh

# 添加到定时任务 (每天凌晨2点)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/crm-ai/backup_models.sh") | crontab -
```

#### 3.2 配置备份
```bash
cat > /opt/crm-ai/backup_config.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/crm-ai/backups/config/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# 备份配置文件
cp /opt/crm-ai/.env $BACKUP_DIR/
cp /opt/crm-ai/application.yml $BACKUP_DIR/
cp /opt/crm-ai/gunicorn.conf.py $BACKUP_DIR/

# 备份systemd服务文件
cp /etc/systemd/system/crm-*.service $BACKUP_DIR/
cp /etc/nginx/sites-available/crm-ai $BACKUP_DIR/

echo "配置备份完成: $BACKUP_DIR"
EOF

chmod +x /opt/crm-ai/backup_config.sh
```

### 4. 故障排查

#### 4.1 常见问题

**服务无法启动**:
```bash
# 检查端口占用
sudo netstat -tlnp | grep -E "(5001|50006)"

# 检查权限
ls -la /opt/crm-ai/
sudo chown -R ubuntu:ubuntu /opt/crm-ai/

# 检查环境变量
cat /opt/crm-ai/.env
```

**内存不足**:
```bash
# 检查内存使用
free -h
ps aux --sort=-%mem | head -10

# 调整JVM堆内存
nano /opt/crm-ai/start_ai_service.sh
```

**API调用失败**:
```bash
# 检查外部API连接
curl -I https://api.openai.com
curl -I https://nlp.tencentcloudapi.com

# 检查API密钥配置
grep -E "(OPENAI|TENCENT|BAIDU)" /opt/crm-ai/.env
```

#### 4.2 重启服务
```bash
# 重启单个服务
sudo systemctl restart crm-ml-service
sudo systemctl restart crm-ai-service

# 重启所有相关服务
sudo systemctl restart minio crm-ml-service crm-ai-service nginx
```

### 5. 扩容策略

#### 5.1 水平扩容
```bash
# 在新服务器上部署额外的AI服务实例
# 修改Nginx负载均衡配置

upstream ai_service {
    server 127.0.0.1:50006;
    server 192.168.1.100:50006;  # 新增服务器
    keepalive 32;
}
```

#### 5.2 垂直扩容
```bash
# 增加服务器资源后调整配置

# Java服务内存
JAVA_OPTS="-Xms4g -Xmx8g"  # 原来2g-4g

# Python工作进程
workers = 8  # 原来4个

# 数据库连接池
maximum-pool-size: 20  # 原来10个
```

## 安全配置

### 1. 网络安全
```bash
# 防火墙配置
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw deny 5001/tcp     # 阻止直接访问ML服务
sudo ufw deny 50006/tcp    # 阻止直接访问AI服务
sudo ufw enable
```

### 2. API密钥管理
```bash
# 使用专用的密钥管理服务
# 避免在配置文件中明文存储API密钥

# 示例: 使用环境变量
export OPENAI_API_KEY=$(vault kv get -field=api_key secret/openai)
```

### 3. 数据加密
```bash
# Redis配置密码
redis-cli CONFIG SET requirepass "your-redis-password"

# 数据库连接加密
# 在连接字符串中添加 sslmode=require
```

## 总结

通过以上部署指南，您可以成功部署CRM系统的AI功能。关键要点：

1. **环境依赖**: 确保Java 17+、Python 3.9+、PostgreSQL、Redis等环境正确安装
2. **服务架构**: Python ML服务提供机器学习能力，Java AI服务提供业务逻辑
3. **监控运维**: 配置完善的日志、监控和备份策略
4. **性能优化**: 根据实际负载调整JVM参数和工作进程数
5. **安全配置**: 网络隔离、API密钥管理、数据加密

部署完成后，AI功能将为CRM系统提供智能预测、个性化推荐、自动报告生成、风险评估和情感分析等能力。
