const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { ERROR_MESSAGES } = require('../config/constants');

class TTSService {
  constructor() {
    // 使用更可靠的TTS API替代已不可用的Streamelements API
    // 这里使用Google Text-to-Speech的公共端点示例
    this.apiUrl = process.env.TTS_API_URL || 'https://translate.google.com/translate_tts';
  }
  
  /**
   * 将文本转换为语音
   */
  async convertTextToSpeech(text, voice = 'zh-CN', chatId) {
    try {
      // 限制文本长度以避免API拒绝
      const limitedText = text.length > 2000 ? text.substring(0, 2000) : text;
      
      // 准备API参数 - 根据不同API调整
      let params, response;
      
      // 判断当前使用的API类型
      if (this.apiUrl.includes('translate.google.com')) {
        // Google Translate TTS API参数
        params = {
          ie: 'UTF-8',
          q: limitedText,
          tl: voice.split('-')[0], // 使用语言代码部分
          client: 'tw-ob'
        };
        
        console.log(`Converting text to speech for chat ${chatId} using Google TTS...`);
        
        response = await axios.get(this.apiUrl, {
          params: params,
          responseType: 'stream',
          timeout: 30000, // 30秒超时
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
      } else {
        // 原始API调用方式，用于其他可能的TTS服务
        params = {
          voice: voice,
          text: limitedText
        };
        
        console.log(`Converting text to speech for chat ${chatId}...`);
        
        response = await axios.get(this.apiUrl, {
          params: params,
          responseType: 'stream',
          timeout: 30000 // 30秒超时
        });
      }
      
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
      if (error.code === 'ECONNABORTED') {
        throw new Error('语音转换超时，请尝试较短的文本。');
      } else if (error.response && error.response.status === 400) {
        throw new Error('TTS服务参数错误，请尝试修改文本内容或稍后重试。');
      } else if (error.response && error.response.status === 429) {
        throw new Error('TTS服务请求过于频繁，请稍后重试。');
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