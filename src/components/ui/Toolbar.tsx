import { useState } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { useSimulationStore, SPEED_PRESETS } from '../../stores/simulationStore'
import { SATELLITE_PRESETS } from '../../utils/constants'
import type { OrbitType } from '../../types'

const GS_PRESETS = [
  { name: 'Buenos Aires', lat: -34.6, lng: -58.4 },
  { name: 'Madrid', lat: 40.4, lng: -3.7 },
  { name: 'Hawái', lat: 19.6, lng: -155.0 },
  { name: 'Singapore', lat: 1.3, lng: 103.8 },
]

export function Toolbar() {
  const addSatellite = useSimulationStore((s) => s.addSatellite)
  const addGroundStation = useSimulationStore((s) => s.addGroundStation)
  const groundStations = useSimulationStore((s) => s.groundStations)
  const isPaused = useSimulationStore((s) => s.isPaused)
  const setPaused = useSimulationStore((s) => s.setPaused)
  const speed = useSimulationStore((s) => s.speed)
  const setSpeed = useSimulationStore((s) => s.setSpeed)
  const [showSatMenu, setShowSatMenu] = useState<OrbitType | null>(null)
  const [showGS, setShowGS] = useState(false)
  const { toggleNodePanel, toggleTelemetry, toggleMessageLog, toggleMessageComposer, toggleWeatherControl, toggleEarthLockedView, showNodePanel, showTelemetry, showMessageLog, showMessageComposer, showWeatherControl, earthLockedView } = useUIStore()
  const toggleHelp = useUIStore((s) => s.toggleHelp)

  const handleSatMenu = (type: OrbitType) => { setShowSatMenu(showSatMenu === type ? null : type); setShowGS(false) }
  const handleSelectPreset = (type: OrbitType, presetIdx: number) => { addSatellite(type, SATELLITE_PRESETS[type][presetIdx]); setShowSatMenu(null) }

  return (
    <>
      {isPaused && <div style={styles.pausedOverlay}><div style={styles.pausedText}>⏸ PAUSA — Click ▶ para reanudar</div></div>}
      <div style={styles.bar}>
        <div style={styles.satGroup}>
          <ToolBtn label="➕ LEO" onClick={() => handleSatMenu('LEO')} active={showSatMenu === 'LEO'} color="#4488ff" />
          {showSatMenu === 'LEO' && (
            <div style={styles.presetMenu}>{SATELLITE_PRESETS.LEO.map((p, i) => (<button key={p.label} onClick={() => handleSelectPreset('LEO', i)} style={styles.presetBtn}>{p.label}</button>))}</div>
          )}
        </div>
        <div style={styles.satGroup}>
          <ToolBtn label="➕ MEO" onClick={() => handleSatMenu('MEO')} active={showSatMenu === 'MEO'} color="#66aaff" />
          {showSatMenu === 'MEO' && (
            <div style={styles.presetMenu}>{SATELLITE_PRESETS.MEO.map((p, i) => (<button key={p.label} onClick={() => handleSelectPreset('MEO', i)} style={styles.presetBtn}>{p.label}</button>))}</div>
          )}
        </div>
        <div style={styles.satGroup}>
          <ToolBtn label="➕ GEO" onClick={() => handleSatMenu('GEO')} active={showSatMenu === 'GEO'} color="#88ccff" />
          {showSatMenu === 'GEO' && (
            <div style={styles.presetMenu}>{SATELLITE_PRESETS.GEO.map((p, i) => (<button key={p.label} onClick={() => handleSelectPreset('GEO', i)} style={styles.presetBtn}>{p.label}</button>))}</div>
          )}
        </div>
        <ToolBtn label="📡 ＋" onClick={() => { setShowGS(!showGS); setShowSatMenu(null) }} active={showGS} color="#88dd88" />
        {showGS && <div style={styles.gsMenu}>{GS_PRESETS.map((gs) => { const placed = groundStations.some(g => g.lat === gs.lat && g.lng === gs.lng); if (placed) return null; return (<button key={gs.name} onClick={() => { addGroundStation(gs.lat, gs.lng, gs.name); setShowGS(false) }} style={styles.gsBtn}>{gs.name}</button>) })}{GS_PRESETS.every(gs => groundStations.some(g => g.lat === gs.lat && g.lng === gs.lng)) && <span style={{ fontSize: 10, color: '#556', padding: '4px' }}>Todas las bases agregadas</span>}</div>}
        <Divider />
        <ToolBtn label={isPaused ? '▶' : '⏸'} onClick={() => setPaused(!isPaused)} color="#ffaa00" active={isPaused} />
        <ToolBtn label="🌍" onClick={toggleEarthLockedView} active={earthLockedView} color="#44ddff" />
        <div style={styles.speedGroup}>{SPEED_PRESETS.map((s) => (<button key={s} onClick={() => setSpeed(s)} style={{ ...styles.speedBtn, background: speed === s ? 'rgba(255,170,0,0.2)' : 'transparent', borderColor: speed === s ? 'rgba(255,170,0,0.5)' : 'rgba(255,255,255,0.08)', color: speed === s ? '#ffaa00' : '#889' }}>{s}×</button>))}</div>
        <Divider />
        <ToolBtn label="📨" onClick={toggleMessageComposer} active={showMessageComposer} color="#00ff88" />
        <ToolBtn label="📊" onClick={toggleTelemetry} active={showTelemetry} color="#00ddff" />
        <ToolBtn label="📋" onClick={toggleMessageLog} active={showMessageLog} color="#ff8800" />
        <ToolBtn label="🌦" onClick={toggleWeatherControl} active={showWeatherControl} color="#88ddff" />
        <ToolBtn label="⚙" onClick={toggleNodePanel} active={showNodePanel} color="#cc88ff" />
        <Divider />
        <ToolBtn label="❓" onClick={toggleHelp} color="#ffffff" />
      </div>
    </>
  )
}

function ToolBtn({ label, onClick, active, color, feedback }: { label: string; onClick: () => void; active?: boolean; color?: string; feedback?: boolean }) {
  return <button onClick={onClick} style={{ ...styles.btn, borderColor: active ? color || '#888' : 'rgba(255,255,255,0.12)', background: active ? `rgba(${hexToRgb(color || '#888')}, 0.15)` : feedback ? `rgba(${hexToRgb(color || '#888')}, 0.08)` : 'transparent', color: active ? color || '#ccc' : '#ccc', transform: feedback ? 'scale(0.95)' : 'scale(1)' }}>{label}</button>
}

function Divider() { return <div style={styles.divider} /> }
function hexToRgb(hex: string): string { const r = parseInt(hex.slice(1, 3), 16); const g = parseInt(hex.slice(3, 5), 16); const b = parseInt(hex.slice(5, 7), 16); return `${r},${g},${b}` }

const styles: Record<string, React.CSSProperties> = { bar: { position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4, padding: '6px 12px', background: 'rgba(8, 14, 28, 0.92)', borderRadius: 12, backdropFilter: 'blur(16px)', border: '1px solid rgba(80, 140, 240, 0.18)', zIndex: 1000, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }, btn: { padding: '6px 11px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', fontSize: 11, fontWeight: 500, transition: 'all 0.15s ease', fontFamily: 'inherit', whiteSpace: 'nowrap', userSelect: 'none' }, divider: { width: 1, background: 'rgba(255,255,255,0.08)', margin: '0 2px' }, gsMenu: { display: 'flex', gap: 2 }, gsBtn: { padding: '5px 8px', borderRadius: 5, border: '1px solid rgba(136,221,136,0.25)', background: 'rgba(136,221,136,0.08)', color: '#8d8', cursor: 'pointer', fontSize: 10, fontFamily: 'inherit', whiteSpace: 'nowrap' }, presetMenu: { position: 'absolute', top: '100%', left: 0, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2, zIndex: 1001 }, satGroup: { position: 'relative', display: 'flex', flexDirection: 'column' }, presetBtn: { padding: '4px 7px', borderRadius: 5, border: '1px solid rgba(100,150,255,0.25)', background: 'rgba(80,140,240,0.08)', color: '#aac', cursor: 'pointer', fontSize: 10, fontFamily: 'inherit', whiteSpace: 'nowrap' }, speedGroup: { display: 'flex', gap: 1 }, speedBtn: { padding: '4px 6px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontSize: 10, fontWeight: 500, fontFamily: 'inherit', transition: 'all 0.15s ease', userSelect: 'none' }, pausedOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 80, pointerEvents: 'none' }, pausedText: { color: '#ffaa00', fontSize: 18, fontWeight: 700, textShadow: '0 2px 12px rgba(0,0,0,0.8)', letterSpacing: 2 } }
