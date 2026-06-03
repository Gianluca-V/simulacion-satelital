import { useState } from 'react'
import { DraggablePanel } from './DraggablePanel'
import { useSimulationStore } from '../../stores/simulationStore'
import { useUIStore } from '../../stores/uiStore'
import { createMessage, simulateTransmission } from '../../engine/communication'

export function MessageComposer() {
  const show = useUIStore((s) => s.showMessageComposer)
  const satellites = useSimulationStore((s) => s.satellites)
  const groundStations = useSimulationStore((s) => s.groundStations)
  const getNodeById = useSimulationStore((s) => s.getNodeById)
  const addMessage = useSimulationStore((s) => s.addMessage)
  const updateMessage = useSimulationStore((s) => s.updateMessage)
  const weather = useSimulationStore((s) => s.weather)
  const [sourceId, setSourceId] = useState(''); const [destId, setDestId] = useState(''); const [content, setContent] = useState(''); const [sending, setSending] = useState(false)
  if (!show) return null
  const allNodes = [...satellites, ...groundStations]

  const handleSend = () => {
    if (!sourceId || !destId || sourceId === destId || !content.trim()) return
    const source = getNodeById(sourceId); const dest = getNodeById(destId)
    if (!source || !dest) return
    setSending(true); const msg = createMessage(source, dest, content); msg.status = 'transmitting'; addMessage(msg)
    let progress = 0
    const interval = setInterval(() => { progress += 2; updateMessage(msg.id, { progress }); if (progress >= 100) { clearInterval(interval); const result = simulateTransmission(msg, source, dest, weather); updateMessage(result.message.id, { status: result.message.status, linkBudget: result.budget, progress: 100 }); setSending(false) } }, 100)
  }

  return (
    <DraggablePanel panelId="composer" defaultPosition={{ x: Math.round((window.innerWidth - 420) / 2), y: window.innerHeight - 160 }} style={{ width: 420 }}>
      <div style={{ background: 'rgba(10, 16, 30, 0.9)', borderRadius: 10, backdropFilter: 'blur(12px)', border: '1px solid rgba(100, 160, 255, 0.2)', padding: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#8ab', marginBottom: 8 }}>📨 Enviar Mensaje</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}><Select label="Origen" value={sourceId} onChange={setSourceId} nodes={allNodes} /><Select label="Destino" value={destId} onChange={setDestId} nodes={allNodes} /></div>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Contenido del mensaje..." rows={2} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#ccc', padding: '6px 8px', fontSize: 12, resize: 'none', boxSizing: 'border-box', marginBottom: 8, fontFamily: 'inherit' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button onClick={handleSend} disabled={sending || !sourceId || !destId || sourceId === destId || !content.trim()} style={{ padding: '6px 20px', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: sending ? 'rgba(0,255,136,0.1)' : 'rgba(0,255,136,0.2)', border: '1px solid rgba(0,255,136,0.3)', color: '#0f8', opacity: sending || !sourceId || !destId || sourceId === destId || !content.trim() ? 0.4 : 1 }}>{sending ? 'Enviando...' : 'Enviar'}</button></div>
      </div>
    </DraggablePanel>
  )
}

function Select({ label, value, onChange, nodes }: { label: string; value: string; onChange: (v: string) => void; nodes: any[] }) {
  return (<div style={{ flex: 1 }}><div style={{ fontSize: 10, color: '#666', marginBottom: 2 }}>{label}</div><select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', padding: '5px 8px', borderRadius: 6, fontSize: 11, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#ccc', cursor: 'pointer' }}><option value="">Seleccionar...</option>{nodes.map((n: any) => (<option key={n.id} value={n.id}>{n.name} ({n.type === 'satellite' ? '🛰' : '📡'})</option>))}</select></div>)
}
