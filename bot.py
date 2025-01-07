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
        logger.info(f"Message attributes: {dir(update.message)}")
        
        # 检查是否是 web app 数据
        if hasattr(update.message, 'web_app_data'):
            # 记录用户ID和数据
            user_id = update.effective_user.id
            logger.info(f"Received web app data from user ID: {user_id}")
            
            try:
                # 解析从 Web App 收到的数据
                data = json.loads(update.message.web_app_data.data)
                logger.info(f"Successfully parsed data: {data}")
            except json.JSONDecodeError as e:
                logger.error(f"JSON decode error: {e}")
                logger.error(f"Raw data: {update.message.web_app_data.data}")
                raise
            
            # 获取投资信息
            investment = data.get('investment', {})
            user = data.get('user', {})
            
            logger.info(f"Processing investment: {investment}")
            logger.info(f"User info: {user}")
            
            # 发送通知给用户
            message = (
                f"✅ 投资申请已收到\n\n"
                f"📊 项目: {investment.get('title', 'N/A')}\n"
                f"💰 收益率: {investment.get('returnRate', 'N/A')}\n"
                f"⏱ 期限: {investment.get('period', 'N/A')}\n"
                f"💵 最低投资: {investment.get('minAmount', 'N/A')}元\n\n"
                f"请等待客服联系您确认投资详情。"
            )
            
            try:
                sent_message = context.bot.send_message(
                    chat_id=user_id,
                    text=message
                )
                logger.info(f"Message sent to user: {sent_message}")
            except Exception as e:
                logger.error(f"Error sending message to user: {e}")
                raise
            
            # 发送通知给管理员
            admin_message = (
                f"🔔 新投资申请\n\n"
                f"👤 用户: {user.get('first_name', 'N/A')} (@{user.get('username', 'N/A')})\n"
                f"📊 项目: {investment.get('title', 'N/A')}\n"
                f"💰 收益率: {investment.get('returnRate', 'N/A')}\n"
                f"⏱ 期限: {investment.get('period', 'N/A')}\n"
                f"💵 最低投资: {investment.get('minAmount', 'N/A')}元"
            )
            
            try:
                sent_admin_message = context.bot.send_message(
                    chat_id=ADMIN_ID,
                    text=admin_message
                )
                logger.info(f"Message sent to admin: {sent_admin_message}")
            except Exception as e:
                logger.error(f"Error sending message to admin: {e}")
                raise
                
        else:
            # 如果不是 web app 数据，记录消息类型
            logger.info("Received regular message")
            
    except Exception as e:
        logger.error(f"Error processing message: {e}", exc_info=True)
        # 发送错误消息给用户
        if update and update.effective_user:
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
