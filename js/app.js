let tg = window.Telegram.WebApp;

// 初始化 Telegram Mini App
tg.ready();

// 展开 Web App 到全屏
tg.expand();

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

// 获取 URL 参数
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    
    // 遍历所有参数并打印用于调试
    for (const [key, value] of params.entries()) {
        console.log(`Parameter ${key}:`, value);
        result[key] = value;
    }
    
    // 也打印整个 URL 用于调试
    console.log('Full URL:', window.location.href);
    return result;
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
        
        // 获取并显示参数
        const params = getUrlParams();
        console.log('Parsed parameters:', params);

        // 显示完整 URL
        const fullUrl = window.location.href;
        let html = `
            <div class="section">
                <div class="label">当前 URL:</div>
                <div class="value">${fullUrl}</div>
            </div>
        `;
        
        // 显示用户参数
        const userParamsHtml = `
            <div class="section">
                <div class="label">用户信息:</div>
                <div class="param-group">
                    <div><span class="param-name">用户ID:</span> <span class="param-value">${params.user_id || '未设置'}</span></div>
                    <div><span class="param-name">用户名:</span> <span class="param-value">${params.username || '未设置'}</span></div>
                    <div><span class="param-name">姓名:</span> <span class="param-value">${params.first_name} ${params.last_name || ''}</span></div>
                    <div><span class="param-name">语言:</span> <span class="param-value">${params.language || '未设置'}</span></div>
                    <div><span class="param-name">聊天ID:</span> <span class="param-value">${params.chat_id || '未设置'}</span></div>
                    <div><span class="param-name">是否机器人:</span> <span class="param-value">${params.is_bot === 'true' ? '是' : '否'}</span></div>
                    <div><span class="param-name">是否高级用户:</span> <span class="param-value">${params.is_premium === 'true' ? '是' : '否'}</span></div>
                </div>
            </div>
        `;
        
        html += userParamsHtml;
        urlDisplay.innerHTML = html;
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

// 在 DOM 加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}

// 在 Telegram WebApp 准备就绪后执行
tg.ready(() => {
    // 获取 URL 参数
    const params = getUrlParams();
    console.log('WebApp initialized with params:', params);

    // 显示参数
    showCurrentUrl();

    // 设置主按钮
    tg.MainButton.setText('确认信息');
    tg.MainButton.onClick(() => {
        try {
            // 准备要发送回 bot 的数据
            const data = {
                action: 'webapp_response',
                params: params,
                timestamp: new Date().toISOString()
            };

            // 发送数据回 bot
            tg.sendData(JSON.stringify(data));
            
            // 关闭 WebApp
            tg.close();
        } catch (error) {
            console.error('Error sending data:', error);
            tg.showAlert('发送数据时出错: ' + error.message);
        }
    });
    tg.MainButton.show();
});

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
