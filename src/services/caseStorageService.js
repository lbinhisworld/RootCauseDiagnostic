/**
 * 案例存储服务
 * 使用 localStorage 保存案例数据
 */

const STORAGE_KEY = 'root_cause_cases'

/**
 * 从分析结果中提取关键信息
 * @param {string} analysisResult - 分析结果文本
 * @returns {Object} 提取的信息
 */
export function extractCaseInfo(analysisResult) {
  if (!analysisResult) {
    return {
      vendor: '未知厂商',
      customerName: '未知客户',
      painPointSummary: '未提取到价值信息'
    }
  }

  // 提取50字价值简介（从第1部分）
  let painPointSummary = '未提取到价值信息'
  const valueMatch = analysisResult.match(/##\s*1\.\s*50字价值简介[\s\S]*?\*\s*([^\n]+)/i) ||
                     analysisResult.match(/##\s*1\.\s*50字价值简介[\s\S]*?([^\n]{1,50})/i)
  if (valueMatch) {
    painPointSummary = valueMatch[1].trim()
    // 确保不超过50字
    if (painPointSummary.length > 50) {
      painPointSummary = painPointSummary.substring(0, 50) + '...'
    }
  }

  // 提取厂商名称（从第6部分：软件工具与厂商价值清单）
  let vendor = '未知厂商'
  const vendorSectionMatch = analysisResult.match(/##\s*6\.\s*软件工具与厂商价值清单[\s\S]*?(\*\*厂商名称[：:]\s*([^\n\|]+))/i)
  if (vendorSectionMatch) {
    vendor = vendorSectionMatch[2]?.trim() || vendorSectionMatch[1]?.trim()
  }
  
  // 如果没找到，尝试其他格式
  if (vendor === '未知厂商') {
    const vendorAltMatch = analysisResult.match(/\*\*厂商名称\s*[｜|]\s*软件工具名称\*\*[：:]\s*([^\n]+)/i) ||
                          analysisResult.match(/\*\*厂商名称[：:]\s*([^\n\|]+)/i)
    if (vendorAltMatch) {
      vendor = vendorAltMatch[1].trim()
      // 如果包含"|"，只取前面部分
      if (vendor.includes('|') || vendor.includes('｜')) {
        vendor = vendor.split(/[|｜]/)[0].trim()
      }
    }
  }

  // 提取客户名（从企业基本画像部分提取）
  let customerName = '未知客户'
  const enterpriseMatch = analysisResult.match(/##\s*2\.\s*企业基本画像[\s\S]*?\*\s*([^\n]+)/i)
  if (enterpriseMatch) {
    const enterpriseInfo = enterpriseMatch[1].trim()
    // 尝试提取公司名
    const companyMatch = enterpriseInfo.match(/([^，,、\n]+(?:公司|集团|企业|科技|股份|有限))/)
    if (companyMatch) {
      customerName = companyMatch[1].trim()
    } else {
      // 如果没有找到公司名，使用第一行作为客户名
      customerName = enterpriseInfo.split(/[，,、]/)[0].trim()
      if (customerName.length > 20) {
        customerName = customerName.substring(0, 20) + '...'
      }
    }
  }

  // 如果还是没找到客户名，尝试从整个文本开头提取
  if (customerName === '未知客户') {
    const textLines = analysisResult.split('\n').filter(line => line.trim())
    for (const line of textLines.slice(0, 10)) {
      const companyMatch = line.match(/([^，,、\n]+(?:公司|集团|企业|科技|股份|有限))/)
      if (companyMatch) {
        customerName = companyMatch[1].trim()
        break
      }
    }
  }

  return {
    vendor: vendor || '未知厂商',
    customerName: customerName || '未知客户',
    painPointSummary: painPointSummary || '未提取到价值信息'
  }
}

/**
 * 保存案例
 * @param {string} analysisResult - 分析结果
 * @param {string} originalContent - 原始内容（可选）
 * @param {Array} images - 图片数组（可选）
 * @returns {string} 案例ID
 */
export function saveCase(analysisResult, originalContent = '', images = []) {
  const cases = getAllCases()
  const caseId = `case_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const info = extractCaseInfo(analysisResult)
  const savedAt = new Date().toISOString()

  const newCase = {
    id: caseId,
    ...info,
    analysisResult,
    originalContent,
    images: images.map(img => img.data), // 只保存base64数据
    savedAt
  }

  cases.unshift(newCase) // 新案例添加到最前面
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases))

  return caseId
}

/**
 * 获取所有案例
 * @returns {Array} 案例列表
 */
export function getAllCases() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('读取案例数据失败:', error)
    return []
  }
}

/**
 * 根据ID获取案例详情
 * @param {string} caseId - 案例ID
 * @returns {Object|null} 案例详情
 */
export function getCaseById(caseId) {
  const cases = getAllCases()
  return cases.find(c => c.id === caseId) || null
}

/**
 * 删除案例
 * @param {string} caseId - 案例ID
 */
export function deleteCase(caseId) {
  const cases = getAllCases()
  const filtered = cases.filter(c => c.id !== caseId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

/**
 * 清空所有案例
 */
export function clearAllCases() {
  localStorage.removeItem(STORAGE_KEY)
}

