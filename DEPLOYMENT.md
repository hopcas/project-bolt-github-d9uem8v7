# 部署到 Render 指南

## 🚨 重要修复说明

**问题已修复：**
- 将服务类型从 `background_worker` 改为 `web_service`
- 修复了 `package.json` 中的路径问题
- 添加了必要的环境变量配置

## 自动部署步骤

1. **准备代码**
   - 确保所有文件已提交到 Git 仓库
   - 推送到 GitHub/GitLab

2. **在 Render 上创建服务**
   - 访问 [render.com](https://render.com)
   - 点击 "New +" → "Web Service"
   - 连接您的 Git 仓库

3. **配置服务**
   - **Name**: `telegram-tts-bot`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: 选择 Free 或付费计划

4. **设置环境变量**
   在 Render 控制台中添加以下环境变量：
   ```
   TELEGRAM_BOT_TOKEN=你的机器人token (必须设置为Secret)
   TTS_API_URL=https://translate.google.com/translate_tts
   MAX_FILE_SIZE=10485760
   MAX_TEXT_LENGTH=5000
   NODE_ENV=production
   PORT=3000
   ```

5. **部署**
   - 点击 "Create Web Service"
   - Render 会自动构建和部署

## 使用 render.yaml 自动部署

如果您有 `render.yaml` 文件，可以使用 Infrastructure as Code：

1. 在 Render 控制台选择 "New +" → "Blueprint"
2. 连接包含 `render.yaml` 的仓库
3. Render 会自动读取配置并创建服务

## 获取 Telegram Bot Token

1. 在 Telegram 中搜索 `@BotFather`
2. 发送 `/newbot` 创建新机器人
3. 按提示设置机器人名称和用户名
4. 复制获得的 token 到环境变量中

## 🔍 部署问题排查

### 常见错误及解决方案

1. **构建失败**
   - 检查 `package.json` 中的依赖是否正确
   - 确保所有文件路径正确

2. **启动失败**
   - 检查环境变量是否正确设置
   - 确保 `TELEGRAM_BOT_TOKEN` 已设置为 Secret
   - 查看 Render 日志中的具体错误信息

3. **健康检查失败**
   - 确保 `/health` 端点正常工作
   - 检查端口配置是否正确

4. **机器人无响应**
   - 检查 Telegram Bot Token 是否正确
   - 确保机器人没有被禁用
   - 查看 Render 日志中的轮询状态

### 日志检查要点

部署后，在 Render 控制台查看日志，应该看到：
```
✅ 文本转语音机器人已启动！
📱 开始接收消息...
健康检查服务器运行在端口 3000
```

## 注意事项

- Render 的免费计划在无活动时会休眠，可能影响机器人响应
- 建议使用付费计划以确保 24/7 运行
- 确保在 Render 中正确设置所有环境变量
- 机器人部署后需要几分钟才能完全启动

## 验证部署

部署成功后：
1. 在 Render 控制台查看日志
2. 应该看到 "✅ 文本转语音机器人已启动！" 消息
3. 在 Telegram 中测试机器人功能
4. 访问 `https://your-service-name.onrender.com/health` 验证健康检查