#!/bin/bash
# AI CRM 系统启动脚本

echo "🚀 AI CRM 系统启动脚本"
echo "======================="

# 设置环境变量
export DATABASE_URL="jdbc:postgresql://ep-plain-moon-aewc6a58-pooler.c-2.us-east-2.aws.neon.tech:5432/neondb"
export DATABASE_USERNAME="neondb_owner"
export DATABASE_PASSWORD="npg_TCx79eZizfGU"
export JWT_SECRET="ai-crm-jwt-secret-key-2024"

# 1. 启动前端服务 (端口 3000)
echo "📱 启动前端服务..."
cd frontend
nohup npm run dev > ../logs/frontend.log 2>&1 &
echo "前端服务启动完成 (端口 3000)"

# 2. 启动API网关 (端口 50001)
echo "🌐 启动API网关..."
cd ../backend
mvn clean compile -q
cd gateway-service
nohup mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dserver.port=50001" > ../../logs/gateway.log 2>&1 &
echo "API网关启动完成 (端口 50001)"

# 3. 启动认证服务 (端口 50002)
echo "🔐 启动认证服务..."
cd ../auth-service
nohup mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dserver.port=50002" > ../../logs/auth.log 2>&1 &
echo "认证服务启动完成 (端口 50002)"

# 4. 启动销售管理服务 (端口 50003)
echo "💼 启动销售管理服务..."
cd ../sales-service
nohup mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dserver.port=50003" > ../../logs/sales.log 2>&1 &
echo "销售管理服务启动完成 (端口 50003)"

echo ""
echo "✅ 所有服务启动命令已执行"
echo "📊 服务列表:"
echo "  - 前端服务:     http://localhost:3000"
echo "  - API网关:      http://localhost:50001"
echo "  - 认证服务:     http://localhost:50002"
echo "  - 销售管理服务: http://localhost:50003"
echo ""
echo "📋 查看服务状态:"
echo "  ps aux | grep -E '(npm|mvn).*run'"
echo ""
echo "📝 查看日志:"
echo "  tail -f logs/frontend.log"
echo "  tail -f logs/gateway.log"
echo "  tail -f logs/auth.log"
echo "  tail -f logs/sales.log"
echo ""
echo "🛑 停止所有服务:"
echo "  pkill -f 'npm.*run.*dev'"
echo "  pkill -f 'mvn.*spring-boot:run'"
