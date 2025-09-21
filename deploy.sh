#!/bin/bash

# 游园活动积分管理系统部署脚本

echo "🚀 开始部署游园活动积分管理系统..."

# 检查是否安装了 wrangler
if ! command -v wrangler &> /dev/null; then
    echo "❌ 错误: 请先安装 wrangler CLI"
    echo "运行: npm install -g wrangler"
    exit 1
fi

# 检查是否已登录 Cloudflare
if ! wrangler whoami &> /dev/null; then
    echo "❌ 错误: 请先登录 Cloudflare"
    echo "运行: wrangler login"
    exit 1
fi

echo "📦 安装依赖..."
npm install

echo "🗄️ 创建 D1 数据库..."
# 检查数据库是否已存在
if ! wrangler d1 list | grep -q "rankinglist-db"; then
    echo "创建新数据库..."
    wrangler d1 create rankinglist-db
    echo "⚠️  请更新 wrangler.toml 中的 database_id"
    echo "然后重新运行此脚本"
    exit 1
else
    echo "数据库已存在，跳过创建"
fi

echo "📊 执行数据库迁移..."
wrangler d1 execute rankinglist-db --file=schema.sql

echo "👥 上传员工数据到 KV..."
wrangler kv:key put "employees" --path=people.json

echo "🔧 部署 Workers API..."
wrangler deploy

echo "🌐 部署 Pages 静态资源..."
wrangler pages deploy public

echo "✅ 部署完成！"
echo ""
echo "📋 后续步骤："
echo "1. 在 Cloudflare Dashboard 中配置 Pages 项目的自定义域名"
echo "2. 在 Workers 设置中配置 KV 命名空间绑定"
echo "3. 测试系统功能是否正常"
echo ""
echo "🎮 系统已准备就绪，可以开始使用！"
