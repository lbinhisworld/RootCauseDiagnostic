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
import ChatPanel from './ChatPanel'
import ZoomLevelDisplay from './ZoomLevelDisplay'
import './DiagnosticCanvas.css'

const nodeTypes = {
  custom: CustomNode,
}

function DiagnosticCanvas({ initialProblem, onBack }) {
  const addChildNodeRef = useRef(null)
  const updateNodeLabelRef = useRef(null)
  const selectedNodeIdRef = useRef(null)
  const [selectedNodeId, setSelectedNodeId] = useState('0')

  const initialNodes = useMemo(() => [
    {
      id: '0',
      type: 'custom',
      position: { x: 400, y: 80 },
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

  const addChildNode = useCallback((parentId, label = '请输入原因...') => {
    const newNodeId = `${Date.now()}`
    
    // 使用refs获取最新状态
    const currentNodes = nodesRef.current
    const currentEdges = edgesRef.current
    
    const parentNode = currentNodes.find(n => n.id === parentId)
    if (!parentNode) return

    // 计算已有子节点数量
    const childCount = currentEdges.filter(e => e.source === parentId).length

    // 节点尺寸和间距设置
    const nodeWidth = 140 // 节点宽度
    const nodeHeight = 140 // 节点高度
    const horizontalSpacing = 220 // 水平间距（节点宽度 + 间距）
    const verticalSpacing = 180 // 垂直间距（节点高度 + 间距）
    
    // 计算新节点位置
    let newX = parentNode.position.x
    
    if (childCount > 0) {
      // 多个子节点，平均分布在父节点下方
      // 计算所有子节点的总宽度
      const totalWidth = childCount * horizontalSpacing
      // 计算起始位置，使子节点以父节点为中心对称分布
      const startX = parentNode.position.x - (totalWidth / 2) + (horizontalSpacing / 2)
      newX = startX + (childCount * horizontalSpacing)
    }

    const newPosition = {
      x: newX,
      y: parentNode.position.y + verticalSpacing,
    }

    // 创建新节点
    const newNode = {
      id: newNodeId,
      type: 'custom',
      position: newPosition,
      data: { 
        label: label,
        isRoot: false,
        nodeIndex: currentNodes.length, // 新节点的索引
      },
    }

    // 创建新边（箭头会在edgesWithMarkers中自动添加）
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
    let nodeIndex = 0
    return nodes.map((node) => {
      const index = nodeIndex++
      return {
        ...node,
        data: {
          ...node.data,
          nodeIndex: index,
          selectedNodeId: selectedNodeId,
          onAddChild: addChildNode,
          onUpdateLabel: updateNodeLabel,
        },
      }
    })
  }, [nodes, selectedNodeId, addChildNode, updateNodeLabel])

  // 为所有边添加箭头
  const edgesWithMarkers = useMemo(() => {
    return edges.map((edge) => ({
      ...edge,
      markerEnd: {
        type: 'arrowclosed',
        width: 30,
        height: 30,
        color: '#b1b1b7',
      },
    }))
  }, [edges])

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
      <div className="canvas-main-content">
        <div className="chat-panel-wrapper">
          <ChatPanel 
            nodes={nodes}
            onSelectNode={setSelectedNodeId}
            selectedNodeId={selectedNodeId}
            onUpdateNodeLabel={updateNodeLabel}
            onAddChildNode={addChildNode}
          />
        </div>
        <div className="react-flow-wrapper">
        <ReactFlow
          nodes={nodesWithCallbacks}
          edges={edgesWithMarkers}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          attributionPosition="top-right"
        >
            <Background />
            <Controls />
            <MiniMap />
            <ZoomLevelDisplay />
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}

export default DiagnosticCanvas

