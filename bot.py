from telegram import ReplyKeyboardMarkup, KeyboardButton
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
    # 创建自定义键盘
    keyboard = [
        ['1', '2', '3', '4', '5', '6', '7'],
        ['8', '9', '10', '11', '12', '13', '14'],
        ['15', '16', '17', '18', '19', '20'],
        ['🔥 购买广告', '➡️ 下一页'],
        ['🔥 IM体育: 1个有效即享55%-70%-可...'],
        ['🎭升元棋牌❤️ 贷盈利70%分成招商❤️...'],
        ['🏠注册送138🎲百家乐/棋牌/电竞体育...'],
        ['📋 官方简介', '📁 分类'],
        ['👤 我的', '💰 推广赚钱'],
        ['🔥 广告投放', '❓ 帮助']
    ]
    
    # 创建 ReplyKeyboardMarkup
    reply_markup = ReplyKeyboardMarkup(
        keyboard,
        resize_keyboard=True,
        one_time_keyboard=False,
        input_field_placeholder="请选择功能或输入消息"
    )
    
    update.message.reply_text(
        "👋 欢迎使用投资平台机器人!\n"
        "🎯 请点击下方按钮选择功能\n"
        "💡 提示: 点击数字按钮查看详细信息",
        reply_markup=reply_markup
    )

def handle_message(update, context):
    """处理所有消息"""
    try:
        # 记录所有收到的消息
        logger.info(f"Received message: {update.message.text}")
        
        # 检查是否是数字按钮点击
        if update.message.text and update.message.text.isdigit():
            number = int(update.message.text)
            if 1 <= number <= 20:
                handle_number_click(update, context, number)
                return
        
        # 处理其他按钮点击
        if update.message.text:
            if "购买广告" in update.message.text:
                handle_ad_click(update, context)
            elif "IM体育" in update.message.text:
                handle_sport_click(update, context)
            elif "官方简介" in update.message.text:
                handle_intro_click(update, context)
            elif "分类" in update.message.text:
                handle_category_click(update, context)
            elif "我的" in update.message.text:
                handle_profile_click(update, context)
            elif "推广赚钱" in update.message.text:
                handle_promotion_click(update, context)
            elif "广告投放" in update.message.text:
                handle_ad_post_click(update, context)
            elif "帮助" in update.message.text:
                handle_help_click(update, context)
        
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

# 添加其他按钮处理函数
def handle_ad_click(update, context):
    update.message.reply_text("🔥 购买广告请联系客服")

def handle_sport_click(update, context):
    update.message.reply_text("🏆 IM体育详情请联系客服")

def handle_intro_click(update, context):
    update.message.reply_text("📋 官方简介\n\n这是一个专业的投资理财平台...")

def handle_category_click(update, context):
    update.message.reply_text("📁 分类信息\n\n1. 体育投资\n2. 棋牌游戏\n3. 电子竞技")

def handle_profile_click(update, context):
    update.message.reply_text("👤 个人中心\n\n请联系客服开通账户")

def handle_promotion_click(update, context):
    update.message.reply_text("💰 推广说明\n\n加入我们的推广计划，享受高额佣金")

def handle_ad_post_click(update, context):
    update.message.reply_text("🔥 广告投放说明\n\n请联系客服了解详情")

def handle_help_click(update, context):
    update.message.reply_text("❓ 帮助中心\n\n如有问题请联系在线客服")

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
