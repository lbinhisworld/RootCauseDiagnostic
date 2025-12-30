import React, { useState, useRef, useEffect } from 'react'
import './ChatPanel.css'

function ChatPanel({ nodes = [], onSelectNode, selectedNodeId, onUpdateNodeLabel, onAddChildNode }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'system',
      content: '您好！我可以帮助您进行根因分析。输入内容将更新到当前选中的节点，如果没有选中节点，我会询问您要更新到哪个节点。点击"Why模式"可以快速创建原因节点。',
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [pendingUpdateContent, setPendingUpdateContent] = useState(null)
  const [whyMode, setWhyMode] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const input = inputValue.trim()
    const messageId = messages.length + 1
    
    // 添加用户消息
    const userMessage = {
      id: messageId,
      type: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInputValue('')

    // Why模式：在当前选中节点下创建新的子节点
    if (whyMode) {
      if (selectedNodeId && onAddChildNode) {
        onAddChildNode(selectedNodeId, currentInput)
        setTimeout(() => {
          const systemMessage = {
            id: messageId + 1,
            type: 'system',
            content: `已在选中节点下创建新的原因节点：${currentInput}`,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, systemMessage])
        }, 100)
        return
      } else {
        setTimeout(() => {
          const systemMessage = {
            id: messageId + 1,
            type: 'system',
            content: 'Why模式需要先选中一个节点。请先选中节点或输入节点编号。',
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, systemMessage])
        }, 100)
        return
      }
    }

    // 检查是否是数字（节点编号）
    const nodeIndex = parseInt(currentInput, 10)
    const isNumber = !isNaN(nodeIndex)

    // 如果当前有等待更新的内容，且输入是节点编号
    if (pendingUpdateContent !== null && isNumber) {
      if (nodeIndex >= 0 && nodeIndex < nodes.length) {
        const targetNode = nodes[nodeIndex]
        if (targetNode && onSelectNode && onUpdateNodeLabel) {
          // 选中节点
          onSelectNode(targetNode.id)
          // 更新节点内容
          onUpdateNodeLabel(targetNode.id, pendingUpdateContent)
          
          setTimeout(() => {
            const systemMessage = {
              id: messageId + 1,
              type: 'system',
              content: `已选中节点 ${nodeIndex} 并更新内容：${pendingUpdateContent}`,
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, systemMessage])
          }, 100)
          
          setPendingUpdateContent(null)
          return
        }
      } else {
        // 编号超出范围
        setTimeout(() => {
          const systemMessage = {
            id: messageId + 1,
            type: 'system',
            content: `节点编号 ${nodeIndex} 不存在，当前共有 ${nodes.length} 个节点（编号：0-${nodes.length - 1}）。请重新输入节点编号。`,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, systemMessage])
        }, 100)
        return
      }
    }

    // 如果输入是节点编号（不是等待更新内容的情况）
    if (isNumber && pendingUpdateContent === null) {
      if (nodeIndex >= 0 && nodeIndex < nodes.length) {
        const targetNode = nodes[nodeIndex]
        if (targetNode && onSelectNode) {
          onSelectNode(targetNode.id)
          
          setTimeout(() => {
            const systemMessage = {
              id: messageId + 1,
              type: 'system',
              content: `已选中节点 ${nodeIndex}: ${targetNode.data.label}`,
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, systemMessage])
          }, 100)
        }
      } else {
        // 编号超出范围
        setTimeout(() => {
          const systemMessage = {
            id: messageId + 1,
            type: 'system',
            content: `节点编号 ${nodeIndex} 不存在，当前共有 ${nodes.length} 个节点（编号：0-${nodes.length - 1}）`,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, systemMessage])
        }, 100)
      }
      return
    }

    // 如果输入不是数字
    if (!isNumber) {
      // 如果有等待更新的内容，提示用户输入节点编号
      if (pendingUpdateContent !== null) {
        setTimeout(() => {
          const systemMessage = {
            id: messageId + 1,
            type: 'system',
            content: `请输入节点编号（0-${nodes.length - 1}）来选择要更新的节点。`,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, systemMessage])
        }, 100)
        return
      }

      // 检查是否有选中的节点
      if (selectedNodeId) {
        // 有选中节点，直接更新内容
        const selectedNode = nodes.find(n => n.id === selectedNodeId)
        if (selectedNode && onUpdateNodeLabel) {
          onUpdateNodeLabel(selectedNodeId, currentInput)
          
          setTimeout(() => {
            const systemMessage = {
              id: messageId + 1,
              type: 'system',
              content: `已更新节点内容：${currentInput}`,
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, systemMessage])
          }, 100)
        }
      } else {
        // 没有选中节点，询问要更新到哪个节点
        setPendingUpdateContent(currentInput)
        
        setTimeout(() => {
          const systemMessage = {
            id: messageId + 1,
            type: 'system',
            content: `当前没有选中节点，请告诉我您要更新到哪个节点（请输入节点编号：0-${nodes.length - 1}）？`,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, systemMessage])
        }, 100)
      }
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h3>对话助手</h3>
      </div>
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message message-${message.type}`}>
            <div className="message-content">{message.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-container">
        <div className="why-mode-toggle">
          <button
            type="button"
            className={`why-mode-button ${whyMode ? 'active' : ''}`}
            onClick={() => setWhyMode(!whyMode)}
            title={whyMode ? '点击关闭Why模式' : '点击开启Why模式，输入内容将在选中节点下创建原因节点'}
          >
            Why模式 {whyMode && '✓'}
          </button>
        </div>
        <form onSubmit={handleSend} className="chat-input-form">
          <input
            type="text"
            className="chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              whyMode 
                ? selectedNodeId 
                  ? "Why模式：输入内容将在选中节点下创建原因节点..." 
                  : "Why模式：请先选中节点..."
                : pendingUpdateContent 
                  ? `请输入节点编号（0-${nodes.length - 1}）` 
                  : selectedNodeId 
                    ? "输入内容将更新到选中节点..." 
                    : "输入内容..."
            }
          />
          <button type="submit" className="chat-send-button">
            发送
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatPanel

