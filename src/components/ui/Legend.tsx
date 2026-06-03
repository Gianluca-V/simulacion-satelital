import { DraggablePanel } from './DraggablePanel'
import { useUIStore } from '../../stores/uiStore'

export function Legend() {
  const show = useUIStore((s) => s.showLegend)
  if (!show) return null
  return (
    <DraggablePanel panelId="legend" defaultPosition={{ x: window.innerWidth - 162, y: window.innerHeight - 96 }}>
      <div style={styles.panel}>
        <div style={styles.title}>🎯 Leyenda</div>
        <div style={styles.items}><Item color="#4488ff" label="Satélite" /><Item color="#ff4466" label="Base terrestre" /><Item color="#00ff88" label="Origen mensaje" /><Item color="#ff8800" label="Destino mensaje" /><Item color="#ffff00" label="Seleccionado" /><Item color="#4488cc" label="Órbita" /></div>
      </div>
    </DraggablePanel>
  )
}
function Item({ color, label }: { color: string; label: string }) { return (<div style={styles.item}><div style={{ ...styles.dot, background: color }} /><span style={styles.label}>{label}</span></div>) }
const styles: Record<string, React.CSSProperties> = { panel: { background: 'rgba(8, 14, 28, 0.88)', borderRadius: 10, backdropFilter: 'blur(12px)', border: '1px solid rgba(80, 140, 240, 0.12)', padding: '8px 12px', fontSize: 11 }, title: { fontWeight: 700, color: '#8ab', marginBottom: 5, fontSize: 11 }, items: { display: 'flex', flexDirection: 'column', gap: 3 }, item: { display: 'flex', alignItems: 'center', gap: 6 }, dot: { width: 9, height: 9, borderRadius: '50%', flexShrink: 0 }, label: { color: '#99a', fontSize: 10 } }
