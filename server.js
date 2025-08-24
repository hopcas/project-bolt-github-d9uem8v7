const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// 根路径路由
app.get('/', (req, res) => {
  res.send('文本转语音机器人服务器运行正常！请通过Telegram客户端访问机器人。');
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 启动服务器
app.listen(port, () => {
  console.log(`健康检查服务器运行在端口 ${port}`);
});

module.exports = app;