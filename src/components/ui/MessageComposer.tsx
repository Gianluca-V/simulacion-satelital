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
    const result = simulateTransmission(createMessage(source, dest, content), source, dest, weather)
    const msg = { ...result.message, id: result.message.id, status: 'transmitting' as const }
    addMessage(msg)
    setSending(true)
    let progress = 0
    const interval = setInterval(() => { progress += 2; updateMessage(msg.id, { progress }); if (progress >= 100) { clearInterval(interval); updateMessage(msg.id, { status: result.message.status, linkBudget: result.budget, progress: 100 }); setSending(false) } }, 100)
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
  const [query, setQuery] = useState(''); const [open, setOpen] = useState(false)
  const filtered = query ? nodes.filter((n: any) => n.name.toLowerCase().includes(query.toLowerCase()) || n.id.toLowerCase().includes(query.toLowerCase())) : nodes
  const selected = nodes.find((n: any) => n.id === value)
  return (<div style={{ flex: 1, position: 'relative' }}><div style={{ fontSize: 10, color: '#666', marginBottom: 2 }}>{label}</div>
    <input value={open ? query : (selected ? `${selected.name} (${selected.type === 'satellite' ? '🛰' : '📡'})` : '')} placeholder="Buscar..." onChange={(e) => { setQuery(e.target.value); setOpen(true) }} onFocus={() => { setQuery(''); setOpen(true) }} onBlur={() => setTimeout(() => setOpen(false), 150)} style={{ width: '100%', padding: '5px 8px', borderRadius: 6, fontSize: 11, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#ccc', boxSizing: 'border-box', fontFamily: 'inherit' }} />
    {open && <div style={styles.dropdown}>{filtered.length === 0 ? <div style={styles.noResults}>Sin resultados</div> : filtered.map((n: any) => (<div key={n.id} onClick={() => { onChange(n.id); setOpen(false); setQuery('') }} style={{ ...styles.item, background: n.id === value ? 'rgba(0,150,255,0.12)' : 'transparent' }}>{n.name} <span style={{ fontSize: 9, color: '#667' }}>{n.type === 'satellite' ? '🛰' : '📡'}</span></div>))}</div>}
  </div>)
}

const styles: Record<string, React.CSSProperties> = { dropdown: { position: 'absolute', top: 38, left: 0, right: 0, background: 'rgba(12, 20, 36, 0.97)', border: '1px solid rgba(80, 140, 240, 0.2)', borderRadius: 6, maxHeight: 180, overflowY: 'auto', zIndex: 1100, backdropFilter: 'blur(8px)' }, item: { padding: '5px 8px', fontSize: 11, color: '#ccc', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)' }, noResults: { padding: 8, fontSize: 10, color: '#556', textAlign: 'center' } }
