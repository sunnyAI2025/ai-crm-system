#!/bin/bash

# AI CRM系统停止脚本
# 作者: AI CRM开发团队
# 版本: 1.0.0

echo "🛑 停止AI CRM系统..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 停止前端服务
if [ -f "logs/frontend.pid" ]; then
    echo -e "${BLUE}停止前端服务...${NC}"
    kill $(cat logs/frontend.pid) 2>/dev/null
    rm logs/frontend.pid
    echo -e "${GREEN}✅ 前端服务已停止${NC}"
else
    echo -e "${YELLOW}⚠️  前端服务PID文件不存在${NC}"
    # 尝试根据端口杀死进程
    PID=$(lsof -t -i:3000 2>/dev/null)
    if [ ! -z "$PID" ]; then
        kill $PID 2>/dev/null
        echo -e "${GREEN}✅ 前端服务已强制停止${NC}"
    fi
fi

# 停止认证服务
if [ -f "logs/auth-service.pid" ]; then
    echo -e "${BLUE}停止认证服务...${NC}"
    kill $(cat logs/auth-service.pid) 2>/dev/null
    rm logs/auth-service.pid
    echo -e "${GREEN}✅ 认证服务已停止${NC}"
else
    echo -e "${YELLOW}⚠️  认证服务PID文件不存在${NC}"
    # 尝试根据端口杀死进程
    PID=$(lsof -t -i:50002 2>/dev/null)
    if [ ! -z "$PID" ]; then
        kill $PID 2>/dev/null
        echo -e "${GREEN}✅ 认证服务已强制停止${NC}"
    fi
fi

# 停止所有相关的Node.js和Java进程
echo -e "${BLUE}清理残留进程...${NC}"

# 停止Node.js开发服务器
pkill -f "vite.*--port 3000" 2>/dev/null
pkill -f "npm run dev" 2>/dev/null

# 停止Spring Boot应用
pkill -f "spring-boot:run" 2>/dev/null
pkill -f "auth-service" 2>/dev/null

echo -e "${GREEN}🏁 AI CRM系统已完全停止${NC}"
echo ""
echo -e "${BLUE}📋 已停止的服务:${NC}"
echo "  🌐 前端开发服务器 (端口 3000)"
echo "  🔐 认证服务 (端口 50002)"
echo ""
echo -e "${YELLOW}💡 如需重新启动，请运行: ./start-all.sh${NC}"
