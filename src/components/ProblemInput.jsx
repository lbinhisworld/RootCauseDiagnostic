import React, { useState } from 'react'
import './ProblemInput.css'

function ProblemInput({ onSubmit }) {
  const [problem, setProblem] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (problem.trim()) {
      onSubmit(problem.trim())
    }
  }

  return (
    <div className="problem-input-container">
      <div className="problem-input-content">
        <h1 className="title">根因分析诊断工具</h1>
        <p className="subtitle">请输入您想要分析的问题</p>
        <form onSubmit={handleSubmit} className="problem-form">
          <textarea
            className="problem-textarea"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="例如：客户投诉率上升..."
            rows={6}
          />
          <button type="submit" className="submit-button">
            开始分析
          </button>
        </form>
      </div>
    </div>
  )
}

export default ProblemInput

