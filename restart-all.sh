#!/bin/bash

# AI CRM系统重启脚本
# 作者: AI CRM开发团队
# 版本: 1.0.0

echo "🔄 重启AI CRM系统..."

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}第1步: 停止当前运行的服务...${NC}"
./stop-all.sh

echo ""
echo -e "${BLUE}第2步: 等待服务完全停止...${NC}"
sleep 3

echo ""
echo -e "${BLUE}第3步: 重新启动所有服务...${NC}"
./start-all.sh
