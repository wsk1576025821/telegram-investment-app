from telegram import ReplyKeyboardMarkup, KeyboardButton, WebAppInfo
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters
import json
import logging
import os
from urllib.parse import urlencode

# 设置日志
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.DEBUG
)
logger = logging.getLogger(__name__)

# 从环境变量获取 TOKEN，如果没有则使用默认值
TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '7582221284:AAGvtmNC5RmjSRcumethqzgWPkSTJRYHxQg')

# 验证 TOKEN 是否有效
if not TOKEN or len(TOKEN.split(':')) != 2:
    raise ValueError("Invalid token! Please check your TELEGRAM_BOT_TOKEN")

# 管理员 ID
ADMIN_ID = "7036647707"

def start(update, context):
    """处理 /start 命令"""
    # 获取用户信息
    user = update.effective_user
    user_info = (
        f"👤 用户信息:\n"
        f"ID: {user.id}\n"
        f"用户名: @{user.username if user.username else '无'}\n"
        f"姓名: {user.first_name} {user.last_name if user.last_name else ''}\n"
        f"语言: {user.language_code if user.language_code else '未知'}"
    )
    
    # 记录用户信息
    logger.info(f"New user started bot: {user_info}")
    
    # 发送用户信息给管理员
    if str(ADMIN_ID).isdigit():
        context.bot.send_message(
            chat_id=ADMIN_ID,
            text=f"新用户开始使用机器人:\n{user_info}"
        )
    
    # 创建自定义键盘
    keyboard = [
        ['1', '2', '3', '4', '5', '6', '7'],
        ['8', '9', '10', '11', '12', '13', '14'],
        ['15', '16', '17', '18', '19', '20'],
        ['🔥 购买广告', '➡️ 下一页'],
        ['🔥 IM体育: 1个有效即享55%-70%-可...'],
        ['🎭升元棋牌❤️ 贷盈利70%分成招商❤️...'],
        [KeyboardButton(text='🌐 打开投资平台', web_app=WebAppInfo(url=miniapp_url))],
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
    
    # 发送欢迎消息
    update.message.reply_text(
        f"👋 欢迎使用投资平台机器人!\n"
        f"🎯 请点击下方按钮选择功能\n"
        f"💡 提示: 点击数字按钮查看详细信息\n\n"
        f"{user_info}",
        reply_markup=reply_markup
    )

def handle_message(update, context):
    """处理所有消息"""
    try:
        # 获取用户信息
        user = update.effective_user
        user_info = {
            'user_id': user.id,
            'username': user.username or '',
            'first_name': user.first_name or '',
            'last_name': user.last_name or '',
            'language': user.language_code or ''
        }
        print('1111111111111111111111111111111111111111111111')
        print(user_info)
        
        # 构建 miniapp URL，包含用户信息和按钮信息
        base_url = "https://wsk1576025821.github.io/telegram-investment-app"
        
        if update.message.text and update.message.text.isdigit():
            number = int(update.message.text)
            user_info['button_type'] = 'number'
            user_info['button_value'] = str(number)
        else:
            user_info['button_type'] = 'text'
            user_info['button_value'] = update.message.text or ''
        
        # 添加时间戳
        user_info['timestamp'] = update.message.date.strftime('%Y-%m-%d %H:%M:%S')

        # 创建带参数的 URL
        miniapp_url = f"{base_url}?{urlencode(user_info)}"

        # 创建自定义键盘，添加 miniapp 链接按钮
        keyboard = [
            ['1', '2', '3', '4', '5', '6', '7'],
            ['8', '9', '10', '11', '12', '13', '14'],
            ['15', '16', '17', '18', '19', '20'],
            ['🔥 购买广告', '➡️ 下一页'],
            ['🔥 IM体育: 1个有效即享55%-70%-可...'],
            ['🎭升元棋牌❤️ 贷盈利70%分成招商❤️...'],
            [KeyboardButton(text='🌐 打开投资平台', web_app=WebAppInfo(url=miniapp_url))],
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
        
        # 记录所有收到的消息
        logger.info(f"Received message: {update.message.text}")
        
        # 检查是否是数字按钮点击
        if update.message.text and update.message.text.isdigit():
            number = int(update.message.text)
            if 1 <= number <= 20:
                message = (
                    f"🎯 您选择了选项 {number}\n"
                    f"⏳ 正在处理您的请求...\n"
                    f"📞 客服稍后会与您联系\n\n"
                    f"{user_info}"
                )
                update.message.reply_text(message)
                
                # 同时发送给管理员
                if str(ADMIN_ID).isdigit():
                    admin_message = (
                        f"🔔 用户点击了选项 {number}\n\n"
                        f"{user_info}\n"
                        f"📅 时间: {update.message.date.strftime('%Y-%m-%d %H:%M:%S')}"
                    )
                    context.bot.send_message(
                        chat_id=ADMIN_ID,
                        text=admin_message
                    )
                return

        # 处理其他按钮点击
        if update.message.text:
            message_with_info = None
            
            if "购买广告" in update.message.text:
                message_with_info = f"🔥 购买广告请联系客服\n\n{user_info}"
            elif "IM体育" in update.message.text:
                message_with_info = f"🏆 IM体育详情请联系客服\n\n{user_info}"
            elif "官方简介" in update.message.text:
                message_with_info = f"📋 官方简介\n\n这是一个专业的投资理财平台...\n\n{user_info}"
            elif "分类" in update.message.text:
                message_with_info = (
                    "📁 分类信息\n\n"
                    "1. 体育投资\n"
                    "2. 棋牌游戏\n"
                    "3. 电子竞技\n\n"
                    f"{user_info}"
                )
            elif "我的" in update.message.text:
                handle_profile_click(update, context)
            elif "推广赚钱" in update.message.text:
                message_with_info = f"💰 推广说明\n\n加入我们的推广计划，享受高额佣金\n\n{user_info}"
            elif "广告投放" in update.message.text:
                message_with_info = f"🔥 广告投放说明\n\n请联系客服了解详情\n\n{user_info}"
            elif "帮助" in update.message.text:
                message_with_info = f"❓ 帮助中心\n\n如有问题请联系在线客服\n\n{user_info}"
            
            if message_with_info:
                update.message.reply_text(message_with_info)
            
            # 移到这里，确保所有按钮点击都会发送管理员通知
            if str(ADMIN_ID).isdigit():
                admin_message = (
                    f"🔔 用户点击了: {update.message.text}\n\n"
                    f"{user_info}\n"
                    f"📅 时间: {update.message.date.strftime('%Y-%m-%d %H:%M:%S')}"
                )
                context.bot.send_message(
                    chat_id=ADMIN_ID,
                    text=admin_message
                )
        
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
    """处理个人中心点击"""
    user = update.effective_user
    profile_info = (
        f"👤 个人信息\n\n"
        f"用户ID: {user.id}\n"
        f"用户名: @{user.username if user.username else '未设置'}\n"
        f"姓名: {user.first_name} {user.last_name if user.last_name else ''}\n"
        f"语言: {user.language_code if user.language_code else '未知'}\n\n"
        f"💫 账户状态: {'已认证' if str(user.id) == ADMIN_ID else '普通用户'}\n"
        f"📅 加入时间: {update.message.date.strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        f"如需更多信息，请联系客服"
    )
    update.message.reply_text(profile_info)

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
