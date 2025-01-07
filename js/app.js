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

// 处理投资点击事件
function handleInvestmentClick(investment) {
    // 使用 MainButton 替代 showPopup
    tg.MainButton.setText('确认投资');
    tg.MainButton.show();
    
    // 存储当前选中的投资项目
    window.selectedInvestment = investment;
    
    // 添加主按钮点击事件
    tg.MainButton.onClick(() => {
        // 这里可以处理确认投资的逻辑
        tg.sendData(JSON.stringify({
            action: 'invest',
            investment: investment
        }));
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
