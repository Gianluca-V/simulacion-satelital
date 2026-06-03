import { useUIStore } from '../../stores/uiStore'

export function HelpInstructions() {
  const show = useUIStore((s) => s.showHelp)
  const toggleHelp = useUIStore((s) => s.toggleHelp)
  if (!show) return null

  return (
    <div style={styles.overlay} onClick={toggleHelp}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}><span>🚀 Simulador de Comunicaciones Satelitales</span><button onClick={toggleHelp} style={styles.closeBtn}>✕</button></div>
        <div style={styles.content}>
          <Section title="🎯 Colocar nodos"><p>Haz clic en <b>➕ LEO</b>, <b>➕ MEO</b> o <b>➕ GEO</b> en la barra superior para añadir satélites en diferentes órbitas.</p><p>Las bases terrestres se agregan automáticamente al hacer clic en el planeta.</p></Section>
          <Section title="🖱 Navegar la escena 3D"><p><b>Arrastrar</b> con el mouse para rotar la vista.</p><p><b>Rueda del mouse</b> para acercar/alejar.</p><p>Haz clic en cualquier satélite o base para seleccionarlo y ver sus parámetros.</p></Section>
          <Section title="📨 Enviar mensajes"><p>Abre el panel <b>📨 Mensaje</b>, selecciona origen y destino, escribe el contenido y presiona <b>Enviar</b>.</p><p>Se mostrará una animación del enlace y los resultados en <b>📊 Telemetría</b>.</p></Section>
          <Section title="🌦 Clima"><p>Usa el panel <b>🌦 Clima</b> para cambiar las condiciones atmosféricas.</p><p>Cada clima afecta la atenuación de la señal (ITU-R P.676, P.838, P.840):</p><ul style={{ margin: '4px 0', paddingLeft: 20, fontSize: 12, color: '#99a' }}><li>Despejado: atenuación mínima</li><li>Lluvia: atenúa según tasa de precipitación</li><li>Niebla: atenúa en altas frecuencias</li><li>Tormenta: máxima atenuación</li></ul></Section>
          <Section title="📊 Telemetría"><p>Muestra en tiempo real para el último mensaje:</p><div style={styles.metrics}><span>FSPL · Atenuación atmosférica · Potencia recibida</span><span>SNR · C/N₀ · Eb/N₀ · Margen de enlace</span><span>Latencia (ms) · Throughput (Mbps) · Desplazamiento Doppler</span></div><p style={{ fontSize: 10, color: '#556', marginTop: 4 }}>Basado en modelos ITU-R y constantes físicas reales (c = 299,792 km/s, k = 1.38×10⁻²³ J/K)</p></Section>
          <Section title="⌨ Atajos"><p><b>Pausa/Reanudar</b> simulación desde la barra superior</p></Section>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return (<div style={styles.section}><div style={styles.sectionTitle}>{title}</div><div style={styles.sectionContent}>{children}</div></div>) }

const styles: Record<string, React.CSSProperties> = { overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }, modal: { background: 'rgba(12, 20, 36, 0.97)', borderRadius: 14, border: '1px solid rgba(80, 140, 240, 0.2)', width: '90%', maxWidth: 600, maxHeight: '85vh', overflow: 'auto', padding: 0, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }, header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 16, fontWeight: 700, color: '#8ab', position: 'sticky', top: 0, background: 'rgba(12, 20, 36, 0.99)', borderRadius: '14px 14px 0 0' }, closeBtn: { background: 'rgba(255,255,255,0.08)', border: 'none', color: '#889', cursor: 'pointer', fontSize: 16, padding: '4px 10px', borderRadius: 6, transition: 'all 0.15s' }, content: { padding: '8px 20px 20px' }, section: { marginTop: 14 }, sectionTitle: { fontSize: 14, fontWeight: 600, color: '#aac', marginBottom: 4 }, sectionContent: { fontSize: 12, color: '#99a', lineHeight: 1.6 }, metrics: { display: 'flex', flexDirection: 'column', gap: 2, fontSize: 11, color: '#778', fontFamily: 'monospace', background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '6px 10px', marginTop: 4 } }
