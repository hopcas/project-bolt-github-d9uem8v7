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
      // 替换可能导致API问题的特殊字符
      processedText = processedText.replace(/[\u200B-\u200D\uFEFF]/g, '');
      // 限制文本长度以避免API拒绝
      const limitedText = processedText.length > 1000 ? processedText.substring(0, 1000) : processedText;
      
      // 准备API参数 - 使用Google TTS API的最新参数配置
      console.log(`Converting text to speech for chat ${chatId} using Google TTS API...`);
      
      // 使用更可靠的参数和调用方式
      const response = await axios.get(this.apiUrl, {
        params: {
          ie: 'UTF-8',
          q: limitedText,
          tl: voice.split('-')[0], // 使用语言代码部分
          client: 'tw-ob',
          idx: '0',
          total: '1',
          textlen: limitedText.length
        },
        responseType: 'stream',
        timeout: 30000, // 30秒超时
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Accept-Language': 'zh-CN,zh;q=0.9',
          'Referer': 'https://translate.google.com/'
        },
        maxRedirects: 5
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
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('语音转换超时，请尝试较短的文本。');
      } else if (error.response && error.response.status === 400) {
        throw new Error('TTS服务参数错误，请尝试修改文本内容或稍后重试。');
      } else if (error.response && error.response.status === 429) {
        throw new Error('TTS服务请求过于频繁，请稍后重试。');
      } else if (error.response && error.response.status === 403) {
        throw new Error('TTS服务访问受限，请稍后重试。');
      }
      throw new Error(ERROR_MESSAGES.API_ERROR);
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