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
    console.log("Creating keyboard with WebApp URL:", webAppUrl);
    
    return {
        reply_markup: {
            menu_button: {
                text: "打开",
                web_app: {
                    url: webAppUrl
                }
            },
            keyboard: [
                ['1', '2', '3', '4', '5', '6', '7'],
                ['8', '9', '10', '11', '12', '13', '14'],
                ['15', '16', '17', '18', '19', '20'],
                ['📱 购买广告', '⬇️ 下一页'],
                ['🔥 IMA体育: 1个有效创手55%-76%-可...'],
                ['🔥手动挂单❤️ 资金利70%分成招商...'],
                [{
                    text: '🌐 打开投资平台',
                    web_app: {
                        url: webAppUrl,
                        parse_mode: 'HTML',
                        disable_web_page_preview: false,
                        protect_content: false
                    }
                }],
                ['📋 官方简介', '💳 分类'],
                ['👨‍💼 我的', '🔰 推广赚钱'],
                ['📱 广告投放', '❓ 帮助']
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

// 创建 WebApp URL
const createWebAppUrl = (userInfo) => {
    const baseUrl = "https://wsk1576025821.github.io/telegram-investment-app/";
    const params = new URLSearchParams();
    
    // 确保所有参数都有值且正确编码
    const safeUserInfo = {
        user_id: userInfo.user_id || '',
        username: userInfo.username || 'anonymous',
        first_name: userInfo.first_name || '',
        last_name: userInfo.last_name || '',
        language: userInfo.language || 'zh',
        chat_id: userInfo.chat_id || '',
        is_bot: String(userInfo.is_bot || false),
        is_premium: String(userInfo.is_premium || false),
        timestamp: userInfo.timestamp || new Date().toISOString()
    };
    
    // 添加参数前打印调试信息
    console.log('Creating URL with user info:', safeUserInfo);
    
    Object.entries(safeUserInfo).forEach(([key, value]) => {
        params.append(key, encodeURIComponent(value || ''));
    });
    
    const finalUrl = `${baseUrl}?${params.toString()}`;
    console.log('Final WebApp URL:', finalUrl);
    return finalUrl;
};

// 添加发送带图片和按钮的消息函数
async function sendPromotionalMessage(chatId) {
    try {
        // 构建用户参数
        const params = new URLSearchParams({
            source: 'promo',
            timestamp: new Date().toISOString()
        });

        const webAppUrl = `${BASE_URL}?${params.toString()}`;
        
        // 创建内联键盘按钮
        const inlineKeyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: '🌟 立即投资',
                        web_app: {
                            url: webAppUrl
                        }
                    }],
                    [{
                        text: '📱 分享给朋友',
                        url: `https://t.me/share/url?url=${encodeURIComponent(webAppUrl)}`
                    }]
                ]
            },
            parse_mode: 'HTML'
        };

        // 发送图片消息
        await bot.sendPhoto(chatId, 
            'path/to/your/promo/image.jpg', // 替换为您的图片路径或URL
            {
                caption: `
🔥 <b>投资平台最新优惠</b>

💰 高收益投资项目
✨ 专业团队管理
🔒 资金安全保障
                
<i>点击下方按钮立即开始！</i>`,
                parse_mode: 'HTML',
                ...inlineKeyboard
            }
        );

    } catch (error) {
        console.error('Error sending promotional message:', error);
    }
}

// 修改 /start 命令处理
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const user = msg.from;
    
    // 构建用户信息
    const userInfo = {
        user_id: String(user.id),
        username: user.username || 'anonymous',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        language: user.language_code || 'zh',
        chat_id: String(chatId),
        is_bot: String(user.is_bot || false),
        is_premium: String(user.is_premium || false),
        timestamp: new Date().toISOString()
    };
    
    // 发送欢迎消息
    await bot.sendMessage(chatId, '欢迎使用投资平台！');
    
    // 发送推广消息
    await sendPromotionalMessage(chatId);
    
    // 使用现有的键盘布局
    const webAppUrl = createWebAppUrl(userInfo);
    const keyboard = getKeyboard(webAppUrl);
    await bot.sendMessage(chatId, '请选择以下操作：', keyboard);
});

// 添加定时发送功能
function schedulePromotionalMessage() {
    // 每天固定时间发送
    const schedule = require('node-schedule');
    
    // 每天早上10点发送
    schedule.scheduleJob('0 10 * * *', async () => {
        try {
            // 从数据库或配置中获取用户列表
            const users = [/* 您的用户列表 */];
            
            for (const user of users) {
                await sendPromotionalMessage(user.chatId);
                // 添加延迟避免触发限制
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } catch (error) {
            console.error('Error in scheduled message:', error);
        }
    });
}

// 启动定时任务
schedulePromotionalMessage();

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

// 在 bot 初始化后添加这个函数
async function setupBot() {
    try {
        // 设置 menu button
        await bot.setMyCommands([
            {
                command: 'start',
                description: '启动机器人'
            }
        ]);
        
        // 设置 menu button 需要通过 API 请求
        await bot.api.setChatMenuButton({
            menu_button: {
                type: 'web_app',
                text: '打开',
                web_app: {
                    url: BASE_URL
                }
            }
        });
        
        console.log('Bot menu button setup completed');
    } catch (error) {
        console.error('Error setting up bot:', error);
    }
}

// 在创建 bot 实例后调用
setupBot();

console.log('Bot is running...'); 
