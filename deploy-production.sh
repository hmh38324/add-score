#!/bin/bash

# 游园活动积分管理系统 - 生产环境部署脚本

echo "🚀 开始部署到生产环境..."

# 部署后端API到生产环境
echo "📡 部署后端API..."
npm run deploy

if [ $? -eq 0 ]; then
    echo "✅ 后端API部署成功"
else
    echo "❌ 后端API部署失败"
    exit 1
fi

# 部署前端页面到生产环境
echo "🌐 部署前端页面..."
npm run pages:deploy

if [ $? -eq 0 ]; then
    echo "✅ 前端页面部署成功"
else
    echo "❌ 前端页面部署失败"
    exit 1
fi

echo ""
echo "🎉 生产环境部署完成！"
echo "📱 前端地址: https://addscore.biboran.top"
echo "🔗 API地址: https://addscoreapi.biboran.top"
echo ""
echo "💡 提示: 现在可以直接使用 'npm run deploy' 和 'npm run pages:deploy' 命令"
