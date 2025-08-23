const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 启动服务器
app.listen(port, () => {
  console.log(`健康检查服务器运行在端口 ${port}`);
});

module.exports = app;