import { GoogleGenerativeAI } from '@google/generative-ai'

// 从环境变量获取 API key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

// 初始化 Gemini API
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null

/**
 * 使用 Gemini 分析问题并生成根因分析树
 * @param {string} problem - 需要分析的问题描述
 * @returns {Promise<{nodes: Array, edges: Array}>} 返回节点和边的数据结构
 */
export async function analyzeRootCauseWithGemini(problem) {
  if (!genAI) {
    throw new Error('Gemini API key 未配置。请在 .env 文件中设置 VITE_GEMINI_API_KEY')
  }

  if (!problem || !problem.trim()) {
    throw new Error('问题描述不能为空')
  }

  try {
    // 使用 Gemini 3 Flash Preview 模型（SDK会自动添加models/前缀）
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

    const prompt = `你是一个根因分析专家。请对以下问题进行根因分析，并返回一个结构化的JSON格式数据。

问题：${problem}

请分析问题的根本原因，并按照以下JSON格式返回结果：
{
  "rootProblem": "提炼后的核心问题（简洁明确，不超过30字）",
  "rootCauses": [
    {
      "label": "根本原因1（不超过20字）",
      "subCauses": [
        {
          "label": "子原因1.1（不超过20字）"
        },
        {
          "label": "子原因1.2（不超过20字）"
        }
      ]
    },
    {
      "label": "根本原因2（不超过20字）",
      "subCauses": [
        {
          "label": "子原因2.1（不超过20字）"
        }
      ]
    }
  ]
}

要求：
1. 根原因数量控制在2-4个，每个根原因最多2-3个子原因
2. 分析要深入，找出真正的原因，不要停留在表面现象
3. 所有文本都要简洁明了，适合在节点中显示
4. 只返回JSON，不要添加任何其他文字说明
5. 确保JSON格式正确，可以被解析

请开始分析：`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text().trim()

    // 尝试提取JSON（可能包含markdown代码块）
    let jsonText = text
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      jsonText = jsonMatch[1]
    }

    // 解析JSON
    let analysisData
    try {
      analysisData = JSON.parse(jsonText)
    } catch (parseError) {
      // 如果解析失败，尝试清理文本后再解析
      jsonText = jsonText.replace(/^[^{]*/, '').replace(/[^}]*$/, '')
      analysisData = JSON.parse(jsonText)
    }

    // 转换为节点和边的数据结构
    return convertToNodeEdgeStructure(analysisData, problem)
  } catch (error) {
    console.error('Gemini 根因分析错误:', error)
    throw new Error(`根因分析失败: ${error.message}`)
  }
}

/**
 * 将分析结果转换为节点和边的结构
 * @param {Object} analysisData - Gemini 返回的分析数据
 * @param {string} originalProblem - 原始问题
 * @returns {{nodes: Array, edges: Array}} 节点和边的数组
 */
function convertToNodeEdgeStructure(analysisData, originalProblem) {
  const nodes = []
  const edges = []
  
  // 节点尺寸和间距设置
  const nodeWidth = 140
  const nodeHeight = 140
  const horizontalSpacing = 220
  const verticalSpacing = 180
  
  // 创建根节点
  const rootLabel = analysisData.rootProblem || originalProblem
  const rootNode = {
    id: '0',
    type: 'custom',
    position: { x: 500, y: 80 },
    data: {
      label: rootLabel,
      isRoot: true,
      nodeIndex: 0,
    },
  }
  nodes.push(rootNode)

  // 计算根原因的位置（以根节点为中心对称分布）
  const rootCauses = analysisData.rootCauses || []
  const rootCauseCount = rootCauses.length
  
  rootCauses.forEach((rootCause, rootIndex) => {
    const rootCauseId = `${rootIndex + 1}`
    
    // 计算根原因节点的x位置（对称分布）
    let rootCauseX = 500 // 默认居中
    if (rootCauseCount > 1) {
      const totalWidth = (rootCauseCount - 1) * horizontalSpacing
      const startX = 500 - (totalWidth / 2)
      rootCauseX = startX + (rootIndex * horizontalSpacing)
    }

    // 创建根原因节点
    const rootCauseNode = {
      id: rootCauseId,
      type: 'custom',
      position: { x: rootCauseX, y: 80 + verticalSpacing },
      data: {
        label: rootCause.label,
        isRoot: false,
        nodeIndex: nodes.length,
      },
    }
    nodes.push(rootCauseNode)

    // 创建从根节点到根原因的边
    edges.push({
      id: `0-${rootCauseId}`,
      source: '0',
      target: rootCauseId,
      type: 'smoothstep',
      animated: true,
    })

    // 创建子原因节点
    const subCauses = rootCause.subCauses || []
    subCauses.forEach((subCause, subIndex) => {
      const subCauseId = `${rootCauseId}-${subIndex}`
      
      // 计算子原因的x位置
      let subCauseX = rootCauseX
      if (subCauses.length > 1) {
        const totalWidth = (subCauses.length - 1) * horizontalSpacing
        const startX = rootCauseX - (totalWidth / 2)
        subCauseX = startX + (subIndex * horizontalSpacing)
      }

      // 创建子原因节点
      const subCauseNode = {
        id: subCauseId,
        type: 'custom',
        position: { x: subCauseX, y: 80 + verticalSpacing * 2 },
        data: {
          label: subCause.label,
          isRoot: false,
          nodeIndex: nodes.length,
        },
      }
      nodes.push(subCauseNode)

      // 创建从根原因到子原因的边
      edges.push({
        id: `${rootCauseId}-${subCauseId}`,
        source: rootCauseId,
        target: subCauseId,
        type: 'smoothstep',
        animated: true,
      })
    })
  })

  return { nodes, edges }
}

