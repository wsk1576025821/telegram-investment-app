const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const fs = require('fs');
const lockFile = 'bot.lock';

// 加载环境变量
dotenv.config();

// Bot Token
const token = process.env.TELEGRAM_BOT_TOKEN || '7582221284:AAGvtmNC5RmjSRcumethqzgWPkSTJRYHxQg';
const adminId = "7036647707";

// 添加配置选项
const botOptions = {
    polling: {
        interval: 300,
        autoStart: true,
        params: {
            timeout: 10
        }
    },
    // 添加 webHook: false 确保不会同时使用 webhook
    webHook: false
};

// 创建 bot 实例时使用这些选项
const bot = new TelegramBot(token, botOptions);

// 基础 URL
const BASE_URL = "https://wsk1576025821.github.io/telegram-investment-app";

// 创建键盘布局
const getKeyboard = (webAppUrl) => {
    // 打印 URL 用于调试
    console.log('Creating keyboard with WebApp URL:', webAppUrl);
    
    // 确保 webAppUrl 包含用户信息
    if (!webAppUrl.includes('user_id=')) {
        console.error('WebApp URL missing user info:', webAppUrl);
        return null;
    }
    
    return {
        reply_markup: {
            keyboard: [
                ['1', '2', '3', '4', '5', '6', '7'],
                ['8', '9', '10', '11', '12', '13', '14'],
                ['15', '16', '17', '18', '19', '20'],
                ['🔥 购买广告', '➡️ 下一页'],
                ['🔥 IM体育: 1个有效即享55%-70%-可...'],
                ['🎭升元棋牌❤️ 贷盈利70%分成招商❤️...'],
                [{
                    text: '🌐 打开投资平台',
                    web_app: { url: webAppUrl }
                }],
                ['📋 官方简介', '📁 分类'],
                ['👤 我的', '💰 推广赚钱'],
                ['🔥 广告投放', '❓ 帮助']
            ],
            resize_keyboard: true,
            one_time_keyboard: false
        }
    };
};

// 检查是否已经有实例在运行
function checkLock() {
    try {
        if (fs.existsSync(lockFile)) {
            const pid = fs.readFileSync(lockFile, 'utf8');
            try {
                // 检查进程是否还在运行
                process.kill(parseInt(pid), 0);
                console.error(`Bot is already running with PID ${pid}`);
                process.exit(1);
            } catch (e) {
                // 进程不存在，删除锁文件
                fs.unlinkSync(lockFile);
            }
        }
        // 创建新的锁文件
        fs.writeFileSync(lockFile, process.pid.toString());
    } catch (error) {
        console.error('Error handling lock file:', error);
    }
}

// 在启动时检查锁
checkLock();

// 在退出时删除锁文件
process.on('exit', () => {
    try {
        fs.unlinkSync(lockFile);
    } catch (error) {
        // 忽略错误
    }
});

// 处理 /start 命令
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const user = msg.from;
    
    // 构建用户信息
    const userInfo = {
        user_id: user.id.toString(), // 确保是字符串
        username: user.username || 'anonymous',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        language: user.language_code || 'zh',
        chat_id: chatId.toString(), // 确保是字符串
        is_bot: (user.is_bot || false).toString(), // 确保是字符串
        is_premium: (user.is_premium || false).toString(), // 确保是字符串
        timestamp: new Date().toISOString()
    };
    
    // 创建 WebApp URL
    const params = new URLSearchParams(userInfo);
    const webAppUrl = `${BASE_URL}?${params.toString()}`;
    console.log('Generated WebApp URL:', webAppUrl);
    console.log('User Info:', userInfo);

    // 创建键盘布局
    const keyboard = getKeyboard(webAppUrl);
    if (!keyboard) {
        console.error('Failed to create keyboard');
        return;
    }

    // 发送欢迎消息
    await bot.sendMessage(chatId, '欢迎使用投资平台！请点击下方按钮操作。', keyboard);
});

// 处理其他消息
bot.on('message', async (msg) => {
    try {
        // 检查是否有 WebApp 数据
        if (msg.web_app_data) {
            console.log('Received WebApp data:', msg.web_app_data);
            return;
        }

        const chatId = msg.chat.id;
        const user = msg.from;
        const text = msg.text;

        // 构建用户信息（与 /start 命令保持一致）
        const userInfo = {
            user_id: user.id.toString(), // 确保是字符串
            username: user.username || 'anonymous',
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            language: user.language_code || 'zh',
            chat_id: chatId.toString(), // 确保是字符串
            is_bot: (user.is_bot || false).toString(), // 确保是字符串
            is_premium: (user.is_premium || false).toString(), // 确保是字符串
            timestamp: new Date().toISOString()
        };

        // 创建 WebApp URL
        const params = new URLSearchParams(userInfo);
        const webAppUrl = `${BASE_URL}?${params.toString()}`;
        console.log('Message handler - User Info:', userInfo);
        console.log('Message handler - Generated URL:', webAppUrl);

        // 使用 getKeyboard 函数创建键盘
        const keyboard = getKeyboard(webAppUrl);
        if (!keyboard) {
            console.error('Failed to create keyboard in message handler');
            return;
        }

        // 每次消息都更新键盘
        await bot.sendMessage(chatId, '请选择操作:', keyboard);

    } catch (error) {
        console.error('Error handling message:', error);
    }
});

// 添加错误处理
bot.on('polling_error', (error) => {
    // 如果是冲突错误，尝试重新启动
    if (error.code === 'ETELEGRAM' && error.response.statusCode === 409) {
        console.log('Conflict detected, restarting polling...');
        bot.stopPolling().then(() => {
            setTimeout(() => {
                bot.startPolling();
            }, 1000);
        });
    } else {
        console.error('Polling error:', error);
    }
});

// 添加优雅退出处理
process.on('SIGINT', () => {
    console.log('Stopping bot...');
    bot.stopPolling().then(() => {
        console.log('Bot stopped');
        process.exit(0);
    });
});

console.log('Bot is running...'); 
