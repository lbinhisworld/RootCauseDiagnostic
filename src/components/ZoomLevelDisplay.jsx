import React, { useState, useEffect } from 'react'
import { useReactFlow } from 'reactflow'
import './ZoomLevelDisplay.css'

function ZoomLevelDisplay() {
  const { getZoom } = useReactFlow()
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    // 初始设置
    const updateZoom = () => {
      try {
        const currentZoom = getZoom()
        setZoom(currentZoom)
      } catch (error) {
        console.error('Error getting zoom:', error)
      }
    }
    
    updateZoom()

    // 监听缩放变化（通过定时器轮询）
    const interval = setInterval(updateZoom, 150) // 每150ms检查一次

    return () => clearInterval(interval)
  }, [getZoom])

  const zoomPercent = Math.round(zoom * 100)

  return (
    <div className="zoom-level-display">
      {zoomPercent}%
    </div>
  )
}

export default ZoomLevelDisplay

