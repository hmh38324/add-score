// 游戏配置
const GAMES = {
    1: { name: '拼速达人', icon: '⚡', description: '守擂挑战' },
    2: { name: '碰碰乐', icon: '🚗', description: '遥控对战' },
    3: { name: '沙包投掷', icon: '🎯', description: '精准投掷' },
    4: { name: '巧手取棒', icon: '🥢', description: '精准抓取' }
};

// 系统密码
const SYSTEM_PASSWORD = '110';

// 员工数据
let employees = [];

// DOM 元素
const passwordModal = document.getElementById('passwordModal');
const passwordInput = document.getElementById('passwordInput');
const submitPasswordBtn = document.getElementById('submitPassword');
const passwordError = document.getElementById('passwordError');
const mainContent = document.getElementById('mainContent');
const logoutBtn = document.getElementById('logoutBtn');

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
const API_BASE = 'https://addscoreapi.biboran.top/api';

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否已经登录
    if (localStorage.getItem('isAuthenticated') === 'true') {
        showMainContent();
    } else {
        showPasswordModal();
    }
    
    loadEmployees();
    setupEventListeners();
    setupPasswordEventListeners();
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

// 密码验证相关函数
function showPasswordModal() {
    passwordModal.style.display = 'block';
    mainContent.classList.add('hidden');
    passwordInput.focus();
}

function showMainContent() {
    passwordModal.style.display = 'none';
    mainContent.classList.remove('hidden');
}

function setupPasswordEventListeners() {
    // 密码提交按钮
    submitPasswordBtn.addEventListener('click', verifyPassword);
    
    // 密码输入框回车事件
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            verifyPassword();
        }
    });
    
    // 退出登录按钮
    logoutBtn.addEventListener('click', logout);
}

function verifyPassword() {
    const inputPassword = passwordInput.value.trim();
    
    if (inputPassword === SYSTEM_PASSWORD) {
        // 密码正确
        localStorage.setItem('isAuthenticated', 'true');
        showMainContent();
        passwordInput.value = '';
        passwordError.classList.add('hidden');
    } else {
        // 密码错误
        passwordError.classList.remove('hidden');
        passwordInput.value = '';
        passwordInput.focus();
        
        // 3秒后隐藏错误信息
        setTimeout(() => {
            passwordError.classList.add('hidden');
        }, 3000);
    }
}

function logout() {
    localStorage.removeItem('isAuthenticated');
    showPasswordModal();
    // 关闭游戏弹窗
    closeModal();
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
        scoreHistory.innerHTML = history.map((record, index) => {
            console.log(`记录 ${index}:`, record);
            console.log(`员工姓名: ${record.employee_name}, 员工ID: ${record.employee_id}, 创建时间: ${record.created_at}`);
            
            return `
                <div class="history-item" data-id="${record.id}">
                    <div class="history-content">
                        <div class="history-info">
                            <div class="history-name">${record.employee_name || '未知'} (${record.employee_id || 'N/A'})</div>
                            <div class="history-details">
                                ${record.created_at ? new Date(record.created_at).toLocaleString('zh-CN') : '未知时间'}
                            </div>
                        </div>
                        <div class="history-score">+${record.score || 0}分</div>
                    </div>
                    <div class="delete-action">
                        <button class="delete-btn" onclick="deleteScore(${record.id})">
                            <span class="delete-icon">🗑️</span>
                            <span class="delete-text">删除</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // 添加触摸事件监听器
        addSwipeListeners();
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

// 删除积分记录
async function deleteScore(scoreId) {
    if (!confirm('确定要删除这条积分记录吗？此操作不可撤销。')) {
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/scores/${scoreId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error('删除失败');
        }
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('记录删除成功！', 'success');
            // 刷新历史记录
            loadScoreHistory(currentGame);
        } else {
            throw new Error(result.error || '删除失败');
        }
        
    } catch (error) {
        console.error('删除记录失败:', error);
        showMessage('删除失败，请重试', 'error');
    } finally {
        showLoading(false);
    }
}

// 添加触摸事件监听器
function addSwipeListeners() {
    const historyItems = document.querySelectorAll('.history-item');
    
    historyItems.forEach(item => {
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let isDragging = false;
        let hasMoved = false;
        
        // 触摸开始
        item.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = true;
            hasMoved = false;
            item.style.transition = 'none';
        });
        
        // 触摸移动
        item.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            currentX = e.touches[0].clientX;
            const deltaX = currentX - startX;
            const deltaY = e.touches[0].clientY - startY;
            
            // 如果垂直滑动距离大于水平滑动距离，不处理
            if (Math.abs(deltaY) > Math.abs(deltaX)) {
                return;
            }
            
            hasMoved = true;
            
            // 只允许向左滑动
            if (deltaX < 0) {
                const translateX = Math.max(deltaX, -80); // 最大滑动80px
                item.style.transform = `translateX(${translateX}px)`;
                
                // 显示删除按钮
                const deleteAction = item.querySelector('.delete-action');
                if (deleteAction) {
                    const opacity = Math.min(Math.abs(deltaX) / 80, 1);
                    deleteAction.style.opacity = opacity;
                }
            }
        });
        
        // 触摸结束
        item.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            isDragging = false;
            item.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
            
            const deltaX = currentX - startX;
            
            if (hasMoved && deltaX < -40) {
                // 滑动超过40px，显示删除按钮
                item.style.transform = 'translateX(-80px)';
                const deleteAction = item.querySelector('.delete-action');
                if (deleteAction) {
                    deleteAction.style.opacity = '1';
                }
            } else {
                // 滑动不足或向右滑动，恢复原状
                item.style.transform = 'translateX(0)';
                const deleteAction = item.querySelector('.delete-action');
                if (deleteAction) {
                    deleteAction.style.opacity = '0';
                }
            }
        });
        
        // 点击恢复
        item.addEventListener('click', (e) => {
            if (e.target.closest('.delete-btn')) return;
            
            item.style.transform = 'translateX(0)';
            const deleteAction = item.querySelector('.delete-action');
            if (deleteAction) {
                deleteAction.style.opacity = '0';
            }
        });
    });
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
