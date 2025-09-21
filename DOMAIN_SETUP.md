# 自定义域名配置说明

## 域名信息
- **前端页面**: addscore.biboran.top
- **API接口**: addscoreapi.biboran.top

## 配置步骤

### 1. Cloudflare Pages 配置 (addscore.biboran.top)

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** 部分
3. 找到项目 `rankinglist-frontend`
4. 点击 **自定义域名** 或 **Custom domains**
5. 添加域名：`addscore.biboran.top`
6. 等待 DNS 验证完成

### 2. Cloudflare Workers 配置 (addscoreapi.biboran.top)

1. 在 Cloudflare Dashboard 中进入 **Workers & Pages**
2. 找到 Worker `rankinglist-api`
3. 点击 **触发器** 或 **Triggers**
4. 在 **自定义域名** 部分添加：`addscoreapi.biboran.top`
5. 等待 DNS 验证完成

### 3. DNS 记录配置

确保您的域名 DNS 记录指向 Cloudflare：

```
类型: A
名称: addscore.biboran.top
内容: 192.0.2.1 (或您的 Cloudflare IP)
代理状态: 已代理 (橙色云朵)

类型: A  
名称: addscoreapi.biboran.top
内容: 192.0.2.1 (或您的 Cloudflare IP)
代理状态: 已代理 (橙色云朵)
```

### 4. SSL 证书

Cloudflare 会自动为自定义域名生成 SSL 证书，通常需要几分钟到几小时。

## 验证配置

### 测试前端页面
```bash
curl -I https://addscore.biboran.top
```

### 测试 API 接口
```bash
curl -I https://addscoreapi.biboran.top/api/scores
```

## 当前状态

- ✅ 代码已更新为使用自定义域名
- ✅ Workers 已部署
- ✅ Pages 已部署
- ⏳ 等待在 Cloudflare Dashboard 中配置自定义域名
- ⏳ 等待 DNS 传播

## 临时访问地址

在自定义域名配置完成前，可以使用以下地址：

- **前端**: https://dd466d08.rankinglist-frontend.pages.dev
- **API**: https://rankinglist-api.hmh38324.workers.dev

## 故障排除

1. **域名无法访问**: 检查 DNS 记录是否正确指向 Cloudflare
2. **SSL 证书问题**: 等待 Cloudflare 自动生成证书
3. **API 调用失败**: 检查 CORS 设置和域名配置
4. **页面显示异常**: 清除浏览器缓存并强制刷新

## 联系支持

如果遇到问题，请检查：
1. Cloudflare Dashboard 中的域名配置状态
2. DNS 记录是否正确
3. SSL 证书是否已激活
