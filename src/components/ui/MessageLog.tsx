import { DraggablePanel } from './DraggablePanel'
import { useUIStore } from '../../stores/uiStore'
import { useSimulationStore } from '../../stores/simulationStore'
import { MAX_LOG_MESSAGES } from '../../utils/constants'

export function MessageLog() {
  const show = useUIStore((s) => s.showMessageLog)
  const messages = useSimulationStore((s) => s.messages)
  const satellites = useSimulationStore((s) => s.satellites)
  const groundStations = useSimulationStore((s) => s.groundStations)
  const selectNode = useSimulationStore((s) => s.selectNode)
  const setSelectedMessage = useUIStore((s) => s.setSelectedMessage)
  const toggleNodePanel = useUIStore((s) => s.toggleNodePanel)
  const toggleTelemetry = useUIStore((s) => s.toggleTelemetry)
  const showNodePanel = useUIStore((s) => s.showNodePanel)
  const showTelemetry = useUIStore((s) => s.showTelemetry)
  if (!show) return null
  const allNodes = [...satellites, ...groundStations]

  const handleClick = (msgId: string, nodeId: string) => {
    setSelectedMessage(msgId)
    selectNode(nodeId)
    if (!showNodePanel) toggleNodePanel()
    if (!showTelemetry) toggleTelemetry()
  }

  return (
    <DraggablePanel panelId="messageLog" defaultPosition={{ x: 12, y: 68 }} style={{ width: 260 }}>
      <div style={styles.panel}>
        <div style={styles.header}>📋 Historial ({messages.length})</div>
        {messages.length === 0 ? <div style={styles.empty}>Sin mensajes aún</div> : (
          <div style={styles.list}>{[...messages].reverse().slice(0, MAX_LOG_MESSAGES).map((msg) => { const src = allNodes.find(n => n.id === msg.sourceId); const dst = allNodes.find(n => n.id === msg.destId); const ok = msg.status === 'completed'; const fail = msg.status === 'failed'; const tx = msg.status === 'transmitting'; const time = new Date(msg.timestamp).toLocaleTimeString(); return (<div key={msg.id} onClick={() => handleClick(msg.id, msg.sourceId)} style={styles.item}><div style={styles.itemHeader}><span style={styles.time}>{time}</span><span style={{ color: ok ? '#0f8' : fail ? '#f44' : tx ? '#ff0' : '#888', fontSize: 10 }}>{ok ? '✅' : fail ? '❌' : tx ? '🔄' : '⏳'}</span></div><div style={styles.route}>{src?.name || '?'} → {dst?.name || '?'}</div><div style={styles.content}>{msg.content.length > 30 ? msg.content.slice(0, 30) + '…' : msg.content}</div>{msg.linkBudget && <div style={styles.meta}>{msg.linkBudget.propagationDelay.toFixed(1)}ms · {(msg.linkBudget.bitRate / 1e6).toFixed(1)}Mbps · Margen {msg.linkBudget.linkMargin.toFixed(1)}dB{fail && msg.linkBudget.linkMargin > 0 ? ' · 🚫 LOS' : ''}</div>}</div>) })}</div>
        )}
      </div>
    </DraggablePanel>
  )
}

const styles: Record<string, React.CSSProperties> = { panel: { maxHeight: 420, overflowY: 'auto', background: 'rgba(8, 14, 28, 0.92)', borderRadius: 10, backdropFilter: 'blur(14px)', border: '1px solid rgba(80, 140, 240, 0.15)', padding: '10px 12px' }, header: { fontSize: 12, fontWeight: 700, color: '#8ab', marginBottom: 8 }, empty: { fontSize: 11, color: '#556' }, list: { display: 'flex', flexDirection: 'column', gap: 3 }, item: { padding: '5px 7px', borderRadius: 5, background: 'rgba(255,255,255,0.03)', fontSize: 10, cursor: 'pointer', transition: 'background 0.15s' }, itemHeader: { display: 'flex', justifyContent: 'space-between' }, time: { color: '#556', fontSize: 9 }, route: { color: '#99a', marginTop: 1 }, content: { color: '#667', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, meta: { color: '#556', fontSize: 9, marginTop: 2, fontFamily: 'monospace' } }
