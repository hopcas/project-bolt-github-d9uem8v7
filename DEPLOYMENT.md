# 部署到 Render 指南

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
   TELEGRAM_BOT_TOKEN=你的机器人token
   TTS_API_URL=https://api.streamelements.com/kappa/v2/speech
   MAX_FILE_SIZE=10485760
   MAX_TEXT_LENGTH=5000
   NODE_ENV=production
   ```

5. **部署**
   - 点击 "Create Web Service"
   - Render 会自动构建和部署

## 手动部署步骤

如果您有 `render.yaml` 文件，可以使用 Infrastructure as Code：

1. 在 Render 控制台选择 "New +" → "Blueprint"
2. 连接包含 `render.yaml` 的仓库
3. Render 会自动读取配置并创建服务

## 获取 Telegram Bot Token

1. 在 Telegram 中搜索 `@BotFather`
2. 发送 `/newbot` 创建新机器人
3. 按提示设置机器人名称和用户名
4. 复制获得的 token 到环境变量中

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