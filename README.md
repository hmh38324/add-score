# 游园活动积分管理系统

一个基于 Cloudflare Pages + Workers + D1 的现代化积分管理系统，用于管理游园活动的积分录入和统计。

## 功能特性

- 🎮 四个游戏项目：拼速达人、碰碰乐、平和心灵、巧手取棒
- 👥 员工工号自动匹配姓名
- ⚡ 快速积分录入和调整
- 📊 实时积分历史记录
- 📱 响应式设计，支持移动端
- 🚀 基于 Cloudflare 的快速部署

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **后端**: Cloudflare Workers
- **数据库**: Cloudflare D1 (SQLite)
- **存储**: Cloudflare KV (员工数据)
- **部署**: Cloudflare Pages

## 项目结构

```
rankinglist/
├── public/                 # 静态资源
│   ├── index.html         # 主页面
│   ├── style.css          # 样式文件
│   ├── script.js          # 前端逻辑
│   └── people.json        # 员工数据
├── src/
│   └── worker.js          # Cloudflare Workers API
├── schema.sql             # 数据库结构
├── wrangler.toml          # Cloudflare 配置
├── package.json           # 项目配置
└── README.md              # 说明文档
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Cloudflare

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 创建 D1 数据库：
   ```bash
   wrangler d1 create rankinglist-db
   ```
3. 更新 `wrangler.toml` 中的 `database_id`
4. 执行数据库迁移：
   ```bash
   wrangler d1 execute rankinglist-db --file=schema.sql
   ```

### 3. 部署到 Cloudflare

#### 部署 Workers API
```bash
wrangler deploy
```

#### 部署 Pages 静态资源
```bash
wrangler pages deploy public
```

### 4. 配置员工数据

将 `people.json` 上传到 Cloudflare KV 存储：

```bash
wrangler kv:key put "employees" --path=people.json
```

## API 接口

### 提交积分
```
POST /api/scores
Content-Type: application/json

{
  "gameId": 1,
  "employeeId": "12345",
  "employeeName": "张三",
  "score": 5
}
```

### 获取积分记录
```
GET /api/scores?gameId=1&limit=50&offset=0
```

### 获取员工列表
```
GET /api/employees
```

### 获取统计信息
```
GET /api/stats?gameId=1
```

## 游戏规则

### 1. 拼速达人（守擂）
- 3人一组，30秒比赛时间
- 胜者守擂，最多3轮
- 积分：胜者5分，失败3分，参与1分

### 2. 碰碰乐（守擂）
- 5人一组，1分钟对战
- 率先击飞对手获胜
- 积分：获胜5分，失败3分，参与1分

### 3. 平和心灵（沙包投掷）
- 单人参与，一次机会
- 休闲系4分，阳光系3分，原生系2分
- 参与即得1分

### 4. 巧手取棒
- 单人参与，一次机会
- 10根基准：4分，9-11根：3分，8-12根：2分
- 参与1分

## 开发说明

### 本地开发

```bash
# 启动 Workers 开发服务器
wrangler dev

# 启动 Pages 开发服务器
wrangler pages dev public
```

### 数据库管理

```bash
# 执行 SQL 文件
wrangler d1 execute rankinglist-db --file=schema.sql

# 查询数据
wrangler d1 execute rankinglist-db --command="SELECT * FROM scores LIMIT 10"
```

## 部署配置

### Cloudflare Pages 配置

1. 在 Cloudflare Dashboard 中创建 Pages 项目
2. 连接 GitHub 仓库或直接上传文件
3. 设置构建命令：`npm run build`（如果需要）
4. 设置输出目录：`public`

### Workers 配置

1. 在 `wrangler.toml` 中配置 D1 数据库绑定
2. 设置 KV 命名空间绑定（用于员工数据）
3. 配置环境变量（如需要）

## 注意事项

1. 确保 D1 数据库已正确创建和配置
2. 员工数据需要上传到 KV 存储
3. 生产环境建议配置 CORS 策略
4. 定期备份数据库数据

## 许可证

MIT License
