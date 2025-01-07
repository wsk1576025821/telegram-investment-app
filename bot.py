from telegram.ext import Updater, CommandHandler, MessageHandler, Filters
import json
import logging

# 设置日志
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.DEBUG
)
logger = logging.getLogger(__name__)

# Bot Token
TOKEN = "7582221284:AAGvtmNC5RmjSRcumethqzgWPkSTJRYHxQg"
# 管理员 ID
ADMIN_ID = "7036647707"

def start(update, context):
    """处理 /start 命令"""
    # 添加按钮到消息
    keyboard = {
        "inline_keyboard": [
            [{
                "text": "打开投资平台",
                "web_app": {
                    "url": "https://wsk1576025821.github.io/telegram-investment-app/"
                }
            }]
        ]
    }
    
    update.message.reply_text(
        "👋 欢迎使用投资平台机器人!\n"
        "点击下方按钮开始投资。",
        reply_markup=json.dumps(keyboard)
    )

def handle_message(update, context):
    """处理所有消息"""
    try:
        # 记录所有收到的消息
        logger.info(f"Received message type: {type(update.message)}")
        
        # 检查是否是数字按钮点击
        if update.message.text and update.message.text.isdigit():
            number = int(update.message.text)
            if 1 <= number <= 20:
                # 处理数字按钮点击
                handle_number_click(update, context, number)
                return
        
        # 其他消息处理保持不变...
        
    except Exception as e:
        logger.error(f"Error processing message: {e}", exc_info=True)

def handle_number_click(update, context, number):
    """处理数字按钮点击"""
    message = (
        f"🎯 您选择了选项 {number}\n"
        f"⏳ 正在处理您的请求...\n"
        f"📞 客服稍后会与您联系"
    )
    update.message.reply_text(message)

def error_handler(update, context):
    """处理错误"""
    logger.error(f"Update {update} caused error {context.error}")

def main():
    """启动机器人"""
    updater = Updater(TOKEN, use_context=True)
    dp = updater.dispatcher
    
    # 添加处理程序
    dp.add_handler(CommandHandler("start", start))
    # 使用通用消息处理器替代特定的 web_app_data 处理器
    dp.add_handler(MessageHandler(Filters.all, handle_message))
    
    # 错误处理
    dp.add_error_handler(error_handler)
    
    # 启动机器人
    updater.start_polling()
    logger.info("Bot started...")
    print("Bot is running! Press Ctrl+C to stop.")
    print("Send a message to the bot to get your Telegram ID")
    updater.idle()

if __name__ == '__main__':
    main()
