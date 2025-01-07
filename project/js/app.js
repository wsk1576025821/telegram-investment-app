let tg = window.Telegram.WebApp;

// 初始化 Telegram Mini App
tg.ready();

// 展开 Web App 到全屏
tg.expand();

// 主题颜色相关设置
document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor);
document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor);

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

// 更新统计数据
document.getElementById('online-count').textContent = mockData.onlineCount;
document.getElementById('member-count').textContent = mockData.memberCount;

// 开始按钮点击事件
document.getElementById('start-button').addEventListener('click', function() {
    this.style.display = 'none';
    document.getElementById('investment-list').style.display = 'flex';
    renderInvestments();
});

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
        
        item.addEventListener('click', () => {
            tg.showPopup({
                title: investment.title,
                message: `确认投资该项目？\n收益率: ${investment.returnRate}\n期限: ${investment.period}`,
                buttons: [{
                    type: 'ok',
                    text: '确认投资'
                }, {
                    type: 'cancel',
                    text: '取消'
                }]
            });
        });
        
        investmentList.appendChild(item);
    });
} 
