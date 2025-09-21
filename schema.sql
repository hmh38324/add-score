-- 游园活动积分管理系统数据库结构

-- 创建积分记录表
CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    employee_id TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 20),
    created_at TEXT NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_scores_game_id ON scores (game_id);
CREATE INDEX IF NOT EXISTS idx_scores_employee_id ON scores (employee_id);
CREATE INDEX IF NOT EXISTS idx_scores_created_at ON scores (created_at);

-- 创建游戏配置表
CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    description TEXT NOT NULL,
    max_score INTEGER DEFAULT 20,
    min_score INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 插入游戏配置数据
INSERT OR REPLACE INTO games (id, name, icon, description, max_score, min_score) VALUES
(1, '拼速达人', '⚡', '守擂挑战', 20, 1),
(2, '碰碰乐', '🚗', '遥控对战', 20, 1),
(3, '平和心灵', '🎯', '沙包投掷', 20, 1),
(4, '巧手取棒', '🥢', '精准抓取', 20, 1);

-- 创建员工表（可选，用于存储员工信息）
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    department TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 创建员工表索引
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees (employee_id);

-- 创建积分统计视图
CREATE VIEW IF NOT EXISTS score_stats AS
SELECT 
    s.game_id,
    g.name as game_name,
    g.icon as game_icon,
    COUNT(*) as total_submissions,
    SUM(s.score) as total_score,
    AVG(s.score) as average_score,
    MAX(s.score) as max_score,
    MIN(s.score) as min_score,
    COUNT(DISTINCT s.employee_id) as unique_players
FROM scores s
JOIN games g ON s.game_id = g.id
GROUP BY s.game_id, g.name, g.icon;

-- 创建员工积分统计视图
CREATE VIEW IF NOT EXISTS employee_stats AS
SELECT 
    employee_id,
    employee_name,
    COUNT(*) as total_submissions,
    SUM(score) as total_score,
    AVG(score) as average_score,
    MAX(score) as max_score,
    MIN(score) as min_score,
    GROUP_CONCAT(DISTINCT game_id) as games_played
FROM scores
GROUP BY employee_id, employee_name;

-- 创建每日统计视图
CREATE VIEW IF NOT EXISTS daily_stats AS
SELECT 
    DATE(created_at) as date,
    game_id,
    COUNT(*) as daily_submissions,
    SUM(score) as daily_score,
    AVG(score) as daily_average
FROM scores
GROUP BY DATE(created_at), game_id;
