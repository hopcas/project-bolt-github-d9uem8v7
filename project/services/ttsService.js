const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { ERROR_MESSAGES } = require('../config/constants');

class TTSService {
  constructor() {
    this.apiUrl = process.env.TTS_API_URL || 'https://api.streamelements.com/kappa/v2/speech';
  }
  
  /**
   * 将文本转换为语音
   */
  async convertTextToSpeech(text, voice = 'zh-CN', chatId) {
    try {
      const params = {
        voice: voice,
        text: text
      };
      
      console.log(`Converting text to speech for chat ${chatId}...`);
      
      const response = await axios.get(this.apiUrl, {
        params: params,
        responseType: 'stream',
        timeout: 30000 // 30秒超时
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
      if (error.code === 'ECONNABORTED') {
        throw new Error('语音转换超时，请尝试较短的文本。');
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