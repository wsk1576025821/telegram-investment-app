from telegram.ext import Updater, CommandHandler, MessageHandler, Filters
import json
import logging

# 设置日志
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Bot Token
TOKEN = "7582221284:AAGvtmNC5RmjSRcumethqzgWPkSTJRYHxQg"
# 管理员 ID (先设置一个默认值，您可以稍后替换为您的 Telegram ID)
ADMIN_ID = "7036647707"

def start(update, context):
    """处理 /start 命令"""
    update.message.reply_text(
        "👋 欢迎使用投资平台机器人!\n"
        "点击下方按钮开始投资。"
    )

def handle_webapp_data(update, context):
    """处理从 Web App 收到的数据"""
    try:
        # 记录用户ID（这将帮助您获取自己的ID）
        user_id = update.effective_user.id
        logger.info(f"Received request from user ID: {user_id}")
        
        # 解析从 Web App 收到的数据
        data = json.loads(update.message.web_app_data.data)
        
        # 获取投资信息
        investment = data['investment']
        user = data['user']
        
        # 发送通知给用户
        message = (
            f"✅ 投资申请已收到\n\n"
            f"📊 项目: {investment['title']}\n"
            f"💰 收益率: {investment['returnRate']}\n"
            f"⏱ 期限: {investment['period']}\n"
            f"💵 最低投资: {investment['minAmount']}元\n\n"
            f"请等待客服联系您确认投资详情。"
        )
        context.bot.send_message(
            chat_id=update.effective_user.id,
            text=message
        )
        
        # 发送通知给管理员
        admin_message = (
            f"🔔 新投资申请\n\n"
            f"👤 用户: {user['first_name']} (@{user['username']})\n"
            f"📊 项目: {investment['title']}\n"
            f"💰 收益率: {investment['returnRate']}\n"
            f"⏱ 期限: {investment['period']}\n"
            f"💵 最低投资: {investment['minAmount']}元"
        )
        # 如果设置了管理员ID，发送通知
        if ADMIN_ID != "YOUR_TELEGRAM_ID":
            context.bot.send_message(
                chat_id=ADMIN_ID,
                text=admin_message
            )
        
    except Exception as e:
        logger.error(f"Error processing webapp data: {e}")
        context.bot.send_message(
            chat_id=update.effective_user.id,
            text="处理您的请求时出现错误，请稍后重试。"
        )

def error_handler(update, context):
    """处理错误"""
    logger.error(f"Update {update} caused error {context.error}")

def main():
    """启动机器人"""
    updater = Updater(TOKEN, use_context=True)
    dp = updater.dispatcher
    
    # 添加处理程序
    dp.add_handler(CommandHandler("start", start))
    dp.add_handler(MessageHandler(Filters.web_app_data, handle_webapp_data))
    
    # 错误处理
    dp.add_error_handler(error_handler)
    
    # 启动机器人
    updater.start_polling()
    logger.info("Bot started...")
    # 打印提示信息
    print("Bot is running! Press Ctrl+C to stop.")
    print("Send a message to the bot to get your Telegram ID")
    updater.idle()

if __name__ == '__main__':
    main() 
