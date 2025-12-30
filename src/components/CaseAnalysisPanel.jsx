import React, { useState } from 'react'
import { saveCase } from '../services/caseStorageService'
import './CaseAnalysisPanel.css'

function CaseAnalysisPanel({ isOpen, onClose, analysisResult, isLoading, originalContent, images, onSave }) {
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  if (!isOpen) return null

  const handleSave = async () => {
    if (!analysisResult) {
      setSaveMessage('没有可保存的内容')
      return
    }

    setIsSaving(true)
    setSaveMessage('')

    try {
      const caseId = saveCase(analysisResult, originalContent, images || [])
      setSaveMessage('保存成功！')
      
      // 通知父组件案例已保存
      if (onSave) {
        onSave(caseId)
      }

      // 2秒后清除消息
      setTimeout(() => {
        setSaveMessage('')
      }, 2000)
    } catch (error) {
      console.error('保存案例失败:', error)
      setSaveMessage('保存失败，请重试')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="case-analysis-overlay" onClick={onClose}>
      <div className="case-analysis-panel" onClick={(e) => e.stopPropagation()}>
        <div className="case-analysis-header">
          <h2>案例分析结果</h2>
          <div className="header-actions">
            {analysisResult && !isLoading && (
              <button 
                className="save-button" 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? '保存中...' : '💾 保存'}
              </button>
            )}
            {saveMessage && (
              <span className="save-message">{saveMessage}</span>
            )}
            <button className="close-button" onClick={onClose}>×</button>
          </div>
        </div>
        <div className="case-analysis-content">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>正在分析案例，请稍候...</p>
            </div>
          ) : analysisResult ? (
            <div className="analysis-result" dangerouslySetInnerHTML={{ __html: formatAnalysisResult(analysisResult) }} />
          ) : (
            <div className="no-result">暂无分析结果</div>
          )}
        </div>
      </div>
    </div>
  )
}

// 格式化分析结果为HTML
function formatAnalysisResult(text) {
  if (!text) return ''
  
  // 将Markdown格式转换为HTML
  let html = text
    // 标题（需要按顺序处理，从大到小）
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    // 加粗
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // 列表项（处理多行）
    .replace(/^\* (.+)$/gim, '<li>$1</li>')
  
  // 将连续的列表项包裹在ul标签中
  html = html.split('\n').map((line, index, arr) => {
    if (line.trim().startsWith('<li>')) {
      // 检查前一行是否是列表项
      const prevLine = index > 0 ? arr[index - 1] : ''
      const nextLine = index < arr.length - 1 ? arr[index + 1] : ''
      
      // 如果是第一个列表项，添加ul开始标签
      if (!prevLine.trim().startsWith('<li>') && !prevLine.trim().startsWith('</ul>')) {
        line = '<ul>' + line
      }
      // 如果是最后一个列表项，添加ul结束标签
      if (!nextLine.trim().startsWith('<li>')) {
        line = line + '</ul>'
      }
    }
    return line
  }).join('\n')
  
  // 处理换行
  html = html.replace(/\n/g, '<br>')
  
  return html
}

export default CaseAnalysisPanel

