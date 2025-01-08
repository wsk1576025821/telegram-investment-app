const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// 加载环境变量
dotenv.config();

// 配置
const config = {
    version: process.env.VERSION || '1.0.4',
    debug: process.env.DEBUG === 'true',
    baseUrl: "https://wsk1576025821.github.io/telegram-investment-app",
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    adminId: process.env.ADMIN_ID || "7036647707",
    lockFile: 'bot.lock'
};

// 日志工具
const logger = {
    debug: (...args) => config.debug && console.log('[Debug]', ...args),
    error: (...args) => console.error('[Error]', ...args),
    info: (...args) => console.log('[Info]', ...args)
};

// 进程锁管理
class ProcessLock {
    static checkAndCreate() {
        try {
            if (fs.existsSync(config.lockFile)) {
                const pid = fs.readFileSync(config.lockFile, 'utf8');
                try {
                    process.kill(parseInt(pid), 0);
                    logger.error(`Bot is already running with PID ${pid}`);
                    process.exit(1);
                } catch (e) {
                    fs.unlinkSync(config.lockFile);
                }
            }
            fs.writeFileSync(config.lockFile, process.pid.toString());
        } catch (error) {
            logger.error('Lock file handling error:', error);
        }
    }

    static remove() {
        try {
            fs.existsSync(config.lockFile) && fs.unlinkSync(config.lockFile);
        } catch (error) {
            logger.error('Error removing lock file:', error);
        }
    }
}

// URL 生成器
class UrlGenerator {
    static createWebAppUrl(userInfo) {
        const params = new URLSearchParams();
        const safeUserInfo = this.sanitizeUserInfo(userInfo);
        
        Object.entries(safeUserInfo).forEach(([key, value]) => {
            params.append(key, encodeURIComponent(value));
        });
        
        return `${config.baseUrl}?${params.toString()}`;
    }

    static sanitizeUserInfo(userInfo) {
        return {
            user_id: String(userInfo.user_id || ''),
            username: userInfo.username || 'anonymous',
            first_name: userInfo.first_name || '',
            last_name: userInfo.last_name || '',
            language: userInfo.language || 'zh',
            chat_id: String(userInfo.chat_id || ''),
            is_bot: String(userInfo.is_bot || false),
            is_premium: String(userInfo.is_premium || false),
            timestamp: userInfo.timestamp || new Date().toISOString()
        };
    }
}

// 键盘生成器
class KeyboardGenerator {
    static create(webAppUrl) {
        logger.debug('Creating keyboard with URL:', webAppUrl);
        
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
                        web_app: { 
                            url: webAppUrl,
                            parse_mode: 'HTML',
                            disable_web_page_preview: false,
                            protect_content: false
                        }
                    }],
                    ['📋 官方简介', '📁 分类'],
                    ['👤 我的', '💰 推广赚钱'],
                    ['🔥 广告投放', '❓ 帮助']
                ],
                resize_keyboard: true,
                one_time_keyboard: false
            }
        };
    }
}

// Bot 类
class TelegramInvestmentBot {
    constructor() {
        this.bot = new TelegramBot(config.botToken, {
            polling: {
                interval: 300,
                autoStart: true,
                params: { timeout: 10 }
            },
            webHook: false
        });
        
        this.setupEventHandlers();
        this.setupErrorHandling();
    }

    setupEventHandlers() {
        this.bot.onText(/\/start/, this.handleStart.bind(this));
        this.bot.on('message', this.handleMessage.bind(this));
    }

    setupErrorHandling() {
        this.bot.on('polling_error', this.handlePollingError.bind(this));
        process.on('SIGINT', this.handleShutdown.bind(this));
        process.on('exit', ProcessLock.remove);
    }

    async handleStart(msg) {
        try {
            const chatId = msg.chat.id;
            const user = msg.from;
            
            const userInfo = {
                user_id: String(user.id),
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                language: user.language_code,
                chat_id: String(chatId),
                is_bot: user.is_bot,
                is_premium: user.is_premium,
                timestamp: new Date().toISOString()
            };
            
            logger.debug('User info:', userInfo);
            
            const webAppUrl = UrlGenerator.createWebAppUrl(userInfo);
            const keyboard = KeyboardGenerator.create(webAppUrl);
            
            await this.bot.sendMessage(chatId, '欢迎使用投资平台！请点击下方按钮操作。', keyboard);
        } catch (error) {
            logger.error('Start command error:', error);
        }
    }

    async handleMessage(msg) {
        try {
            if (msg.web_app_data) {
                logger.debug('WebApp data received:', msg.web_app_data);
                return;
            }

            const chatId = msg.chat.id;
            const userInfo = {
                user_id: msg.from.id,
                username: msg.from.username,
                first_name: msg.from.first_name,
                last_name: msg.from.last_name,
                language: msg.from.language_code,
                chat_id: chatId,
                is_bot: msg.from.is_bot,
                is_premium: msg.from.is_premium,
                timestamp: new Date().toISOString()
            };

            const webAppUrl = UrlGenerator.createWebAppUrl(userInfo);
            const keyboard = KeyboardGenerator.create(webAppUrl);
            
            await this.bot.sendMessage(chatId, '请选择操作:', keyboard);
        } catch (error) {
            logger.error('Message handling error:', error);
        }
    }

    handlePollingError(error) {
        if (error.code === 'ETELEGRAM' && error.response?.statusCode === 409) {
            logger.info('Conflict detected, restarting polling...');
            this.bot.stopPolling()
                .then(() => setTimeout(() => this.bot.startPolling(), 1000))
                .catch(err => logger.error('Polling restart error:', err));
        } else {
            logger.error('Polling error:', error);
        }
    }

    async handleShutdown() {
        logger.info('Shutting down bot...');
        await this.bot.stopPolling();
        ProcessLock.remove();
        process.exit(0);
    }
}

// 启动 bot
ProcessLock.checkAndCreate();
const bot = new TelegramInvestmentBot();
logger.info('Bot is running...'); 
