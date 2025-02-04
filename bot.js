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
const BASE_URL = encodeURI("https://nuxt-activity-dev.dx252.com//venue?id=zr&i-code=9079519");

// 创建键盘布局
const getKeyboard = (webAppUrl) => {
    console.log("Creating keyboard with WebApp URL:", webAppUrl);
    
    return {
        reply_markup: {
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
                        url: webAppUrl
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
    const params = new URLSearchParams();
    
    // 确保所有参数都经过正确编码
    const safeUserInfo = {
        user_id: userInfo.user_id || '',
        username: encodeURIComponent(userInfo.username || 'anonymous'),
        first_name: encodeURIComponent(userInfo.first_name || ''),
        last_name: encodeURIComponent(userInfo.last_name || ''),
        language: userInfo.language || 'zh',
        chat_id: userInfo.chat_id || '',
        is_bot: String(userInfo.is_bot || false),
        is_premium: String(userInfo.is_premium || false),
        timestamp: encodeURIComponent(userInfo.timestamp || new Date().toISOString())
    };
    
    Object.entries(safeUserInfo).forEach(([key, value]) => {
        params.append(key, value);
    });
    
    return `${BASE_URL}?${params.toString()}`;
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

// 添加发送视频消息的函数
async function sendVideoMessage(chatId) {
    try {
        // 构建带参数的 URL
        const params = new URLSearchParams({
            source: 'video_promo',
            timestamp: new Date().toISOString()
        });
        const webAppUrl = `${BASE_URL}?${params.toString()}`;

        // 创建内联键盘按钮
        const messageOptions = {
            caption: `
🎉 恭喜老板爆奖了
🌟 祝您一路长虹

🔥🔥 恭喜玩家 展名大佬在 德信飞投 真得 1001000 USDT！🔥🔥
🎯💕 欢迎再进，一路长红❤️，再接再厉 🎯`,
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '💎 德信飞投 💎',
                            web_app: {
                                url: webAppUrl
                            }
                        }
                    ],
                    [
                        {
                            text: '🎮 3D捕鱼',
                            callback_data: 'game_fish'
                        },
                        {
                            text: '🎲 电子游戏',
                            callback_data: 'game_slot'
                        }
                    ],
                    [
                        {
                            text: '🎯 香港六合彩',
                            callback_data: 'lottery_hk'
                        },
                        {
                            text: '🍁 加拿大28',
                            callback_data: 'lottery_ca'
                        }
                    ]
                ]
            }
        };

        // 发送视频消息
        await bot.sendVideo(
            chatId,
            'path/to/your/promo.mp4', // 替换为您的视频文件路径
            messageOptions
        );

        console.log('视频消息发送成功，时间:', new Date().toLocaleString());
    } catch (error) {
        console.error('发送视频消息失败:', error);
    }
}

// 修改定时发送函数
function startAutoMessage() {
    const chatId = adminId; // 使用 adminId 而不是环境变量
    
    if (!chatId) {
        console.error('未设置 adminId');
        return;
    }

    console.log('开始自动发送消息服务，目标chatId:', chatId);

    // 修改为每30秒发送一次
    setInterval(async () => {
        try {
            // 构建消息URL
            const params = new URLSearchParams({
                source: 'auto',
                timestamp: encodeURIComponent(new Date().toISOString())
            });

            const webAppUrl = `${BASE_URL}?${params.toString()}`;
            
            // 创建内联键盘按钮
            const messageOptions = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: '💎 德信飞投 💎',
                            web_app: {
                                url: webAppUrl
                            }
                        }],
                        [{
                            text: '🎮 3D捕鱼',
                            callback_data: 'game_fish'
                        },
                        {
                            text: '🎲 电子游戏',
                            callback_data: 'game_slot'
                        }],
                        [{
                            text: '🎯 香港六合彩',
                            callback_data: 'lottery_hk'
                        },
                        {
                            text: '🍁 加拿大28',
                            callback_data: 'lottery_ca'
                        }]
                    ]
                }
            };

            // 发送消息
            await bot.sendMessage(
                chatId,
                `
🎉 恭喜老板爆奖了
🌟 祝您一路长虹

🔥🔥 恭喜玩家 展名大佬在 德信飞投 真得 1001000 USDT！🔥🔥
🎯💕 欢迎再进，一路长红❤️，再接再厉 🎯`,
                messageOptions
            );

            console.log('自动消息发送成功，时间:', new Date().toLocaleString());

        } catch (error) {
            console.error('发送自动消息失败:', error);
        }
    }, 30000); // 30000ms = 30秒
}

// 在 bot 启动时开始自动发送
bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});

// 确保 bot 成功启动后再开始发送消息
bot.getMe().then((botInfo) => {
    console.log('Bot 启动成功:', botInfo.username);
    startAutoMessage();  // 直接启动自动发送消息
    console.log('自动发送消息服务已启动');
}).catch((error) => {
    console.error('Bot 启动失败:', error);
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

// 在 bot 初始化后添加这个函数
async function setupBot() {
    try {
        // 只设置命令列表
        await bot.setMyCommands([
            {
                command: 'start',
                description: '启动机器人'
            }
        ]);
        
        console.log('Bot commands setup completed');
    } catch (error) {
        console.error('Error setting up bot:', error);
    }
}

// 处理按钮回调
bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    try {
        // 根据不同按钮处理不同逻辑
        switch (data) {
            case 'game_fish':
                await sendGameInfo(chatId, '3D捕鱼');
                break;
            case 'game_slot':
                await sendGameInfo(chatId, '电子游戏');
                break;
            case 'lottery_hk':
                await sendGameInfo(chatId, '香港六合彩');
                break;
            case 'lottery_ca':
                await sendGameInfo(chatId, '加拿大28');
                break;
        }
    } catch (error) {
        console.error('处理按钮回调失败:', error);
    }
});

// 发送游戏信息
async function sendGameInfo(chatId, gameName) {
    const params = new URLSearchParams({
        game: gameName,
        source: 'button_click',
        timestamp: new Date().toISOString()
    });

    const webAppUrl = `${BASE_URL}?${params.toString()}`;

    const messageOptions = {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{
                    text: `🎮 进入${gameName}`,
                    web_app: {
                        url: webAppUrl
                    }
                }]
            ]
        }
    };

    await bot.sendMessage(
        chatId,
        `
🎯 <b>${gameName}</b>

💫 热门游戏推荐
🎁 新人福利优惠
💰 上分无需等待

<i>点击下方按钮立即开始！</i>`,
        messageOptions
    );
}
