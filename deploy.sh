#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 设置 TOKEN
export TELEGRAM_BOT_TOKEN="7582221284:AAGvtmNC5RmjSRcumethqzgWPkSTJRYHxQg"

echo -e "${GREEN}开始部署流程...${NC}"

# 1. Git 操作
echo -e "${YELLOW}执行 Git 操作...${NC}"
git add .
git commit -m "feat: Update Telegram bot

Changes:
- Added user info to all responses
- Improved message formatting
- Enhanced admin notifications
- Fixed category display issue
- Optimized code structure"

# 2. 推送到远程仓库
echo -e "${YELLOW}推送到远程仓库...${NC}"
git push -u origin main

# 3. 安装/更新依赖
echo -e "${YELLOW}安装/更新依赖...${NC}"
pip install -r requirements.txt

# 4. 重启 bot 服务
echo -e "${YELLOW}重启 bot 服务...${NC}"
# 检查是否有运行中的 bot 进程
if pgrep -f "python bot.py" > /dev/null; then
    echo "停止现有 bot 进程..."
    pkill -f "python bot.py"
fi

# 在后台启动 bot
nohup python bot.py > bot.log 2>&1 &

echo -e "${GREEN}部署完成!${NC}"
echo -e "Bot 日志文件: bot.log" 
