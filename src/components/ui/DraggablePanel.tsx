import { useState, useRef, useCallback, useEffect } from 'react'
import { useUIStore } from '../../stores/uiStore'

interface Props { panelId: string; defaultPosition: { x: number; y: number }; children: React.ReactNode; style?: React.CSSProperties }

export function DraggablePanel({ panelId, defaultPosition, children, style }: Props) {
  const storedPos = useUIStore((s) => s.panelPositions[panelId])
  const setPanelPosition = useUIStore((s) => s.setPanelPosition)
  const initialPos = storedPos || defaultPosition
  const [pos, setPos] = useState(initialPos)
  const dragRef = useRef({ isDragging: false, offsetX: 0, offsetY: 0 })
  const posRef = useRef(pos); posRef.current = pos

  useEffect(() => { if (storedPos) setPos(storedPos) }, [panelId, storedPos])

  const handleGrabMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    const rect = (e.currentTarget as HTMLElement).parentElement!.getBoundingClientRect()
    dragRef.current = { isDragging: true, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top }
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => { if (!dragRef.current.isDragging) return; setPos({ x: e.clientX - dragRef.current.offsetX, y: e.clientY - dragRef.current.offsetY }) }, [])
  const handleMouseUp = useCallback(() => { if (dragRef.current.isDragging) { dragRef.current.isDragging = false; setPanelPosition(panelId, posRef.current) } }, [panelId, setPanelPosition])

  useEffect(() => { window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp); return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp) } }, [handleMouseMove, handleMouseUp])

  return (
    <div style={{ position: 'absolute', left: pos.x, top: pos.y, zIndex: 850, ...style }}>
      {children}
      <div onMouseDown={handleGrabMouseDown} style={{ position: 'absolute', right: 0, bottom: 0, width: 18, height: 18, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', cursor: 'grab', padding: 2, borderBottomRightRadius: 10, userSelect: 'none' }}>
        <svg width="10" height="10" viewBox="0 0 10 10" style={{ display: 'block' }}>
          <line x1="3" y1="10" x2="10" y2="3" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          <line x1="6" y1="10" x2="10" y2="6" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          <line x1="9" y1="10" x2="10" y2="9" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  )
}
