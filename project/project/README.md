# Telegram 文本转语音机器人

一个功能强大的 Telegram 机器人，可以将文本文件转换为高质量的音频文件。

## ✨ 主要功能

- 📄 支持多种文本文件格式 (.txt, .md, .rtf)
- 🎵 多语言语音合成 (中文、英文、日文、韩文)
- 🔊 高质量 MP3 音频输出
- 📱 友好的用户界面和实时反馈
- 🛡️ 安全的文件处理和验证
- 🧹 自动清理临时文件

## 🚀 快速开始

### 1. 准备工作

1. 创建 Telegram 机器人：
   - 在 Telegram 中搜索 `@BotFather`
   - 发送 `/newbot` 创建新机器人
   - 记录下 bot token

### 2. 环境配置

1. 复制环境变量文件：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，设置你的 bot token：
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   ```

### 3. 安装依赖

```bash
npm install
```

### 4. 启动机器人

```bash
npm start
```

## 📖 使用方法

### 基本命令

- `/start` - 开始使用，显示欢迎信息
- `/voice` - 选择语音语言
- `/help` - 查看详细帮助

### 使用步骤

1. **启动机器人** - 发送 `/start` 命令
2. **选择语音** (可选) - 发送 `/voice` 命令选择语音语言
3. **上传文件** - 直接发送文本文件
4. **等待处理** - 机器人会显示处理进度
5. **下载音频** - 处理完成后下载生成的音频文件

### 支持的文件类型

- `.txt` - 纯文本文件
- `.md` - Markdown 文件
- `.rtf` - 富文本格式文件

### 支持的语音

- 🇨🇳 中文 (zh-CN)
- 🇺🇸 English (en-US)
- 🇯🇵 日本語 (ja-JP)
- 🇰🇷 한국어 (ko-KR)

## ⚙️ 配置选项

在 `.env` 文件中可以配置以下选项：

```env
# 机器人token (必需)
TELEGRAM_BOT_TOKEN=your_bot_token_here

# TTS API地址 (可选，默认使用免费服务)
TTS_API_URL=https://api.streamelements.com/kappa/v2/speech

# 文件大小限制 (字节，默认10MB)
MAX_FILE_SIZE=10485760

# 文本长度限制 (字符，默认5000)
MAX_TEXT_LENGTH=5000
```

## 🔧 技术架构

### 项目结构

```
├── bot.js                 # 主程序入口
├── config/
│   └── constants.js       # 配置常量
├── handlers/
│   └── messageHandler.js  # 消息处理器
├── services/
│   ├── fileProcessor.js   # 文件处理服务
│   └── ttsService.js      # 文本转语音服务
├── temp/                  # 临时文件目录
├── .env                   # 环境变量
└── README.md             # 项目文档
```

### 技术栈

- **Node.js** - 运行环境
- **node-telegram-bot-api** - Telegram Bot API
- **axios** - HTTP 请求
- **dotenv** - 环境变量管理

## 🛡️ 安全特性

- 文件大小验证 (最大 10MB)
- 文件类型检查
- 文本长度限制
- 自动清理临时文件
- 错误处理和日志记录

## 🐛 故障排除

### 常见问题

1. **机器人无响应**
   - 检查 bot token 是否正确
   - 确认网络连接正常

2. **文件处理失败**
   - 检查文件格式是否支持
   - 确认文件大小未超限

3. **语音转换出错**
   - 检查网络连接
   - 尝试较短的文本内容

### 日志信息

机器人会输出详细的日志信息，包括：
- 用户操作记录
- 文件处理状态
- 错误信息和调试信息

## 📝 开发说明

### 添加新语音

在 `config/constants.js` 中的 `VOICE_OPTIONS` 添加新的语音选项：

```javascript
VOICE_OPTIONS: {
  'new-lang': { name: '新语言', voice: 'new-lang-code' }
}
```

### 扩展文件类型

修改 `SUPPORTED_FILE_TYPES` 数组：

```javascript
SUPPORTED_FILE_TYPES: ['.txt', '.md', '.rtf', '.new-format']
```

## 📜 许可证

MIT License - 详见 LICENSE 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**享受使用吧！** 🎉