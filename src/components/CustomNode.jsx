import React, { useState, useRef, useEffect } from 'react'
import { Handle, Position } from 'reactflow'
import './CustomNode.css'

function CustomNode({ id, data }) {
  const isSelected = data.selectedNodeId === id
  const [isEditing, setIsEditing] = useState(data.label === '请输入原因...')
  const [label, setLabel] = useState(data.label)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    setLabel(data.label)
  }, [data.label])

  const handleLabelChange = (e) => {
    setLabel(e.target.value)
  }

  const handleLabelBlur = () => {
    if (label.trim() && data.onUpdateLabel) {
      data.onUpdateLabel(id, label.trim())
      setIsEditing(false)
    } else {
      setLabel(data.label || '请输入原因...')
      setIsEditing(false)
    }
  }

  const handleLabelDoubleClick = () => {
    setIsEditing(true)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleLabelBlur()
    }
    if (e.key === 'Escape') {
      setLabel(data.label)
      setIsEditing(false)
    }
  }

  const handleWhyClick = (e) => {
    e.stopPropagation()
    if (data.onAddChild) {
      data.onAddChild(id)
    }
  }

  return (
    <div className={`custom-node ${isSelected ? 'selected' : ''} ${data.isRoot ? 'root-node' : ''}`}>
      <Handle type="target" position={Position.Top} />
      
      <div className="node-content">
        {isEditing ? (
          <textarea
            ref={inputRef}
            className="node-input"
            value={label}
            onChange={handleLabelChange}
            onBlur={handleLabelBlur}
            onKeyDown={handleKeyDown}
            rows={Math.min(Math.max(label.split('\n').length, 2), 5)}
          />
        ) : (
          <div 
            className="node-label"
            onDoubleClick={handleLabelDoubleClick}
            title="双击编辑"
          >
            {label}
          </div>
        )}
        
        <button
          className="why-button"
          onClick={handleWhyClick}
          title="点击添加原因节点"
        >
          Why?
        </button>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

export default CustomNode

