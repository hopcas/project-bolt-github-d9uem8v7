require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const MessageHandler = require('./handlers/messageHandler');
const fs = require('fs');
const path = require('path');

// 验证必需的环境变量
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('❌ 错误: 未设置 TELEGRAM_BOT_TOKEN 环境变量');
  console.error('💡 提示: 请从 @BotFather 获取 bot token，并在 Render 仪表板中将其设置为 Secret');
  console.error('💡 提示: 配置路径: Render 仪表板 > 您的服务 > Environment > Add Secret');
  process.exit(1);
}

// 创建临时文件夹
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
  console.log('📁 创建临时文件夹:', tempDir);
}

// 创建bot实例 - 使用更健壮的轮询配置
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: {
    interval: 3000, // 轮询间隔（毫秒）
    autoStart: true,
    autoRestart: true, // 自动重启轮询
    params: {
      timeout: 60, // 超时时间（秒）
      allowed_updates: ['message', 'callback_query'] // 只监听需要的更新类型
    }
  }
});
const messageHandler = new MessageHandler(bot);

console.log('🚀 Telegram 文本转语音机器人启动中...');

// 启动健康检查服务器
const server = require('./server');

// 错误处理
bot.on('error', (error) => {
  console.error('❌ Bot错误:', error.message);
  // 处理特定错误类型
  if (error.code === 'ETELEGRAM' && error.response && error.response.body && error.response.body.error_code === 409) {
    console.warn('⚠️ 检测到多个机器人实例运行。等待20秒后尝试重启轮询...');
    setTimeout(() => {
      try {
        bot.stopPolling();
        console.log('🔄 尝试重新启动轮询...');
        bot.startPolling({
          interval: 3000,
          autoRestart: true,
          params: {
            timeout: 60,
            allowed_updates: ['message', 'callback_query']
          }
        });
        console.log('✅ 轮询重新启动成功');
      } catch (err) {
        console.error('❌ 重新启动轮询失败:', err.message);
      }
    }, 20000); // 等待20秒后再尝试重启
  }
});

bot.on('polling_error', (error) => {
  console.error('❌ 轮询错误:', error.message);
  // 处理409冲突错误
  if (error.code === 'ETELEGRAM' && error.message.includes('409 Conflict')) {
    console.warn('⚠️ 检测到多个机器人实例运行导致的轮询冲突。等待20秒后尝试重启轮询...');
    setTimeout(() => {
      try {
        bot.stopPolling();
        console.log('🔄 尝试重新启动轮询...');
        bot.startPolling({
          interval: 3000,
          autoRestart: true,
          params: {
            timeout: 60,
            allowed_updates: ['message', 'callback_query']
          }
        });
        console.log('✅ 轮询重新启动成功');
      } catch (err) {
        console.error('❌ 重新启动轮询失败:', err.message);
      }
    }, 20000); // 等待20秒后再尝试重启
  }
});

// 消息处理器
bot.onText(/\/start/, (msg) => {
  console.log(`📝 收到 /start 命令 - 用户: ${msg.from.username || msg.from.first_name} (${msg.chat.id})`);
  messageHandler.handleStart(msg);
});

bot.onText(/\/voice/, (msg) => {
  console.log(`🎵 收到 /voice 命令 - 用户: ${msg.from.username || msg.from.first_name} (${msg.chat.id})`);
  messageHandler.handleVoiceSelection(msg);
});

bot.onText(/\/help/, (msg) => {
  console.log(`❓ 收到 /help 命令 - 用户: ${msg.from.username || msg.from.first_name} (${msg.chat.id})`);
  messageHandler.handleHelp(msg);
});

// 文档处理
bot.on('document', (msg) => {
  console.log(`📄 收到文档 - 用户: ${msg.from.username || msg.from.first_name} (${msg.chat.id})`);
  console.log(`📄 文件信息: ${msg.document.file_name} (${msg.document.file_size} bytes)`);
  messageHandler.handleDocument(msg);
});

// 回调查询处理
bot.on('callback_query', (callbackQuery) => {
  console.log(`🔄 收到回调查询 - 数据: ${callbackQuery.data}`);
  messageHandler.handleCallbackQuery(callbackQuery);
});

// 处理普通文本消息
bot.on('message', (msg) => {
  // 忽略命令和文档消息
  if (msg.text && !msg.text.startsWith('/') && !msg.document) {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 
      '📝 请发送文本文件进行转换！\n\n' +
      '💡 提示：直接上传 .txt、.md 或 .rtf 文件\n' +
      '🎵 使用 /voice 选择语音语言\n' +
      '❓ 使用 /help 获取详细帮助'
    );
  }
});

// 清理函数
function cleanup() {
  console.log('🧹 清理临时文件...');
  try {
    const files = fs.readdirSync(tempDir);
    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      fs.unlinkSync(filePath);
      console.log(`🗑️ 删除临时文件: ${file}`);
    });
  } catch (error) {
    console.error('清理错误:', error.message);
  }
}

// 进程退出时清理
process.on('SIGINT', () => {
  console.log('\n⏹️ 机器人正在关闭...');
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️ 机器人正在关闭...');
  cleanup();
  process.exit(0);
});

// 定期清理临时文件（每小时）
setInterval(cleanup, 60 * 60 * 1000);

console.log('✅ 文本转语音机器人已启动！');
console.log('📱 开始接收消息...');