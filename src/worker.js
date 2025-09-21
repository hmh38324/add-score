// Cloudflare Workers API for 游园活动积分管理系统

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;

        // CORS 处理
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',
        };

        // 处理预检请求
        if (method === 'OPTIONS') {
            return new Response(null, {
                status: 200,
                headers: corsHeaders
            });
        }

        try {
            // 路由处理
            console.log(`Request: ${method} ${path}`);
            
            if (path === '/api/scores' && method === 'POST') {
                return await handleSubmitScore(request, env, corsHeaders);
            } else if (path === '/api/scores' && method === 'GET') {
                return await handleGetScores(request, env, corsHeaders);
            } else if (path === '/api/scores/all' && method === 'DELETE') {
                console.log('Matched delete all scores route');
                return await handleDeleteAllScores(request, env, corsHeaders);
            } else if (path.startsWith('/api/scores/') && path !== '/api/scores/all' && method === 'DELETE') {
                console.log('Matched delete single score route');
                return await handleDeleteScore(request, env, corsHeaders);
            } else if (path === '/api/employees' && method === 'GET') {
                return await handleGetEmployees(request, env, corsHeaders);
            } else if (path === '/api/stats' && method === 'GET') {
                return await handleGetStats(request, env, corsHeaders);
            } else {
                return new Response(JSON.stringify({ error: 'Not Found' }), {
                    status: 404,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
        } catch (error) {
            console.error('API Error:', error);
            return new Response(JSON.stringify({ 
                error: 'Internal Server Error',
                message: error.message 
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    }
};

// 提交积分
async function handleSubmitScore(request, env, corsHeaders) {
    try {
        const body = await request.json();
        const { gameId, employeeId, employeeName, score } = body;

        // 验证输入
        if (!gameId || !employeeId || !employeeName || !score) {
            return new Response(JSON.stringify({ 
                error: 'Missing required fields' 
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (score < 1 || score > 20) {
            return new Response(JSON.stringify({ 
                error: 'Score must be between 1 and 20' 
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 插入数据库
        const result = await env.DB.prepare(`
            INSERT INTO scores (game_id, employee_id, employee_name, score, created_at)
            VALUES (?, ?, ?, ?, ?)
        `).bind(
            gameId,
            employeeId,
            employeeName,
            score,
            new Date().toISOString()
        ).run();

        if (!result.success) {
            throw new Error('Failed to insert score');
        }

        return new Response(JSON.stringify({ 
            success: true,
            id: result.meta.last_row_id,
            message: 'Score submitted successfully'
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Submit score error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to submit score',
            message: error.message 
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

// 删除积分记录
async function handleDeleteScore(request, env, corsHeaders) {
    try {
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const scoreId = pathParts[pathParts.length - 1];

        if (!scoreId || isNaN(scoreId)) {
            return new Response(JSON.stringify({ 
                error: 'Invalid score ID' 
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 检查记录是否存在
        const existingRecord = await env.DB.prepare(`
            SELECT * FROM scores WHERE id = ?
        `).bind(scoreId).first();

        if (!existingRecord) {
            return new Response(JSON.stringify({ 
                error: 'Score record not found' 
            }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 删除记录
        const result = await env.DB.prepare(`
            DELETE FROM scores WHERE id = ?
        `).bind(scoreId).run();

        if (!result.success) {
            throw new Error('Failed to delete score');
        }

        return new Response(JSON.stringify({ 
            success: true,
            message: 'Score deleted successfully'
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Delete score error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to delete score',
            message: error.message 
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

// 删除全部积分记录
async function handleDeleteAllScores(request, env, corsHeaders) {
    try {
        const body = await request.json();
        const { password } = body;

        // 验证密码
        if (password !== '1314520') {
            return new Response(JSON.stringify({ 
                error: 'Invalid password' 
            }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 删除所有记录
        const result = await env.DB.prepare(`
            DELETE FROM scores
        `).run();

        if (!result.success) {
            throw new Error('Failed to delete all scores');
        }

        return new Response(JSON.stringify({ 
            success: true,
            message: 'All scores deleted successfully',
            deletedCount: result.meta.changes
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Delete all scores error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to delete all scores',
            message: error.message 
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

// 获取积分记录
async function handleGetScores(request, env, corsHeaders) {
    try {
        const url = new URL(request.url);
        const gameId = url.searchParams.get('gameId');
        const limit = parseInt(url.searchParams.get('limit')) || 50;
        const offset = parseInt(url.searchParams.get('offset')) || 0;

        let query = `
            SELECT * FROM scores 
            WHERE 1=1
        `;
        let params = [];

        if (gameId) {
            query += ` AND game_id = ?`;
            params.push(gameId);
        }

        query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const result = await env.DB.prepare(query).bind(...params).all();

        return new Response(JSON.stringify({
            success: true,
            data: result.results,
            total: result.results.length
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get scores error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to get scores',
            message: error.message 
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

// 获取员工列表
async function handleGetEmployees(request, env, corsHeaders) {
    try {
        // 从 KV 存储获取员工数据
        const employeesData = await env.KV.get('employees');
        
        if (!employeesData) {
            return new Response(JSON.stringify({ 
                error: 'Employees data not found' 
            }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const employees = JSON.parse(employeesData);

        return new Response(JSON.stringify({
            success: true,
            data: employees
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get employees error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to get employees',
            message: error.message 
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

// 获取统计信息
async function handleGetStats(request, env, corsHeaders) {
    try {
        const url = new URL(request.url);
        const gameId = url.searchParams.get('gameId');

        let query = `
            SELECT 
                game_id,
                COUNT(*) as total_submissions,
                SUM(score) as total_score,
                AVG(score) as average_score,
                MAX(score) as max_score,
                MIN(score) as min_score
            FROM scores 
            WHERE 1=1
        `;
        let params = [];

        if (gameId) {
            query += ` AND game_id = ?`;
            params.push(gameId);
        }

        query += ` GROUP BY game_id`;

        const result = await env.DB.prepare(query).bind(...params).all();

        // 获取每个游戏的详细统计
        const gameStats = {};
        for (const row of result.results) {
            gameStats[row.game_id] = {
                totalSubmissions: row.total_submissions,
                totalScore: row.total_score,
                averageScore: Math.round(row.average_score * 100) / 100,
                maxScore: row.max_score,
                minScore: row.min_score
            };
        }

        // 获取总体统计
        const totalQuery = `
            SELECT 
                COUNT(*) as total_submissions,
                SUM(score) as total_score,
                AVG(score) as average_score
            FROM scores
        `;
        const totalResult = await env.DB.prepare(totalQuery).first();

        return new Response(JSON.stringify({
            success: true,
            data: {
                gameStats,
                totalStats: {
                    totalSubmissions: totalResult.total_submissions || 0,
                    totalScore: totalResult.total_score || 0,
                    averageScore: Math.round((totalResult.average_score || 0) * 100) / 100
                }
            }
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get stats error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to get stats',
            message: error.message 
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}
