import { GoogleGenerativeAI } from '@google/generative-ai'

// 从环境变量获取 API key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

// 初始化 Gemini API
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null

/**
 * 使用 Gemini 模型对文本进行结构化整理
 * @param {string} text - 需要整理的文本
 * @param {string} prompt - 可选的提示词，用于指导结构化整理的方式
 * @returns {Promise<string>} 整理后的结构化文本
 */
export async function structureTextWithGemini(text, prompt = null) {
  if (!genAI) {
    throw new Error('Gemini API key 未配置。请在 .env 文件中设置 VITE_GEMINI_API_KEY')
  }

  if (!text || !text.trim()) {
    throw new Error('输入文本不能为空')
  }

  try {
    // 使用 Gemini 3 Flash Preview 模型
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

    // 构建提示词
    const defaultPrompt = `请对以下文本进行结构化整理，提取关键信息，并以清晰、有条理的方式重新组织：

${text}

请将文本整理成结构化的格式，包括：
1. 核心问题/主题
2. 关键信息点
3. 重要细节

如果文本已经是结构化的，请保持其结构并进行优化。`

    const finalPrompt = prompt || defaultPrompt

    // 调用 API
    const result = await model.generateContent(finalPrompt)
    const response = await result.response
    const structuredText = response.text()

    return structuredText
  } catch (error) {
    console.error('Gemini API 调用错误:', error)
    throw new Error(`Gemini API 调用失败: ${error.message}`)
  }
}

/**
 * 使用 Gemini 模型进行对话
 * @param {string} message - 用户消息
 * @param {Array} history - 对话历史（可选）
 * @returns {Promise<string>} AI 回复
 */
export async function chatWithGemini(message, history = []) {
  if (!genAI) {
    throw new Error('Gemini API key 未配置。请在 .env 文件中设置 VITE_GEMINI_API_KEY')
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

    // 构建对话历史
    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    })

    // 发送消息
    const result = await chat.sendMessage(message)
    const response = await result.response
    const text = response.text()

    return text
  } catch (error) {
    console.error('Gemini API 调用错误:', error)
    throw new Error(`Gemini API 调用失败: ${error.message}`)
  }
}

/**
 * 检查 API key 是否已配置
 * @returns {boolean}
 */
export function isGeminiConfigured() {
  return !!API_KEY && API_KEY.trim() !== ''
}

