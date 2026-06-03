import { DraggablePanel } from './DraggablePanel'
import { useUIStore } from '../../stores/uiStore'
import { useSimulationStore } from '../../stores/simulationStore'

export function TelemetryPanel() {
  const show = useUIStore((s) => s.showTelemetry)
  const messages = useSimulationStore((s) => s.messages)
  const selectedMessageId = useUIStore((s) => s.selectedMessageId)
  if (!show) return null
  const msg = selectedMessageId ? messages.find(m => m.id === selectedMessageId) : [...messages].reverse().find(m => m.linkBudget)
  return (
    <DraggablePanel panelId="telemetry" defaultPosition={{ x: window.innerWidth - 252, y: 68 }} style={{ width: 240 }}>
      <div style={styles.panel}>
        <div style={styles.header}>📊 Telemetría</div>
        {!msg || !msg.linkBudget ? <div style={styles.empty}>Seleccioná un mensaje del historial</div> : <Content msg={msg} />}
      </div>
    </DraggablePanel>
  )
}

function Content({ msg }: { msg: any }) {
  const lb = msg.linkBudget; const ok = lb.linkMargin > 0
  return (<><div style={styles.status}>Estado: <span style={{ color: ok ? '#0f8' : '#f44' }}>{ok ? '✅ Completado' : '❌ Fallido'}</span></div>
    <div style={styles.grid}><Row label="Distancia" value={`${lb.distance.toFixed(0)} km`} /><Row label="Frecuencia" value={`${lb.frequency} GHz`} /><Row label="FSPL" value={`${lb.fspl.toFixed(1)} dB`} /><Row label="Aten. gases" value={`${lb.gasAttenuation.toFixed(2)} dB`} /><Row label="Aten. lluvia" value={`${lb.rainAttenuation.toFixed(2)} dB`} /><Row label="Aten. nubes" value={`${lb.cloudAttenuation.toFixed(2)} dB`} /><Row label="Aten. total" value={`${lb.totalAttenuation.toFixed(2)} dB`} /><Row label="Pot. recibida" value={`${lb.receivedPower.toFixed(1)} dBm`} highlight /><Row label="C/N₀" value={`${lb.cNo.toFixed(1)} dB-Hz`} /><Row label="SNR" value={`${lb.snr.toFixed(1)} dB`} /><Row label="Eb/N₀" value={`${lb.ebNo.toFixed(1)} dB`} /><Row label="Margen" value={`${lb.linkMargin.toFixed(1)} dB`} color={ok ? '#0f8' : '#f44'} highlight /><Row label="Latencia" value={`${lb.propagationDelay.toFixed(1)} ms`} highlight /><Row label="Doppler" value={`${lb.dopplerShift.toFixed(1)} Hz`} /><Row label="Throughput" value={`${(lb.bitRate / 1e6).toFixed(1)} Mbps`} highlight /><Row label="Temp. ruido" value={`${lb.noiseTemperature.toFixed(0)} K`} /></div>
    <div style={styles.footer}>Basado en ITU-R P.676 · P.838 · P.840</div></>)
}

function Row({ label, value, color, highlight }: { label: string; value: string; color?: string; highlight?: boolean }) { return (<div style={styles.row}><span style={styles.label}>{label}</span><span style={{ ...styles.value, color: color || (highlight ? '#eef' : '#bbb'), fontWeight: highlight ? 600 : 400 }}>{value}</span></div>) }

const styles: Record<string, React.CSSProperties> = { panel: { maxHeight: 'calc(100vh - 80px)', overflowY: 'auto', background: 'rgba(8, 14, 28, 0.92)', borderRadius: 10, backdropFilter: 'blur(14px)', border: '1px solid rgba(80, 140, 240, 0.15)', padding: '10px 12px' }, header: { fontSize: 12, fontWeight: 700, color: '#8ab', marginBottom: 8, letterSpacing: '0.3px' }, empty: { fontSize: 11, color: '#556' }, status: { fontSize: 10, color: '#555', marginBottom: 6 }, grid: { display: 'flex', flexDirection: 'column', gap: 2 }, row: { display: 'flex', justifyContent: 'space-between', fontSize: 10, padding: '2px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }, label: { color: '#778' }, value: { fontFamily: 'monospace' }, footer: { fontSize: 8, color: '#445', marginTop: 8, textAlign: 'center', letterSpacing: '0.2px' } }
