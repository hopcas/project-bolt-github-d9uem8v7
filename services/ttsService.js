const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { ERROR_MESSAGES } = require('../config/constants');

class TTSService {
  constructor() {
    // 使用更可靠的TTS API替代已不可用的Streamelements API
    // 使用更稳定的Google TTS API配置
    this.apiUrl = process.env.TTS_API_URL || 'https://translate.google.com/translate_tts';
  }
  
  /**
   * 将文本转换为语音
   */
  async convertTextToSpeech(text, voice = 'zh-CN', chatId) {
    try {
      // 文本预处理 - 移除特殊字符和多余空格
      let processedText = text.trim();
      
      // 如果文本为空，返回错误
      if (!processedText) {
        throw new Error('请提供有效的文本内容。');
      }
      
      // 替换可能导致API问题的特殊字符
      processedText = processedText.replace(/[\u200B-\u200D\uFEFF]/g, '');
      
      // 限制文本长度以避免API拒绝，Google TTS通常对单次请求有更严格的长度限制
      const limitedText = processedText.length > 500 ? processedText.substring(0, 500) : processedText;
      
      // 准备API参数 - 更新为Google TTS API的最新参数配置
      console.log(`Converting text to speech for chat ${chatId} using Google TTS API...`);
      
      // 增强文本预处理，更严格地过滤可能导致API拒绝的字符
      const safeText = limitedText
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')  // 移除控制字符
        .replace(/[\x00-\x1F\x7F]/g, '')              // 移除ASCII控制字符
        .replace(/[\u2028\u2029]/g, ' ')              // 替换行分隔符和段落分隔符为空格
        .replace(/[`~!@#$%^&*()_+=\[\\]{}|;':",.<>\/?]/g, ' ') // 替换特殊符号为空格
        .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '') // 移除表情符号
        .replace(/[^\x00-\x7F\u4e00-\u9fa5]/g, ' ') // 只保留ASCII和中文
        .replace(/\s+/g, ' ').trim();                  // 合并多余空格并修剪
        
      // 如果预处理后文本为空，返回默认文本
      if (!safeText) {
        console.warn('Text was emptied after preprocessing, using default text');
        safeText = '您的文本可能包含无法处理的特殊字符，请尝试修改后重试。';
      }
      
      console.log(`Processed text length: ${safeText.length}, first 50 chars: ${safeText.substring(0, 50)}...`);
      
      // 更新API参数配置，使用更可靠的调用方式
      // 更健壮的API参数配置
      const response = await axios.get(this.apiUrl, {
        params: {
          ie: 'UTF-8',
          q: safeText,
          tl: voice.split('-')[0] || 'zh', // 确保有默认语言代码
          client: 'dict-chrome-ex', // 使用稳定的客户端类型
          idx: '0',
          total: '1',
          textlen: safeText.length,
          tk: Math.floor(Math.random() * 99999999) // 随机token以避免API限制
        },
        responseType: 'stream',
        timeout: 30000, // 30秒超时
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Accept-Language': 'zh-CN,zh;q=0.9',
          'Referer': 'https://translate.google.com/',
          'Origin': 'https://translate.google.com'
        },
        maxRedirects: 5,
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }) // 临时绕过SSL验证问题
      });
      
      // 生成临时文件名
      const fileName = `audio_${chatId}_${Date.now()}.mp3`;
      const filePath = path.join(__dirname, '..', 'temp', fileName);
      
      // 确保temp目录存在
      const tempDir = path.dirname(filePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // 保存音频文件
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          console.log(`Audio file created: ${filePath}`);
          resolve(filePath);
        });
        
        writer.on('error', (error) => {
          console.error('Error writing audio file:', error);
          reject(new Error(ERROR_MESSAGES.PROCESSING_ERROR));
        });
      });
      
    } catch (error) {
      console.error('TTS conversion error:', error.message);
      console.error('Error details:', error.response?.status, error.response?.data);
      console.error('Failed text (first 100 chars):', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('语音转换超时，请尝试较短的文本（建议少于300字）。');
      } else if (error.response && error.response.status === 400) {
        // 提供更具体的错误提示
        throw new Error('TTS服务参数错误，请尝试修改文本内容（移除特殊字符、emoji等）或稍后重试。');
      } else if (error.response && error.response.status === 429) {
        throw new Error('TTS服务请求过于频繁，请稍后重试（建议间隔10秒以上）。');
      } else if (error.response && error.response.status === 403) {
        throw new Error('TTS服务访问受限，正在尝试恢复，请稍后重试。');
      } else if (error.response && error.response.status === 404) {
        throw new Error('TTS服务暂时不可用，请稍后重试。');
      }
      throw new Error('语音转换服务异常，请稍后重试或联系管理员。');
    }
  }
  
  /**
   * 清理临时文件
   */
  static cleanupTempFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up temp file: ${filePath}`);
      }
    } catch (error) {
      console.error('Error cleaning up temp file:', error.message);
    }
  }
}

module.exports = TTSService;