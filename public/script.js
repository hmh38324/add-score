// 游戏配置
const GAMES = {
    1: { name: '拼速达人', icon: '⚡', description: '守擂挑战' },
    2: { name: '碰碰乐', icon: '🚗', description: '遥控对战' },
    3: { name: '平和心灵', icon: '🎯', description: '沙包投掷' },
    4: { name: '巧手取棒', icon: '🥢', description: '精准抓取' }
};

// 员工数据
let employees = [];

// DOM 元素
const modal = document.getElementById('gameModal');
const modalTitle = document.getElementById('modalTitle');
const employeeIdInput = document.getElementById('employeeId');
const employeeNameDiv = document.getElementById('employeeName');
const scoreInput = document.getElementById('score');
const scoreMinusBtn = document.getElementById('scoreMinus');
const scorePlusBtn = document.getElementById('scorePlus');
const submitBtn = document.getElementById('submitScore');
const scoreHistory = document.getElementById('scoreHistory');
const closeBtn = document.querySelector('.close');
const loading = document.getElementById('loading');
const message = document.getElementById('message');

// 当前选中的游戏
let currentGame = null;

// API 基础 URL
const API_BASE = 'https://rankinglist-api.hmh38324.workers.dev/api';

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadEmployees();
    setupEventListeners();
});

// 加载员工数据
async function loadEmployees() {
    try {
        const response = await fetch('/people.json');
        if (!response.ok) {
            throw new Error('加载员工数据失败');
        }
        employees = await response.json();
        console.log('员工数据加载成功:', employees.length, '个员工');
    } catch (error) {
        console.error('加载员工数据失败:', error);
        showMessage('加载员工数据失败', 'error');
        // 使用默认数据作为备用
        employees = [
            {"工号": "62344", "姓名": "胡明豪"},
            {"工号": "1", "姓名": "测试用户1"},
            {"工号": "2", "姓名": "测试用户2"}
        ];
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 游戏卡片点击
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', function() {
            const gameId = parseInt(this.dataset.game);
            openGameModal(gameId);
        });
    });

    // 工号输入
    employeeIdInput.addEventListener('input', function() {
        const employeeId = this.value.trim();
        if (employeeId) {
            const employee = employees.find(emp => emp.工号 === employeeId);
            if (employee) {
                employeeNameDiv.textContent = `姓名：${employee.姓名}`;
                employeeNameDiv.style.color = '#28a745';
            } else {
                employeeNameDiv.textContent = '未找到该工号';
                employeeNameDiv.style.color = '#dc3545';
            }
        } else {
            employeeNameDiv.textContent = '';
        }
    });

    // 分数按钮
    scoreMinusBtn.addEventListener('click', function() {
        const currentScore = parseInt(scoreInput.value);
        if (currentScore > 1) {
            scoreInput.value = currentScore - 1;
        }
    });

    scorePlusBtn.addEventListener('click', function() {
        const currentScore = parseInt(scoreInput.value);
        if (currentScore < 20) {
            scoreInput.value = currentScore + 1;
        }
    });

    // 分数输入验证
    scoreInput.addEventListener('input', function() {
        let value = parseInt(this.value);
        if (isNaN(value) || value < 1) {
            this.value = 1;
        } else if (value > 20) {
            this.value = 20;
        }
    });

    // 提交按钮
    submitBtn.addEventListener('click', submitScore);

    // 关闭弹窗
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // ESC 键关闭弹窗
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
}

// 打开游戏弹窗
function openGameModal(gameId) {
    currentGame = gameId;
    const game = GAMES[gameId];
    
    modalTitle.textContent = `${game.icon} ${game.name} - 积分录入`;
    employeeIdInput.value = '';
    employeeNameDiv.textContent = '';
    scoreInput.value = '1';
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // 加载历史记录
    loadScoreHistory(gameId);
}

// 关闭弹窗
function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentGame = null;
}

// 提交积分
async function submitScore() {
    const employeeId = employeeIdInput.value.trim();
    const score = parseInt(scoreInput.value);
    
    // 验证输入
    if (!employeeId) {
        showMessage('请输入工号', 'error');
        return;
    }
    
    const employee = employees.find(emp => emp.工号 === employeeId);
    if (!employee) {
        showMessage('未找到该工号', 'error');
        return;
    }
    
    if (!score || score < 1 || score > 20) {
        showMessage('请输入有效的积分（1-20）', 'error');
        return;
    }
    
    // 显示加载状态
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/scores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                gameId: currentGame,
                employeeId: employeeId,
                employeeName: employee.姓名,
                score: score
            })
        });
        
        if (!response.ok) {
            throw new Error('提交失败');
        }
        
        const result = await response.json();
        
        showMessage('积分提交成功！', 'success');
        
        // 清空表单
        employeeIdInput.value = '';
        employeeNameDiv.textContent = '';
        scoreInput.value = '1';
        
        // 刷新历史记录
        loadScoreHistory(currentGame);
        
    } catch (error) {
        console.error('提交积分失败:', error);
        showMessage('提交失败，请重试', 'error');
    } finally {
        showLoading(false);
    }
}

// 加载积分历史
async function loadScoreHistory(gameId) {
    try {
        const response = await fetch(`${API_BASE}/scores?gameId=${gameId}`);
        if (!response.ok) {
            throw new Error('加载历史失败');
        }
        
        const result = await response.json();
        if (result.success && result.data) {
            displayScoreHistory(result.data);
        } else {
            throw new Error('数据格式错误');
        }
        
    } catch (error) {
        console.error('加载历史记录失败:', error);
        scoreHistory.innerHTML = '<p style="color: #dc3545; text-align: center;">加载历史记录失败</p>';
    }
}

// 显示积分历史
function displayScoreHistory(history) {
    console.log('显示积分历史:', history);
    
    if (!Array.isArray(history)) {
        console.error('历史数据不是数组:', history);
        scoreHistory.innerHTML = '<p style="color: #dc3545; text-align: center;">数据格式错误</p>';
        return;
    }
    
    if (history.length === 0) {
        scoreHistory.innerHTML = '<p style="color: #666; text-align: center;">暂无记录</p>';
        return;
    }
    
    try {
        scoreHistory.innerHTML = history.map(record => `
            <div class="history-item">
                <div class="history-info">
                    <div class="history-name">${record.employeeName || '未知'} (${record.employeeId || 'N/A'})</div>
                    <div class="history-details">
                        ${record.createdAt ? new Date(record.createdAt).toLocaleString('zh-CN') : '未知时间'}
                    </div>
                </div>
                <div class="history-score">+${record.score || 0}分</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('渲染历史记录失败:', error);
        scoreHistory.innerHTML = '<p style="color: #dc3545; text-align: center;">渲染失败</p>';
    }
}

// 显示加载状态
function showLoading(show) {
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

// 显示消息
function showMessage(text, type = 'success') {
    message.textContent = text;
    message.className = `message ${type}`;
    message.classList.remove('hidden');
    
    setTimeout(() => {
        message.classList.add('hidden');
    }, 3000);
}

// 工具函数：防抖
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 优化工号输入体验
employeeIdInput.addEventListener('input', debounce(function() {
    const employeeId = this.value.trim();
    if (employeeId) {
        const employee = employees.find(emp => emp.工号 === employeeId);
        if (employee) {
            employeeNameDiv.textContent = `姓名：${employee.姓名}`;
            employeeNameDiv.style.color = '#28a745';
        } else {
            employeeNameDiv.textContent = '未找到该工号';
            employeeNameDiv.style.color = '#dc3545';
        }
    } else {
        employeeNameDiv.textContent = '';
    }
}, 300));
