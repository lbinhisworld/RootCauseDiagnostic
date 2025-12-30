import React, { useState, useEffect } from 'react'
import { analyzeRootCauseWithGemini } from '../services/rootCauseAnalysisService'
import { isGeminiConfigured } from '../services/geminiService'
import { analyzeCaseContent } from '../services/caseAnalysisService'
import { getAllCases, getCaseById } from '../services/caseStorageService'
import CaseAnalysisPanel from './CaseAnalysisPanel'
import './ProblemInput.css'

function ProblemInput({ onSubmit, onAnalyzeWithAI }) {
  const [problem, setProblem] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState(null)
  const [caseContent, setCaseContent] = useState('')
  const [caseImages, setCaseImages] = useState([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [caseAnalysisResult, setCaseAnalysisResult] = useState(null)
  const [isCasePanelOpen, setIsCasePanelOpen] = useState(false)
  const [savedCases, setSavedCases] = useState([])
  const [previewCaseId, setPreviewCaseId] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!problem.trim()) return

    const problemText = problem.trim()

    // 如果配置了 Gemini 且用户想要使用 AI 分析
    if (isGeminiConfigured() && onAnalyzeWithAI) {
      setIsAnalyzing(true)
      setError(null)
      
      try {
        const { nodes, edges } = await analyzeRootCauseWithGemini(problemText)
        onAnalyzeWithAI(problemText, nodes, edges)
      } catch (err) {
        console.error('AI 分析失败:', err)
        setError(err.message || 'AI 分析失败，将使用基础模式')
        // 如果 AI 分析失败，使用基础模式
        setTimeout(() => {
          onSubmit(problemText)
        }, 2000)
      } finally {
        setIsAnalyzing(false)
      }
    } else {
      // 没有配置 Gemini，使用基础模式
      onSubmit(problemText)
    }
  }

  // 加载保存的案例列表
  useEffect(() => {
    loadSavedCases()
  }, [])

  const loadSavedCases = () => {
    const cases = getAllCases()
    setSavedCases(cases)
  }

  const handleExtractCase = async () => {
    if (!caseContent.trim() && caseImages.length === 0) {
      setError('请输入或粘贴案例内容，或上传图片')
      return
    }

    if (!isGeminiConfigured()) {
      setError('Gemini API key 未配置，无法提取案例')
      return
    }

    setIsExtracting(true)
    setError(null)
    setIsCasePanelOpen(true)
    setCaseAnalysisResult(null)
    setPreviewCaseId(null) // 清除预览ID

    try {
      const result = await analyzeCaseContent(caseContent.trim(), caseImages)
      setCaseAnalysisResult(result)
    } catch (err) {
      console.error('案例提取失败:', err)
      setError(err.message || '案例提取失败')
      setIsCasePanelOpen(false)
    } finally {
      setIsExtracting(false)
    }
  }

  const handleSaveCase = (caseId) => {
    // 案例已保存，刷新列表
    loadSavedCases()
  }

  const handlePreviewCase = (caseId) => {
    const caseData = getCaseById(caseId)
    if (caseData) {
      setCaseAnalysisResult(caseData.analysisResult)
      setPreviewCaseId(caseId)
      setIsCasePanelOpen(true)
    }
  }

  const handlePaste = (e) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      
      // 处理图片粘贴
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile()
        if (file) {
          const reader = new FileReader()
          reader.onload = (event) => {
            const imageData = event.target.result
            setCaseImages(prev => [...prev, { file, data: imageData, name: file.name }])
          }
          reader.readAsDataURL(file)
        }
      }
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const imageData = event.target.result
          setCaseImages(prev => [...prev, { file, data: imageData, name: file.name }])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const handleRemoveImage = (index) => {
    setCaseImages(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <>
      <div className="problem-input-container">
        {/* 左侧案例列表 */}
        <div className="case-list-sidebar">
          <h3 className="case-list-title">已保存案例</h3>
          {savedCases.length === 0 ? (
            <div className="empty-case-list">暂无保存的案例</div>
          ) : (
            <div className="case-list">
              {savedCases.map((caseItem) => (
                <div key={caseItem.id} className="case-list-item">
                  <div className="case-item-content">
                    <div className="case-item-header">
                      <span className="case-vendor">{caseItem.vendor}</span>
                      <span className="case-separator">｜</span>
                      <span className="case-customer">{caseItem.customerName}</span>
                    </div>
                    <div className="case-pain-point" title={caseItem.painPointSummary}>{caseItem.painPointSummary}</div>
                  </div>
                  <div className="case-item-actions">
                    <button
                      className="preview-button"
                      onClick={() => handlePreviewCase(caseItem.id)}
                    >
                      预览
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 右侧主内容区 */}
        <div className="problem-input-content">
          <h1 className="title">根因分析诊断工具</h1>
          
          {/* 案例内容提取区域 */}
          <div className="case-extract-section">
            <div className="section-header">
              <h3 className="section-title">案例内容提取</h3>
              <p className="section-desc">粘贴或输入案例内容，支持文本和图片</p>
            </div>
            <div className="multimedia-input-container">
              <textarea
                className="multimedia-textarea"
                value={caseContent}
                onChange={(e) => setCaseContent(e.target.value)}
                onPaste={handlePaste}
                placeholder="粘贴或输入案例内容（支持文本和图片粘贴）..."
                rows={8}
                disabled={isExtracting}
              />
              
              {/* 图片上传按钮 */}
              <div className="image-upload-area">
                <label className="image-upload-button">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={isExtracting}
                    style={{ display: 'none' }}
                  />
                  📷 上传图片
                </label>
                <span className="upload-hint">或直接粘贴图片</span>
              </div>

              {/* 已上传的图片预览 */}
              {caseImages.length > 0 && (
                <div className="image-preview-container">
                  {caseImages.map((img, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={img.data} alt={img.name} className="preview-image" />
                      <button
                        type="button"
                        className="remove-image-button"
                        onClick={() => handleRemoveImage(index)}
                        disabled={isExtracting}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="extract-button"
                onClick={handleExtractCase}
                disabled={isExtracting || (!caseContent.trim() && caseImages.length === 0)}
              >
                {isExtracting ? '提取中...' : '提取分析'}
              </button>
            </div>
          </div>

          {/* 问题输入区域 */}
          <div className="problem-analysis-section">
            <div className="section-header">
              <h3 className="section-title">问题根因分析</h3>
              <p className="section-desc">输入问题描述，AI将自动生成根因分析树</p>
            </div>
            <form onSubmit={handleSubmit} className="problem-form">
              <textarea
                className="problem-textarea"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="例如：客户投诉率上升..."
                rows={6}
              />
              <button 
                type="submit" 
                className="submit-button"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'AI 分析中...' : '开始分析'}
              </button>
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              {!isGeminiConfigured() && (
                <div className="info-message">
                  提示：配置 Gemini API key 后可启用 AI 智能分析功能
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* 案例分析结果侧滑面板 */}
      <CaseAnalysisPanel
        isOpen={isCasePanelOpen}
        onClose={() => {
          setIsCasePanelOpen(false)
          setPreviewCaseId(null)
        }}
        analysisResult={caseAnalysisResult}
        isLoading={isExtracting}
        originalContent={caseContent}
        images={caseImages}
        onSave={handleSaveCase}
      />
    </>
  )
}

export default ProblemInput


