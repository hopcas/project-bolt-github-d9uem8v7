module.exports = {
  // 支持的文件类型
  SUPPORTED_FILE_TYPES: ['.txt', '.md', '.rtf'],
  
  // 最大文件大小 (10MB)
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024,
  
  // 最大文本长度
  MAX_TEXT_LENGTH: parseInt(process.env.MAX_TEXT_LENGTH) || 5000,
  
  // 支持的语音选项
  VOICE_OPTIONS: {
    'zh-CN': { name: '中文女声', voice: 'zh-CN' },
    'en-US': { name: 'English Female', voice: 'en-US' },
    'ja-JP': { name: '日本語女声', voice: 'ja-JP' },
    'ko-KR': { name: '한국어 여성', voice: 'ko-KR' }
  },
  
  // 错误消息
  ERROR_MESSAGES: {
    FILE_TOO_LARGE: '文件太大，请上传小于10MB的文件。',
    UNSUPPORTED_FORMAT: '不支持的文件格式。请上传 .txt、.md 或 .rtf 文件。',
    TEXT_TOO_LONG: '文本内容太长，请确保文本不超过5000个字符。',
    PROCESSING_ERROR: '处理文件时出错，请稍后重试。',
    NO_TEXT_CONTENT: '文件中没有找到文本内容。',
    API_ERROR: 'TTS服务暂时不可用，请稍后重试。'
  }
};