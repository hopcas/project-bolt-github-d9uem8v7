const FileProcessor = require('../services/fileProcessor');
const TTSService = require('../services/ttsService');
const { VOICE_OPTIONS, ERROR_MESSAGES } = require('../config/constants');

class MessageHandler {
  constructor(bot) {
    this.bot = bot;
    this.ttsService = new TTSService();
    this.userStates = new Map(); // 存储用户状态
  }
  
  /**
   * 处理开始命令
   */
  handleStart(msg) {
    const chatId = msg.chat.id;
    const welcomeMessage = `
🎵 *文本转语音机器人*

欢迎使用！我可以帮您将文本文件转换为音频文件。

*支持功能：*
• 上传 .txt、.md、.rtf 文件
• 多语言语音合成
• 高质量音频输出

*使用方法：*
1. 直接发送文本文件
2. 选择语音语言（可选）
3. 等待处理完成

*命令列表：*
/start - 显示帮助信息
/voice - 选择语音语言
/help - 获取详细帮助

现在就发送一个文本文件试试吧！ 📁
    `;
    
    this.bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
  }
  
  /**
   * 处理语音选择命令
   */
  handleVoiceSelection(msg) {
    const chatId = msg.chat.id;
    const keyboard = {
      reply_markup: {
        inline_keyboard: Object.entries(VOICE_OPTIONS).map(([code, option]) => [
          { text: option.name, callback_data: `voice_${code}` }
        ])
      }
    };
    
    this.bot.sendMessage(chatId, '请选择语音语言：', keyboard);
  }
  
  /**
   * 处理回调查询（语音选择）
   */
  handleCallbackQuery(callbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    
    if (data.startsWith('voice_')) {
      const voiceCode = data.replace('voice_', '');
      this.userStates.set(chatId, { voice: voiceCode });
      
      const voiceName = VOICE_OPTIONS[voiceCode]?.name || '未知语音';
      this.bot.answerCallbackQuery(callbackQuery.id);
      this.bot.sendMessage(chatId, `✅ 已选择语音：${voiceName}\n\n现在发送文本文件进行转换！`);
    }
  }
  
  /**
   * 处理文档消息
   */
  async handleDocument(msg) {
    const chatId = msg.chat.id;
    const document = msg.document;
    
    try {
      // 验证文件
      FileProcessor.validateFile(document);
      
      // 发送处理中消息
      const processingMsg = await this.bot.sendMessage(chatId, '📝 正在处理文件...');
      
      // 下载文件
      const fileStream = await this.bot.getFileStream(document.file_id);
      const chunks = [];
      
      fileStream.on('data', chunk => chunks.push(chunk));
      
      fileStream.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks);
          const textContent = FileProcessor.processTextContent(buffer.toString('utf8'));
          
          // 更新状态消息
          await this.bot.editMessageText('🎵 正在转换为语音...', {
            chat_id: chatId,
            message_id: processingMsg.message_id
          });
          
          // 获取用户选择的语音
          const userState = this.userStates.get(chatId);
          const voice = userState?.voice || 'zh-CN';
          
          // 转换为语音
          const audioFilePath = await this.ttsService.convertTextToSpeech(textContent, voice, chatId);
          
          // 发送音频文件
          await this.bot.sendAudio(chatId, audioFilePath, {
            title: `转换自: ${document.file_name}`,
            performer: '文本转语音机器人'
          });
          
          // 删除处理中消息
          await this.bot.deleteMessage(chatId, processingMsg.message_id);
          
          // 清理临时文件
          TTSService.cleanupTempFile(audioFilePath);
          
          // 发送成功消息
          await this.bot.sendMessage(chatId, '✅ 转换完成！您可以继续发送其他文件。');
          
        } catch (error) {
          console.error('Processing error:', error);
          await this.bot.editMessageText(`❌ ${error.message}`, {
            chat_id: chatId,
            message_id: processingMsg.message_id
          });
        }
      });
      
      fileStream.on('error', async (error) => {
        console.error('Stream error:', error);
        await this.bot.editMessageText(`❌ ${ERROR_MESSAGES.PROCESSING_ERROR}`, {
          chat_id: chatId,
          message_id: processingMsg.message_id
        });
      });
      
    } catch (error) {
      console.error('Document handling error:', error);
      this.bot.sendMessage(chatId, `❌ ${error.message}`);
    }
  }
  
  /**
   * 处理帮助命令
   */
  handleHelp(msg) {
    const chatId = msg.chat.id;
    const helpMessage = `
📖 *详细帮助*

*支持的文件格式：*
• .txt (纯文本文件)
• .md (Markdown文件)  
• .rtf (富文本格式)

*文件限制：*
• 最大文件大小：10MB
• 最大文本长度：5000字符
• 超长文本将自动截断

*支持的语言：*
• 中文 (zh-CN)
• English (en-US)
• 日本語 (ja-JP)
• 한국어 (ko-KR)

*使用步骤：*
1. 使用 /voice 选择语音语言（可选）
2. 直接发送文本文件
3. 等待处理完成
4. 下载生成的音频文件

*注意事项：*
• 音频文件为MP3格式
• 处理时间取决于文本长度
• 请确保文件包含可读文本内容

如有问题，请重新开始或联系管理员。
    `;
    
    this.bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
  }
}

module.exports = MessageHandler;