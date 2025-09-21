# 缓存问题解决方案

## 问题描述
- `https://rankinglist-frontend.pages.dev` 显示新版本（"处理中..."）
- `https://addscore.biboran.top` 显示旧版本（"未知"）

## 解决方案

### 1. 强制清除浏览器缓存
```bash
# 在浏览器中按以下组合键：
# Windows: Ctrl + Shift + R
# Mac: Cmd + Shift + R
# 或者按 F12 打开开发者工具，右键刷新按钮选择"清空缓存并硬性重新加载"
```

### 2. 使用无痕模式测试
- 打开浏览器无痕/隐私模式
- 访问：https://addscore.biboran.top
- 检查是否显示新版本

### 3. 检查Cloudflare缓存
自定义域名可能需要时间传播到最新部署。等待5-10分钟后重试。

### 4. 临时解决方案
如果自定义域名仍然显示旧版本，可以：
1. 使用临时地址：https://ae8cfec6.rankinglist-frontend.pages.dev
2. 等待Cloudflare DNS传播完成

### 5. 验证API工作状态
```bash
# 测试API是否正常工作
curl -X GET "https://addscoreapi.biboran.top/api/scores?gameId=1"
```

## 当前状态
- ✅ 最新代码已部署到生产环境
- ✅ 添加了缓存清除HTTP头
- ✅ API正常工作
- ⏳ 等待自定义域名传播到最新部署

## 访问地址
- **最新版本**：https://ae8cfec6.rankinglist-frontend.pages.dev
- **自定义域名**：https://addscore.biboran.top（可能需要等待传播）
- **API接口**：https://addscoreapi.biboran.top


