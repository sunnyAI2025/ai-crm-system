#!/bin/bash

# AI CRM系统一键启动脚本
# 作者: AI CRM开发团队
# 版本: 1.0.0
# 更新时间: 2025-01-11

echo "🚀 启动AI CRM系统..."
echo "================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查Node.js
echo -e "${BLUE}检查Node.js环境...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js未安装，请先安装Node.js 18+${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js版本过低，需要18+，当前版本: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js版本: $(node -v)${NC}"

# 检查Java
echo -e "${BLUE}检查Java环境...${NC}"
if ! command -v java &> /dev/null; then
    echo -e "${YELLOW}⚠️  Java未安装，后端服务将无法启动${NC}"
else
    JAVA_VERSION=$(java -version 2>&1 | head -n1 | cut -d'"' -f2 | cut -d'.' -f1)
    echo -e "${GREEN}✅ Java版本: $(java -version 2>&1 | head -n1)${NC}"
fi

# 检查Maven
echo -e "${BLUE}检查Maven环境...${NC}"
if ! command -v mvn &> /dev/null; then
    echo -e "${YELLOW}⚠️  Maven未安装，后端服务将无法启动${NC}"
else
    echo -e "${GREEN}✅ Maven版本: $(mvn -v | head -n1)${NC}"
fi

echo "================================"

# 创建日志目录
mkdir -p logs

# 启动前端服务
echo -e "${BLUE}📦 启动前端开发服务器...${NC}"
cd frontend

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📥 安装前端依赖...${NC}"
    npm install
fi

# 启动前端服务
echo -e "${GREEN}🌐 前端服务启动中...${NC}"
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../logs/frontend.pid

# 等待前端服务启动
sleep 5

# 检查前端服务是否启动成功
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ 前端服务启动成功: http://localhost:3000${NC}"
else
    echo -e "${YELLOW}⚠️  前端服务启动中，请稍等...${NC}"
fi

cd ..

# 启动后端服务（如果环境可用）
if command -v java &> /dev/null && command -v mvn &> /dev/null; then
    echo -e "${BLUE}🔧 启动后端认证服务...${NC}"
    cd backend/auth-service
    
    # 使用本地H2数据库配置启动
    echo -e "${GREEN}🔐 认证服务启动中...${NC}"
    mvn spring-boot:run -Dspring-boot.run.profiles=local > ../../logs/auth-service.log 2>&1 &
    AUTH_PID=$!
    echo $AUTH_PID > ../../logs/auth-service.pid
    
    cd ../..
    
    # 等待认证服务启动
    sleep 10
    
    # 检查认证服务
    if curl -s http://localhost:50002/health > /dev/null; then
        echo -e "${GREEN}✅ 认证服务启动成功: http://localhost:50002${NC}"
    else
        echo -e "${YELLOW}⚠️  认证服务启动中，使用Mock数据模式${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  后端环境不可用，使用前端Mock数据模式${NC}"
fi

echo "================================"
echo -e "${GREEN}🎉 AI CRM系统启动完成！${NC}"
echo ""
echo -e "${BLUE}📋 访问信息:${NC}"
echo -e "  🌐 前端应用: ${GREEN}http://localhost:3000${NC}"
echo -e "  🔐 测试账号: ${YELLOW}admin / admin123${NC}"
echo ""

if command -v java &> /dev/null && command -v mvn &> /dev/null; then
    echo -e "  🔧 认证服务: ${GREEN}http://localhost:50002${NC}"
    echo -e "  💾 H2数据库: ${GREEN}http://localhost:50002/h2-console${NC}"
    echo "     用户名: sa"
    echo "     密码: password"
    echo "     JDBC URL: jdbc:h2:mem:testdb"
    echo ""
fi

echo -e "${BLUE}📚 功能模块:${NC}"
echo "  📊 仪表盘 - 数据统计概览"
echo "  🎯 线索管理 - 销售线索跟踪"
echo "  👥 客户管理 - 客户信息维护"
echo "  📋 订单管理 - 订单流程管理"
echo "  🚀 营销活动 - 推广活动管理"
echo "  ⚙️  系统管理 - 用户角色权限"
echo "  🤖 AI助手 - 智能数据分析"
echo ""

echo -e "${BLUE}🔧 管理命令:${NC}"
echo "  停止服务: ./stop-all.sh"
echo "  查看日志: tail -f logs/*.log"
echo "  重启服务: ./restart-all.sh"
echo ""

echo -e "${YELLOW}💡 提示: 右下角AI机器人图标可以进行智能数据分析对话${NC}"
echo "================================"

# 保持脚本运行，监控服务状态
echo -e "${BLUE}🔍 服务监控中... (按Ctrl+C退出)${NC}"

# 监控函数
monitor_services() {
    while true; do
        sleep 30
        
        # 检查前端服务
        if ! curl -s http://localhost:3000 > /dev/null; then
            echo -e "${RED}❌ 前端服务异常${NC}"
        fi
        
        # 检查后端服务（如果启动了）
        if [ -f "logs/auth-service.pid" ]; then
            if ! curl -s http://localhost:50002/health > /dev/null; then
                echo -e "${RED}❌ 认证服务异常${NC}"
            fi
        fi
    done
}

# 清理函数
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 正在停止服务...${NC}"
    
    if [ -f "logs/frontend.pid" ]; then
        kill $(cat logs/frontend.pid) 2>/dev/null
        rm logs/frontend.pid
        echo -e "${GREEN}✅ 前端服务已停止${NC}"
    fi
    
    if [ -f "logs/auth-service.pid" ]; then
        kill $(cat logs/auth-service.pid) 2>/dev/null
        rm logs/auth-service.pid
        echo -e "${GREEN}✅ 认证服务已停止${NC}"
    fi
    
    echo -e "${GREEN}🏁 所有服务已停止${NC}"
    exit 0
}

# 设置信号处理
trap cleanup SIGINT SIGTERM

# 开始监控
monitor_services
