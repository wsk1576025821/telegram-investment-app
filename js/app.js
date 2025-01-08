console.log('App.js loaded from:', window.location.href);
console.log('Telegram WebApp available:', !!window.Telegram?.WebApp);
console.log('Current URL:', window.location.href);
console.log('Search params:', window.location.search);

// 初始化 Telegram WebApp
let tg = window.Telegram?.WebApp;

// 等待 WebApp 完全初始化
function initializeWebApp() {
    return new Promise((resolve) => {
        if (!tg) {
            console.error('Telegram WebApp not available');
            document.body.innerHTML = '<div style="padding: 20px; text-align: center;">请在 Telegram 中打开此页面</div>';
            return;
        }

        // 确保 WebApp 已准备就绪
        if (tg.initDataUnsafe) {
            resolve();
        } else {
            tg.onEvent('viewportChanged', () => {
                if (tg.initDataUnsafe) {
                    resolve();
                }
            });
            
            // 设置超时，防止无限等待
            setTimeout(resolve, 1000);
        }
    });
}

// 修改 debugWebAppUrl 函数
async function debugWebAppUrl() {
    await initializeWebApp();
    
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    // 准备调试信息
    const debugText = `
WebApp URL Info:
----------------
URL: ${window.location.href}
Search: ${window.location.search}
Platform: ${tg?.platform || 'unknown'}
Version: ${tg?.version || 'unknown'}
Time: ${new Date().toISOString()}
    `.trim();

    // 创建按钮容器
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        padding: 10px;
        background: rgba(255, 255, 255, 0.9);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;

    // 创建调试按钮
    const debugButton = document.createElement('button');
    debugButton.textContent = '📋 复制当前 URL';
    debugButton.style.cssText = `
        padding: 8px 16px;
        background: #2196F3;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        margin: 5px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;
    
    debugButton.onclick = () => {
        try {
            // 直接复制 URL
            navigator.clipboard.writeText(window.location.href)
                .then(() => {
                    tg.showAlert(`URL 已复制到剪贴板:\n${window.location.href}`);
                })
                .catch(err => {
                    console.error('Copy failed:', err);
                    // 使用备用方法
                    const textarea = document.createElement('textarea');
                    textarea.value = window.location.href;
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    tg.showAlert('URL 已复制到剪贴板');
                });
        } catch (error) {
            console.error('Error copying URL:', error);
            tg.showAlert('复制失败，请重试');
        }
    };

    // 添加按钮到容器
    buttonContainer.appendChild(debugButton);
    document.body.insertBefore(buttonContainer, document.body.firstChild);

    // 调整页面内容的上边距
    const container = document.querySelector('.container');
    if (container) {
        container.style.marginTop = '50px';
    }
}

// 在 DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 等待 WebApp 初始化
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready(() => {
            console.log('WebApp ready event triggered');
            debugWebAppUrl();
        });
    } else {
        debugWebAppUrl();
    }
});

// 初始化 Telegram Mini App
tg.ready();

// 展开 Web App 到全屏
tg.expand();

// 确保在 DOM 加载完成后立即显示用户信息
document.addEventListener('DOMContentLoaded', () => {
    // 立即显示用户信息
    showCurrentUrl();
    
    // 初始化其他内容
    initializePage();
});

// 在 Telegram WebApp 准备就绪后再次检查
tg.ready(() => {
    showCurrentUrl();
});

// 设置主题颜色
tg.setHeaderColor('secondary_bg_color'); // 设置头部颜色
tg.setBackgroundColor('secondary_bg_color'); // 设置背景颜色

// 强制刷新缓存的版本号
const version = '1.0.3';

// 主题颜色相关设置
document.documentElement.style.setProperty('--tg-theme-bg-color', '#ffffff');
document.documentElement.style.setProperty('--tg-theme-text-color', '#333333');
document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', '#ffffff');

// 检测设备类型
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// 模拟数据
const mockData = {
    onlineCount: 119,
    memberCount: 376,
    investments: [
        {
            id: 1,
            title: "投资项目 A",
            returnRate: "15%",
            period: "30天",
            minAmount: "1000"
        },
        {
            id: 2,
            title: "投资项目 B",
            returnRate: "12%",
            period: "15天",
            minAmount: "500"
        }
    ]
};

// 清除旧的内容
document.getElementById('investment-list').innerHTML = '';

// 更新统计数据
document.getElementById('online-count').textContent = mockData.onlineCount;
document.getElementById('member-count').textContent = mockData.memberCount;

// 渲染投资列表
function renderInvestments() {
    const investmentList = document.getElementById('investment-list');
    mockData.investments.forEach(investment => {
        const item = document.createElement('div');
        item.className = 'investment-item';
        item.innerHTML = `
            <div class="investment-title">${investment.title}</div>
            <div class="investment-details">
                <div>收益率: ${investment.returnRate}</div>
                <div>投资期限: ${investment.period}</div>
                <div>最低投资: ${investment.minAmount}元</div>
            </div>
        `;
        
        // 针对移动端优化点击事件
        if (isMobile) {
            let touchStartTime;
            item.addEventListener('touchstart', () => {
                touchStartTime = Date.now();
            });
            
            item.addEventListener('touchend', (e) => {
                const touchDuration = Date.now() - touchStartTime;
                if (touchDuration < 200) { // 仅响应快速点击
                    handleInvestmentClick(investment);
                }
            });
        } else {
            item.addEventListener('click', () => {
                handleInvestmentClick(investment);
            });
        }
        
        investmentList.appendChild(item);
    });
}

// 获取 URL 参数和 Telegram WebApp 用户信息
function getUrlParams() {
    try {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        
        // 遍历并解码所有参数
        for (const [key, value] of params.entries()) {
            try {
                const decodedValue = decodeURIComponent(value);
                // 不要返回 'undefined' 或 'null' 字符串
                result[key] = decodedValue === 'undefined' || decodedValue === 'null' ? '' : decodedValue;
            } catch (e) {
                console.error(`Error decoding parameter ${key}:`, e);
                result[key] = value;
            }
        }
        
        // 如果 URL 参数为空，尝试从 Telegram WebApp 获取
        if (!result.user_id && window.Telegram?.WebApp?.initDataUnsafe?.user) {
            const user = window.Telegram.WebApp.initDataUnsafe.user;
            result.user_id = String(user.id);
            result.username = user.username || 'anonymous';
            result.first_name = user.first_name || '';
            result.last_name = user.last_name || '';
            result.language = user.language_code || 'zh';
        }
        
        console.log('Final parsed parameters:', result);
        return result;
    } catch (error) {
        console.error('Error parsing URL parameters:', error);
        return {};
    }
}

// 初始化时获取用户信息
const userParams = getUrlParams();
console.log('User params:', userParams);

// 在初始化时显示当前 URL
function showCurrentUrl() {
    try {
        const urlDisplay = document.getElementById('url-display');
        if (!urlDisplay) {
            console.warn('URL display element not found, creating one...');
            const div = document.createElement('div');
            div.id = 'url-display';
            div.className = 'url-display';
            document.body.insertBefore(div, document.body.firstChild);
            return setTimeout(showCurrentUrl, 100);
        }

        const params = getUrlParams();
        console.log('Displaying user info:', params);
        
        const userParamsHtml = `
            <div class="section">
                <div class="label">用户信息:</div>
                <div class="param-group">
                    <div><span class="param-name">用户ID:</span> <span class="param-value">${params.user_id || '未知'}</span></div>
                    <div><span class="param-name">用户名:</span> <span class="param-value">${params.username !== 'anonymous' ? params.username : '未设置'}</span></div>
                    <div><span class="param-name">姓名:</span> <span class="param-value">${[params.first_name, params.last_name].filter(Boolean).join(' ') || '未设置'}</span></div>
                    <div><span class="param-name">语言:</span> <span class="param-value">${params.language || '未设置'}</span></div>
                    <div><span class="param-name">聊天ID:</span> <span class="param-value">${params.chat_id || '未设置'}</span></div>
                    <div><span class="param-name">是否机器人:</span> <span class="param-value">${params.is_bot === 'true' ? '是' : '否'}</span></div>
                    <div><span class="param-name">是否高级用户:</span> <span class="param-value">${params.is_premium === 'true' ? '是' : '否'}</span></div>
                </div>
            </div>
        `;
        
        urlDisplay.innerHTML = userParamsHtml;
    } catch (error) {
        console.error('Error in showCurrentUrl:', error);
    }
}

// 初始化页面
function initializePage() {
    try {
        // 显示当前 URL
        showCurrentUrl();
        
        // 获取投资列表容器
        const investmentList = document.getElementById('investment-list');
        if (!investmentList) {
            console.warn('Investment list container not found, creating one...');
            const div = document.createElement('div');
            div.id = 'investment-list';
            div.className = 'investment-list';
            document.querySelector('.container').appendChild(div);
        }
        
        // 渲染投资列表
        renderInvestments();
        
    } catch (error) {
        console.error('Error initializing page:', error);
    }
}

// 处理投资点击事件
function handleInvestmentClick(investment) {
    console.log('Investment clicked:', investment);
    
    tg.MainButton.setText('确认投资');
    tg.MainButton.show();
    
    window.selectedInvestment = investment;
    
    tg.MainButton.onClick(() => {
        try {
            // 合并 URL 参数和 tg.initDataUnsafe 中的用户信息
            const userData = {
                id: userParams.userId || tg.initDataUnsafe?.user?.id || String(Date.now()),
                username: userParams.username || tg.initDataUnsafe?.user?.username || 'unknown',
                first_name: userParams.firstName || tg.initDataUnsafe?.user?.first_name || 'unknown',
                last_name: userParams.lastName || tg.initDataUnsafe?.user?.last_name || '',
                language: userParams.language || tg.initDataUnsafe?.user?.language_code || 'unknown'
            };
            
            const data = {
                action: 'invest',
                investment: investment,
                user: userData,
                timestamp: new Date().toISOString()
            };
            
            console.log('Sending data:', data);
            tg.sendData(JSON.stringify(data));
            
            tg.MainButton.hide();
            tg.showAlert('投资申请已提交，请等待审核');
        } catch (error) {
            console.error('Error in handleInvestmentClick:', error);
            tg.showAlert('发送数据时出错: ' + error.message);
        }
    });
}

// 清理函数
window.addEventListener('unload', () => {
    if (tg.MainButton.isVisible) {
        tg.MainButton.hide();
    }
});

// 在文件顶部添加 URL 检查函数
function checkWebAppUrl() {
    console.log('========== WebApp URL Check ==========');
    console.log('1. Full URL:', window.location.href);
    console.log('2. Search string:', window.location.search);
    console.log('3. Hash:', window.location.hash);
    
    // 解析 URL 参数
    const params = new URLSearchParams(window.location.search);
    console.log('4. All parameters:');
    for (const [key, value] of params.entries()) {
        console.log(`   ${key}: ${value}`);
    }
    
    // 检查关键参数
    const criticalParams = ['user_id', 'username', 'first_name'];
    console.log('5. Critical parameters check:');
    criticalParams.forEach(param => {
        console.log(`   ${param}: ${params.get(param) || 'MISSING'}`);
    });
    
    // 检查 Telegram WebApp 数据
    console.log('6. Telegram WebApp data:');
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        console.log('   WebApp initialized:', !!tg);
        console.log('   Platform:', tg.platform);
        console.log('   Version:', tg.version);
        console.log('   Init data:', tg.initData);
        if (tg.initDataUnsafe?.user) {
            console.log('   User data available:', {
                id: tg.initDataUnsafe.user.id,
                username: tg.initDataUnsafe.user.username,
                first_name: tg.initDataUnsafe.user.first_name
            });
        } else {
            console.log('   No user data in WebApp');
        }
    } else {
        console.log('   WebApp not available');
    }
    console.log('====================================');
}

// 在多个地方调用检查
// 1. 页面加载时
document.addEventListener('DOMContentLoaded', checkWebAppUrl);

// 2. Telegram WebApp 准备就绪时
if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready(() => {
        console.log('WebApp ready event triggered');
        checkWebAppUrl();
    });
}

// 3. 在 URL 发生变化时
window.addEventListener('popstate', checkWebAppUrl); 
