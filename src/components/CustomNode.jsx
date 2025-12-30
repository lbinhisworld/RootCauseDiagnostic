import React from 'react'
import { Handle, Position } from 'reactflow'
import './CustomNode.css'

function CustomNode({ id, data }) {
  const isSelected = data.selectedNodeId === id
  const nodeIndex = data.nodeIndex !== undefined ? data.nodeIndex : ''

  const handleWhyClick = (e) => {
    e.stopPropagation()
    if (data.onAddChild) {
      data.onAddChild(id)
    }
  }

  return (
    <div className={`custom-node ${isSelected ? 'selected' : ''} ${data.isRoot ? 'root-node' : ''}`}>
      <Handle type="target" position={Position.Top} />
      
      <div className="node-number">{nodeIndex}</div>
      
      <div className="node-content">
        <div className="node-label">
          {data.label}
        </div>
        
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

