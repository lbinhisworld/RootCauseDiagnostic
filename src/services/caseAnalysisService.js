import { GoogleGenerativeAI } from '@google/generative-ai'

// 从环境变量获取 API key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

// 初始化 Gemini API
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null

/**
 * 分析案例内容（支持文本和图片）
 * @param {string} content - 案例文本内容
 * @param {Array} images - 图片数组，每个元素包含 { file, data, name }
 * @returns {Promise<string>} 分析结果
 */
export async function analyzeCaseContent(content, images = []) {
  if (!genAI) {
    throw new Error('Gemini API key 未配置。请在 .env 文件中设置 VITE_GEMINI_API_KEY')
  }

  if (!content.trim() && images.length === 0) {
    throw new Error('案例内容不能为空')
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

    const prompt = `# Role
你是一位资深的数字化转型顾问及商业分析专家，擅长从复杂的企业案例中提取技术架构、业务逻辑与商业价值。

# Task
请针对我提供的【企业数字化案例】，进行深度拆解。分析需重点关注其 IT 环境背景、业务痛点、根因、以及不同厂商软件工具带来的具体价值。

# Output Framework

## 1. 50字价值简介
* 请用一句话或50字以内的精炼文字，总结本案例的核心方案及其解决的核心经营问题。

## 2. 企业基本画像
* 行业属性、规模地位、主要产品。

## 3. IT 现状 (IT Infrastructure & Context)
* **原有系统底座**：在本次方案实施前，企业已经拥有哪些系统（如 ERP、MES、OA、旧版小程序等）？
* **技术环境**：涉及哪些硬件设备（如 PLC、智能柜、传感器、移动终端）？
* **IT 能力**：企业的 IT 人员配置、数字化意识水平或业务人员的参与度。

## 4. 核心经营痛点 (Surface Symptoms)
* 梳理 3-4 个核心业务痛点。
* 重点描述：旧模式下的具体操作流程及其导致的直接负面后果（如信息滞后、数据造假、协作断层等）。

## 5. 根因链条分析 (Root Cause Chain)
* **表层原因**：手工记录、数据分散、流程不透明。
* **中层原因**：信息孤岛、软硬协同断层、数据标准/协议不统一。
* **深层原因**：标准系统过于僵化，无法匹配业务的高频灵活变更，缺乏柔性数字化底座。

## 6. 软件工具与厂商价值清单 (Vendor & Tool Value Map)
请列出案例中涉及的关键厂商及其软件工具，并分析其创造的特定价值：
* **厂商名称 | 软件工具名称**：
    * **核心功能**：该工具解决了哪个具体业务环节的问题？
    * **生产/运营价值**：该工具的引入带来了哪些量化的提升（如效率、成本、质量、合规等）？

## 7. 综合解决方案 (The Integrated Solution)
* 详细说明企业如何利用核心平台（如简道云）将工具、硬件、流程进行整合。
* 重点解析：API 集成、数据工厂加工、智能助手触发等技术路径。

## 8. 核心价值与商业启发
* **定量成果总结**：成本、效率、质量等维度的核心核心指标数据。
* **商业洞察**：该案例对于同类型企业在"数字化选型"和"场景落地"上有何普适性的借鉴意义？

# Constraints
* 逻辑严密，拒绝套话，必须引用案例中的具体数据和专业术语（如 MRO、PLC 协议、API 对接、SRM 等）。
* 使用清晰的 Markdown 标题和列表输出。

---
请分析以下案例内容：`

    // 构建内容部分
    let contentParts = []
    
    // 添加文本内容
    if (content.trim()) {
      contentParts.push({
        text: `${prompt}\n\n${content}`
      })
    } else {
      contentParts.push({
        text: prompt
      })
    }

    // 添加图片内容
    if (images.length > 0) {
      for (const img of images) {
        // 将base64数据转换为Blob，然后提取base64部分
        const base64Data = img.data.split(',')[1] || img.data
        const mimeType = img.file.type || 'image/png'
        
        contentParts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        })
      }
    }

    const result = await model.generateContent(contentParts)
    const response = await result.response
    const analysis = response.text()

    return analysis
  } catch (error) {
    console.error('案例分析错误:', error)
    throw new Error(`案例分析失败: ${error.message}`)
  }
}

