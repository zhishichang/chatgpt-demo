# ChatGPT Demo

一个类似 ChatGPT 的聊天应用，使用 React + Express + DeepSeek API 构建。

## 功能特性

- 🤖 流式对话响应
- 💬 多会话管理
- 📝 Markdown 渲染 + 代码高亮
- 📎 文件上传支持（图片/文档）
- 🌙 深色/浅色主题切换
- 📤 对话导出功能
- ⌨️ 快捷键支持

## 技术栈

- **前端**: React 18 + TypeScript + Vite + Tailwind CSS + Zustand
- **后端**: Express + TypeScript
- **AI API**: DeepSeek API

## 快速开始

### 安装依赖

```bash
npm run install:all
```

### 开发模式

```bash
# 同时启动前后端
npm run dev

# 或分别启动
npm run dev:backend  # http://localhost:3001
npm run dev:frontend # http://localhost:5173
```

### 使用说明

1. 首次访问时输入你的 DeepSeek API Key
2. 点击左侧「+」按钮创建新会话
3. 在输入框输入消息，按 Enter 发送
4. 支持拖拽上传文件
5. 点击主题按钮切换深色/浅色模式

## 项目结构

```
chatgpt-demo/
├── frontend/          # React 前端
│   ├── src/
│   │   ├── components/  # UI 组件
│   │   ├── stores/      # Zustand 状态管理
│   │   ├── hooks/       # 自定义 Hooks
│   │   └── types/       # TypeScript 类型
│   └── package.json
├── backend/           # Express 后端
│   ├── src/
│   │   ├── routes/      # API 路由
│   │   └── services/    # 业务逻辑
│   └── package.json
└── README.md
```

## 许可证

MIT
