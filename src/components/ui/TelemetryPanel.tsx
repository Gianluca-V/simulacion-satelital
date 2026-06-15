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

const TOOLTIPS: Record<string, string> = {
  Distancia: 'Distancia geométrica entre nodo fuente y destino',
  Frecuencia: 'Frecuencia de la portadora usada en la transmisión',
  FSPL: 'Free Space Path Loss — atenuación por propagación en espacio libre que aumenta con la distancia y la frecuencia',
  'Aten. gases': 'Atenuación atmosférica por absorción de oxígeno y vapor de agua (ITU-R P.676)',
  'Aten. lluvia': 'Atenuación por lluvia — depende de la intensidad de precipitación y la frecuencia (ITU-R P.838)',
  'Aten. nubes': 'Atenuación por nubes y niebla — depende del contenido de agua líquida (ITU-R P.840)',
  'Aten. total': 'Suma de todas las atenuaciones (FSPL + gases + lluvia + nubes)',
  'Pot. recibida': 'Potencia que llega al receptor en dBm, calculada desde el enlace: Pt + Gt + Gr − Atenuaciones',
  'C/N₀': 'Relación portadora a densidad de ruido — calidad de la señal antes de la demodulación',
  SNR: 'Signal-to-Noise Ratio — relación señal a ruido en el ancho de banda de la señal',
  'Eb/N₀': 'Energía por bit sobre densidad de ruido — métrica clave de eficiencia espectral',
  Margen: 'Diferencia entre Eb/N₀ y el umbral mínimo (MIN_EB_NO). Positivo = enlace viable',
  Latencia: 'Tiempo que tarda la señal en viajar del transmisor al receptor a la velocidad de la luz',
  Doppler: 'Desplazamiento en frecuencia por efecto Doppler debido al movimiento relativo entre nodos',
  Throughput: 'Tasa de bits máxima que el canal puede soportar dadas las condiciones del enlace',
  'Temp. ruido': 'Temperatura equivalente de ruido del sistema receptor (antena + LNA)',
}

function Row({ label, value, color, highlight }: { label: string; value: string; color?: string; highlight?: boolean }) {
  const tip = TOOLTIPS[label]
  return (<div style={styles.row} title={tip}><span style={styles.label}>{label}</span><span style={{ ...styles.value, color: color || (highlight ? '#eef' : '#bbb'), fontWeight: highlight ? 600 : 400 }}>{value}</span></div>)
}

const styles: Record<string, React.CSSProperties> = { panel: { maxHeight: 'calc(100vh - 80px)', overflowY: 'auto', background: 'rgba(8, 14, 28, 0.92)', borderRadius: 10, backdropFilter: 'blur(14px)', border: '1px solid rgba(80, 140, 240, 0.15)', padding: '10px 12px' }, header: { fontSize: 12, fontWeight: 700, color: '#8ab', marginBottom: 8, letterSpacing: '0.3px' }, empty: { fontSize: 11, color: '#556' }, status: { fontSize: 10, color: '#555', marginBottom: 6 }, grid: { display: 'flex', flexDirection: 'column', gap: 2 }, row: { display: 'flex', justifyContent: 'space-between', fontSize: 10, padding: '2px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }, label: { color: '#778' }, value: { fontFamily: 'monospace' }, footer: { fontSize: 8, color: '#445', marginTop: 8, textAlign: 'center', letterSpacing: '0.2px' } }
