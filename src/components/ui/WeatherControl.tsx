import { DraggablePanel } from './DraggablePanel'
import { useUIStore } from '../../stores/uiStore'
import { useSimulationStore } from '../../stores/simulationStore'
import { getWeatherDescription } from '../../engine/weather'

const CONDITIONS = ['Clear', 'LightRain', 'ModerateRain', 'HeavyRain', 'Storm', 'Fog', 'Snow']

export function WeatherControl() {
  const weather = useSimulationStore((s) => s.weather)
  const setWeather = useSimulationStore((s) => s.setWeather)
  const show = useUIStore((s) => s.showWeatherControl)
  if (!show) return null
  return (
    <DraggablePanel panelId="weather" defaultPosition={{ x: 12, y: 68 }} style={{ width: 200 }}>
      <div style={styles.panel}>
        <div style={styles.header}>🌦 Clima</div>
        <div style={styles.current}>{getWeatherDescription(weather)}</div>
        <div style={styles.grid}>{CONDITIONS.map((c) => (<button key={c} onClick={() => setWeather(c)} style={{ ...styles.btn, background: weather.condition === c ? 'rgba(80, 160, 240, 0.18)' : 'transparent', borderColor: weather.condition === c ? 'rgba(80, 160, 240, 0.45)' : 'rgba(255,255,255,0.08)', color: weather.condition === c ? '#6cf' : '#889' }}>{c === 'Clear' ? '☀ Despejado' : c === 'LightRain' ? '🌦 Lluvia ligera' : c === 'ModerateRain' ? '🌧 Lluvia mod.' : c === 'HeavyRain' ? '🌧 Lluvia int.' : c === 'Storm' ? '⛈ Tormenta' : c === 'Fog' ? '🌫 Niebla' : '❄ Nieve'}</button>))}</div>
        <div style={styles.params}>
          <P label="Lluvia" value={`${weather.rainRate} mm/h`} /><P label="Vapor agua" value={`${weather.waterVaporDensity} g/m³`} /><P label="Nubes" value={`${weather.cloudLiquidWater} g/m³`} /><P label="Temperatura" value={`${weather.temperature}°C`} /><P label="Humedad" value={`${weather.humidity}%`} /><P label="Visibilidad" value={`${weather.visibility} km`} />
        </div>
      </div>
    </DraggablePanel>
  )
}
function P({ label, value }: { label: string; value: string }) { return (<div style={styles.row}><span style={styles.label}>{label}</span><span style={styles.val}>{value}</span></div>) }
const styles: Record<string, React.CSSProperties> = { panel: { width: 200, background: 'rgba(8, 14, 28, 0.92)', borderRadius: 10, backdropFilter: 'blur(14px)', border: '1px solid rgba(80, 140, 240, 0.15)', padding: '10px 12px' }, header: { fontSize: 12, fontWeight: 700, color: '#8ab', marginBottom: 6 }, current: { fontSize: 10, color: '#889', marginBottom: 6 }, grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, marginBottom: 8 }, btn: { padding: '3px 6px', borderRadius: 4, fontSize: 10, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.12s', fontFamily: 'inherit', textAlign: 'left' }, params: { borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 2 }, row: { display: 'flex', justifyContent: 'space-between', fontSize: 10 }, label: { color: '#667' }, val: { color: '#99a', fontWeight: 500, fontFamily: 'monospace' } }
