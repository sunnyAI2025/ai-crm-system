#!/bin/bash

# AI CRM系统推送到GitHub脚本
# 请在GitHub上创建仓库后执行此脚本

echo "🚀 开始推送AI CRM系统到GitHub..."
echo "仓库地址: https://github.com/sunnyAI2025/ai-crm-system"
echo "================================"

# 验证远程仓库已添加
echo "📡 验证远程仓库配置..."
git remote -v

echo ""
echo "⬆️ 推送代码到GitHub..."

# 推送到主分支
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 推送成功！"
    echo "📝 仓库地址: https://github.com/sunnyAI2025/ai-crm-system"
    echo "📊 推送统计:"
    echo "   - 文件数量: 136个"
    echo "   - 代码行数: 46,705行"
    echo "   - 包含内容: 完整的AI CRM系统"
    echo ""
    echo "🌟 你可以在GitHub上查看项目了！"
else
    echo ""
    echo "❌ 推送失败，请检查："
    echo "   1. GitHub仓库是否已创建"
    echo "   2. 仓库名称是否正确: ai-crm-system"
    echo "   3. 网络连接是否正常"
    echo ""
    echo "🔧 如果仍有问题，请手动执行:"
    echo "   git push -u origin main"
fi
