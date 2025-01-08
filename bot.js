const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// Bot Token
const token = process.env.TELEGRAM_BOT_TOKEN || '7582221284:AAGvtmNC5RmjSRcumethqzgWPkSTJRYHxQg';
const adminId = "7036647707";

// 创建 bot 实例
const bot = new TelegramBot(token, { polling: true });

// 基础 URL
const BASE_URL = "https://wsk1576025821.github.io/telegram-investment-app";

// 创建键盘布局
const getKeyboard = (webAppUrl) => {
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

// 处理 /start 命令
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const user = msg.from;
    
    // 构建用户信息
    const userInfo = {
        user_id: user.id,
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        language: user.language_code || ''
    };
    
    // 创建 WebApp URL
    const webAppUrl = `${BASE_URL}?${new URLSearchParams(userInfo).toString()}`;
    
    // 用户信息文本
    const userInfoText = `👤 用户信息:
ID: ${user.id}
用户名: @${user.username || '无'}
姓名: ${user.first_name} ${user.last_name || ''}
语言: ${user.language_code || '未知'}`;
    
    // 发送欢迎消息
    const welcomeMessage = `👋 欢迎使用投资平台机器人!
🎯 请点击下方按钮选择功能
💡 提示: 点击数字按钮查看详细信息

${userInfoText}`;
    
    await bot.sendMessage(chatId, welcomeMessage, getKeyboard(webAppUrl));
    
    // 通知管理员
    if (adminId) {
        const adminMessage = `新用户开始使用机器人:\n${userInfoText}`;
        await bot.sendMessage(adminId, adminMessage);
    }
});

// 处理消息
bot.on('message', async (msg) => {
    try {
        if (msg.web_app_data) return; // 忽略 WebApp 数据
        
        const chatId = msg.chat.id;
        const user = msg.from;
        const text = msg.text;
        
        // 构建用户信息
        const userInfo = {
            user_id: user.id,
            username: user.username || '',
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            language: user.language_code || '',
            button_type: text?.match(/^\d+$/) ? 'number' : 'text',
            button_value: text || '',
            timestamp: new Date().toISOString(),
            chat_id: chatId,
            is_bot: user.is_bot || false,
            is_premium: user.is_premium || false
        };

        console.log('1111111111111111111111111', userInfo)

        // 创建 WebApp URL 并添加所有用户信息
        const webAppUrl = `${BASE_URL}?${new URLSearchParams(userInfo).toString()}`;

        // 处理数字按钮
        if (text?.match(/^\d+$/)) {
            const number = parseInt(text);
            if (number >= 1 && number <= 20) {
                const message = `🎯 您选择了选项 ${number}
⏳ 正在处理您的请求...
📞 客服稍后会与您联系

${JSON.stringify(userInfo, null, 2)}`;
                
                await bot.sendMessage(chatId, message);
                
                // 通知管理员
                if (adminId) {
                    const adminMessage = `🔔 用户点击了选项 ${number}

${JSON.stringify(userInfo, null, 2)}
📅 时间: ${new Date().toLocaleString()}`;
                    await bot.sendMessage(adminId, adminMessage);
                }
                return;
            }
        }

        // 处理其他按钮
        let messageText = '';
        switch (text) {
            case '购买广告':
                messageText = '🔥 购买广告请联系客服';
                break;
            case 'IM体育':
                messageText = '🏆 IM体育详情请联系客服';
                break;
            case '官方简介':
                messageText = '📋 官方简介\n\n这是一个专业的投资理财平台...';
                break;
            case '分类':
                messageText = '📁 分类信息\n\n1. 体育投资\n2. 棋牌游戏\n3. 电子竞技';
                break;
            // ... 其他按钮处理
        }

        if (messageText) {
            await bot.sendMessage(chatId, `${messageText}\n\n${JSON.stringify(userInfo, null, 2)}`);
            
            // 通知管理员
            if (adminId) {
                const adminMessage = `🔔 用户点击了: ${text}

${JSON.stringify(userInfo, null, 2)}
📅 时间: ${new Date().toLocaleString()}`;
                await bot.sendMessage(adminId, adminMessage);
            }
        }
        
    } catch (error) {
        console.error('Error handling message:', error);
    }
});

// 错误处理
bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});

console.log('Bot is running...'); 
