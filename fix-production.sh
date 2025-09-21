#!/bin/bash

# 修复生产环境部署问题

echo "🔧 修复生产环境部署..."

# 1. 部署到生产环境
echo "📦 部署到生产环境..."
wrangler pages deployment create --project-name=rankinglist-frontend --branch=production public

# 2. 检查生产环境状态
echo "📊 检查生产环境状态..."
wrangler pages deployment list --project-name=rankinglist-frontend --env=production

# 3. 测试自定义域名
echo "🌐 测试自定义域名..."
echo "前端页面: https://addscore.biboran.top"
curl -I https://addscore.biboran.top

echo ""
echo "API接口: https://addscoreapi.biboran.top"
curl -I https://addscoreapi.biboran.top

echo ""
echo "✅ 修复完成！"
echo ""
echo "📋 如果API返回404，请在Cloudflare Dashboard中："
echo "1. 进入 Workers & Pages"
echo "2. 找到 rankinglist-api"
echo "3. 在触发器中添加自定义域名: addscoreapi.biboran.top"
echo ""
echo "🎮 访问地址："
echo "前端: https://addscore.biboran.top"
echo "API: https://addscoreapi.biboran.top"
