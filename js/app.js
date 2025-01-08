// 配置
const config = {
    version: '1.0.4',
    debug: true,
    theme: {
        bgColor: '#ffffff',
        textColor: '#333333',
        secondaryBgColor: '#ffffff'
    },
    isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
};

// 日志工具
const logger = {
    debug: (...args) => config.debug && console.log('[Debug]', ...args),
    error: (...args) => console.error('[Error]', ...args),
    info: (...args) => console.log('[Info]', ...args)
};

// 初始化 Telegram WebApp
let tg = window.Telegram?.WebApp;

// WebApp 初始化
class WebAppInitializer {
    static async init() {
        logger.debug('Initializing WebApp...');
        
        if (!tg) {
            logger.error('Telegram WebApp not available');
            UI.showError('请在 Telegram 中打开此页面');
            return false;
        }

        try {
            await this.waitForInitialization();
            this.setupTheme();
            this.expandWebApp();
            return true;
        } catch (error) {
            logger.error('WebApp initialization failed:', error);
            return false;
        }
    }

    static waitForInitialization() {
        return new Promise((resolve) => {
            if (tg.initDataUnsafe) {
                resolve();
            } else {
                tg.onEvent('viewportChanged', () => {
                    if (tg.initDataUnsafe) resolve();
                });
                setTimeout(resolve, 1000);
            }
        });
    }

    static setupTheme() {
        document.documentElement.style.setProperty('--tg-theme-bg-color', config.theme.bgColor);
        document.documentElement.style.setProperty('--tg-theme-text-color', config.theme.textColor);
        document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', config.theme.secondaryBgColor);
        
        tg.setHeaderColor('secondary_bg_color');
        tg.setBackgroundColor('secondary_bg_color');
    }

    static expandWebApp() {
        tg.ready();
        tg.expand();
    }
}

// UI 组件类
class UI {
    static showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 20px;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            text-align: center;
            z-index: 10000;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
    }

    static createUrlDebugger(urlInfo) {
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            padding: 10px;
            background: rgba(255, 255, 255, 0.95);
            z-index: 10000;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        `;

        const copyButton = document.createElement('button');
        copyButton.textContent = '📋 复制 URL';
        copyButton.style.cssText = `
            padding: 8px 16px;
            background: #2196F3;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
        `;
        
        copyButton.onclick = () => this.copyToClipboard(urlInfo.url);
        container.appendChild(copyButton);
        
        return container;
    }

    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            tg.showAlert(`URL 已复制:\n${text}`);
        } catch (err) {
            logger.error('Copy failed:', err);
            this.fallbackCopy(text);
        }
    }

    static fallbackCopy(text) {
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            tg.showAlert('URL 已复制');
        } catch (error) {
            logger.error('Fallback copy failed:', error);
            tg.showAlert('复制失败，请重试');
        }
    }

    static adjustLayout() {
        const container = document.querySelector('.container');
        if (container) {
            container.style.marginTop = '60px';
        }
    }
}

// 应用主类
class App {
    static async initialize() {
        logger.info('App initialization started');
        
        try {
            const initialized = await WebAppInitializer.init();
            if (!initialized) return;

            const urlInfo = {
                url: window.location.href,
                search: window.location.search,
                platform: tg?.platform || 'unknown',
                version: tg?.version || 'unknown',
                time: new Date().toISOString()
            };

            logger.debug('URL Info:', urlInfo);

            const debuggerUI = UI.createUrlDebugger(urlInfo);
            document.body.insertBefore(debuggerUI, document.body.firstChild);
            UI.adjustLayout();

            logger.info('App initialization completed');
        } catch (error) {
            logger.error('App initialization failed:', error);
            UI.showError('应用初始化失败');
        }
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => App.initialize()); 
