# Gemini API 配置指南

## 1. 获取 Gemini API Key

1. 访问 [Google AI Studio](https://aistudio.google.com/)
2. 使用您的 Google 账号登录
3. 点击左侧菜单中的 "Get API key"
4. 选择 "Create API key in new project" 或使用现有项目
5. 复制生成的 API key

## 2. 配置 API Key

1. 在项目根目录找到 `.env` 文件
2. 打开 `.env` 文件，将您的 API key 填入：

```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

**重要提示：**
- `.env` 文件已被添加到 `.gitignore`，不会提交到 Git 仓库
- 请妥善保管您的 API key，不要泄露给他人
- 如果需要团队协作，请通过安全的方式共享 API key（不要直接提交到代码仓库）

## 3. 重启开发服务器

配置 API key 后，需要重启开发服务器才能生效：

```bash
# 停止当前服务器（Ctrl + C）
# 然后重新启动
npm run dev
```

## 4. 使用方法

在代码中使用 Gemini 服务：

```javascript
import { structureTextWithGemini, chatWithGemini, isGeminiConfigured } from './services/geminiService'

// 检查是否已配置
if (isGeminiConfigured()) {
  // 结构化整理文本
  const structuredText = await structureTextWithGemini('你的文本内容')
  console.log(structuredText)
  
  // 或进行对话
  const response = await chatWithGemini('你好')
  console.log(response)
} else {
  console.log('Gemini API key 未配置')
}
```

## 5. API 限额

- Google AI Studio 提供免费的 API 调用配额
- 适合开发和测试使用
- 生产环境请查看 Google 的定价信息

## 6. 注意事项

⚠️ **安全警告：**
- 由于这是前端应用，API key 会在浏览器中暴露
- 对于生产环境，建议创建后端服务代理 API 调用
- 仅用于开发/演示时可直接在前端使用

## 7. 故障排查

如果遇到问题：

1. 确认 `.env` 文件中的 API key 格式正确
2. 确认 API key 有效（可在 Google AI Studio 中测试）
3. 确认已重启开发服务器
4. 检查浏览器控制台是否有错误信息
5. 确认网络连接正常（某些地区可能需要 VPN）

