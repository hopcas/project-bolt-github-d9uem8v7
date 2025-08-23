FROM node:18-alpine

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 创建临时文件夹
RUN mkdir -p temp

# 暴露端口（虽然这个bot不需要HTTP端口，但某些平台需要）
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]