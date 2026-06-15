import { DraggablePanel } from './DraggablePanel'
import { useUIStore } from '../../stores/uiStore'
import { useSimulationStore } from '../../stores/simulationStore'

export function NodePanel() {
  const show = useUIStore((s) => s.showNodePanel)
  const satellites = useSimulationStore((s) => s.satellites)
  const groundStations = useSimulationStore((s) => s.groundStations)
  const selectedNodeId = useSimulationStore((s) => s.selectedNodeId)
  const updateNode = useSimulationStore((s) => s.updateNode)
  const removeNode = useSimulationStore((s) => s.removeNode)
  if (!show) return null
  const allNodes = [...satellites, ...groundStations]; const selected = allNodes.find(n => n.id === selectedNodeId)

  return (
    <DraggablePanel panelId="nodePanel" defaultPosition={{ x: window.innerWidth - 232, y: 68 }} style={{ width: 220 }}>
      <div style={styles.panel}>
        <div style={styles.header}>⚙ Nodo</div>
        {!selected ? <div style={styles.hint}>Haz clic en un satélite o base en la escena 3D</div> : (
          <><input value={selected.name} onChange={(e) => updateNode(selected.id, { name: e.target.value })} style={styles.nameInput} /><div style={styles.type}>{selected.type === 'satellite' ? '🛰 Satélite' : '📡 Base Terrestre'}{selected.type === 'satellite' ? ` · ${(selected as any).orbitType} · ${(selected as any).altitude} km` : ` · ${(selected as any).lat.toFixed(1)}°, ${(selected as any).lng.toFixed(1)}°`}</div>
            <div style={styles.params}><P label="Potencia TX" value={`${selected.txPower} W`} /><P label="Ganancia TX" value={`${selected.txGain} dBi`} /><P label="Ganancia RX" value={`${selected.rxGain} dBi`} /><P label="Frecuencia" value={`${selected.frequency} GHz`} /><P label="Ancho banda" value={`${(selected.bandwidth / 1e6).toFixed(0)} MHz`} />{selected.type === 'satellite' && <><P label="Inclinación" value={`${(selected as any).orbitalElements.inclination.toFixed(1)}°`} /><P label="RAAN" value={`${(selected as any).orbitalElements.raan.toFixed(1)}°`} /></>}</div>
            <button onClick={() => removeNode(selected.id)} style={styles.deleteBtn}>Eliminar nodo</button>
          </>
        )}
      </div>
    </DraggablePanel>
  )
}
function P({ label, value }: { label: string; value: string }) { return (<div style={styles.row}><span style={styles.label}>{label}</span><span style={styles.value}>{value}</span></div>) }
const styles: Record<string, React.CSSProperties> = { panel: { background: 'rgba(8, 14, 28, 0.92)', borderRadius: 10, backdropFilter: 'blur(14px)', border: '1px solid rgba(80, 140, 240, 0.15)', padding: '10px 12px' }, header: { fontSize: 12, fontWeight: 700, color: '#8ab', marginBottom: 8 }, hint: { fontSize: 11, color: '#556' }, nameInput: { fontSize: 13, fontWeight: 600, color: '#dde', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4, padding: '3px 6px', width: '100%', boxSizing: 'border-box', marginBottom: 4, fontFamily: 'inherit' }, type: { fontSize: 10, color: '#889', marginBottom: 8 }, params: { display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 10 }, row: { display: 'flex', justifyContent: 'space-between', fontSize: 11 }, label: { color: '#778' }, value: { color: '#bbc', fontWeight: 500 }, deleteBtn: { marginTop: 4, padding: '5px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer', width: '100%', background: 'rgba(255,50,50,0.12)', border: '1px solid rgba(255,50,50,0.25)', color: '#f55', transition: 'all 0.15s', fontFamily: 'inherit' } }
