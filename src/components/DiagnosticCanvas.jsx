import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow'
import 'reactflow/dist/style.css'
import CustomNode from './CustomNode'
import './DiagnosticCanvas.css'

const nodeTypes = {
  custom: CustomNode,
}

function DiagnosticCanvas({ initialProblem, onBack }) {
  const addChildNodeRef = useRef(null)
  const updateNodeLabelRef = useRef(null)
  const selectedNodeIdRef = useRef(null)
  const [selectedNodeId, setSelectedNodeId] = useState(null)

  const initialNodes = useMemo(() => [
    {
      id: '0',
      type: 'custom',
      position: { x: 500, y: 100 },
      data: { 
        label: initialProblem,
        isRoot: true,
      },
    },
  ], [initialProblem])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)

  // 保持refs与state同步
  useEffect(() => {
    nodesRef.current = nodes
  }, [nodes])

  useEffect(() => {
    edgesRef.current = edges
  }, [edges])

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const addChildNode = useCallback((parentId) => {
    const newNodeId = `${Date.now()}`
    
    // 使用refs获取最新状态
    const currentNodes = nodesRef.current
    const currentEdges = edgesRef.current
    
    const parentNode = currentNodes.find(n => n.id === parentId)
    if (!parentNode) return

    // 计算已有子节点数量
    const childCount = currentEdges.filter(e => e.source === parentId).length

    // 计算新节点位置
    const nodeSpacing = 280
    let newX = parentNode.position.x
    
    if (childCount > 0) {
      // 多个子节点，平均分布在父节点下方
      const totalWidth = childCount * nodeSpacing
      const startX = parentNode.position.x - (totalWidth / 2)
      newX = startX + (childCount * nodeSpacing)
    }

    const newPosition = {
      x: newX,
      y: parentNode.position.y + 180,
    }

    // 创建新节点
    const newNode = {
      id: newNodeId,
      type: 'custom',
      position: newPosition,
      data: { 
        label: '请输入原因...',
        isRoot: false,
      },
    }

    // 创建新边
    const newEdge = {
      id: `${parentId}-${newNodeId}`,
      source: parentId,
      target: newNodeId,
      type: 'smoothstep',
      animated: true,
    }

    // 更新状态
    setNodes((nds) => [...nds, newNode])
    setEdges((eds) => [...eds, newEdge])
    setSelectedNodeId(newNodeId)
  }, [setNodes, setEdges])

  const updateNodeLabel = useCallback((nodeId, newLabel) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, label: newLabel } }
          : node
      )
    )
  }, [setNodes])

  // 更新refs
  addChildNodeRef.current = addChildNode
  updateNodeLabelRef.current = updateNodeLabel
  selectedNodeIdRef.current = selectedNodeId

  // 更新所有节点的data以包含回调函数和选中状态
  const nodesWithCallbacks = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        selectedNodeId: selectedNodeId,
        onAddChild: addChildNode,
        onUpdateLabel: updateNodeLabel,
      },
    }))
  }, [nodes, selectedNodeId, addChildNode, updateNodeLabel])

  const handleNodeClick = useCallback((event, node) => {
    setSelectedNodeId(node.id)
  }, [])

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null)
  }, [])

  return (
    <div className="diagnostic-canvas-container">
      <div className="canvas-header">
        <button onClick={onBack} className="back-button">
          ← 返回输入
        </button>
        <h2 className="canvas-title">根因分析诊断画布</h2>
        <div className="canvas-info">
          {selectedNodeId && <span>已选中节点，点击节点的 "Why" 按钮可添加新分支</span>}
        </div>
      </div>
      <div className="react-flow-wrapper">
        <ReactFlow
          nodes={nodesWithCallbacks}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="top-right"
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  )
}

export default DiagnosticCanvas

