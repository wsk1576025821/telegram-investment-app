let tg = window.Telegram.WebApp;

// 初始化 Telegram Mini App
tg.ready();

// 展开 Web App 到全屏
tg.expand();

// 强制刷新缓存的版本号
const version = '1.0.1';

// 主题颜色相关设置
document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor);
document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor);

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
    return {
        userId: params.get('user_id'),
        username: params.get('username'),
        firstName: params.get('first_name'),
        lastName: params.get('last_name'),
        language: params.get('language')
    };
}

// 初始化时获取用户信息
const userParams = getUrlParams();
console.log('User params:', userParams);

// 在初始化时显示当前 URL
function showCurrentUrl() {
    // 创建或获取显示 URL 的元素
    let urlDisplay = document.getElementById('url-display');
    if (!urlDisplay) {
        urlDisplay = document.createElement('div');
        urlDisplay.id = 'url-display';
        urlDisplay.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            right: 10px;
            padding: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border-radius: 5px;
            font-size: 12px;
            word-break: break-all;
            z-index: 1000;
        `;
        document.body.appendChild(urlDisplay);
    }
    
    // 显示完整 URL
    const fullUrl = window.location.href;
    urlDisplay.innerHTML = `
        <div>Current URL:</div>
        <div style="margin-top: 5px;">${fullUrl}</div>
    `;
    
    // 显示解析后的参数
    const params = getUrlParams();
    const paramsHtml = Object.entries(params)
        .map(([key, value]) => `<div>${key}: ${value || 'not set'}</div>`)
        .join('');
    
    urlDisplay.innerHTML += `
        <div style="margin-top: 10px;">Parameters:</div>
        <div style="margin-top: 5px;">${paramsHtml}</div>
    `;
}

// 显示当前 URL
showCurrentUrl();

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

// 初始化页面
renderInvestments();

// 清理函数
window.addEventListener('unload', () => {
    if (tg.MainButton.isVisible) {
        tg.MainButton.hide();
    }
}); 
