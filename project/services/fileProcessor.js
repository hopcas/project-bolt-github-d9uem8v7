const fs = require('fs');
const path = require('path');
const { MAX_FILE_SIZE, MAX_TEXT_LENGTH, SUPPORTED_FILE_TYPES, ERROR_MESSAGES } = require('../config/constants');

class FileProcessor {
  /**
   * 验证上传的文件
   */
  static validateFile(file) {
    // 检查文件大小
    if (file.file_size > MAX_FILE_SIZE) {
      throw new Error(ERROR_MESSAGES.FILE_TOO_LARGE);
    }
    
    // 检查文件扩展名
    const ext = path.extname(file.file_name).toLowerCase();
    if (!SUPPORTED_FILE_TYPES.includes(ext)) {
      throw new Error(ERROR_MESSAGES.UNSUPPORTED_FORMAT);
    }
    
    return true;
  }
  
  /**
   * 处理文本文件内容
   */
  static processTextContent(content) {
    // 清理文本内容
    let cleanedText = content
      .replace(/[\r\n]+/g, ' ') // 替换换行符为空格
      .replace(/\s+/g, ' ') // 合并多个空格
      .trim();
    
    // 检查文本长度
    if (cleanedText.length === 0) {
      throw new Error(ERROR_MESSAGES.NO_TEXT_CONTENT);
    }
    
    if (cleanedText.length > MAX_TEXT_LENGTH) {
      // 截断过长的文本
      cleanedText = cleanedText.substring(0, MAX_TEXT_LENGTH) + '...';
    }
    
    return cleanedText;
  }
  
  /**
   * 从文件路径读取文本内容
   */
  static async readTextFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return this.processTextContent(content);
    } catch (error) {
      throw new Error(ERROR_MESSAGES.PROCESSING_ERROR);
    }
  }
}

module.exports = FileProcessor;