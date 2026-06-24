import { useUIStore } from '../../stores/uiStore'
import { SATELLITE_PRESETS } from '../../utils/constants'
import type { OrbitType } from '../../types'

export function HelpInstructions() {
  const show = useUIStore((s) => s.showHelp)
  const toggleHelp = useUIStore((s) => s.toggleHelp)
  if (!show) return null

  return (
    <div style={styles.overlay} onClick={toggleHelp}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}><span>🚀 Simulador de Comunicaciones Satelitales</span><button onClick={toggleHelp} style={styles.closeBtn}>✕</button></div>
        <div style={styles.content}>
          <Section title="🎯 Agregar nodos">
            <p><b>➕ LEO / MEO / GEO</b> — al hacer clic se despliega un menú vertical con presets de frecuencia y potencia. Cada preset define las características del satélite (ver sección "Presets satelitales").</p>
            <p><b>📡 ＋</b> — elige una ubicación preset para agregar una estación terrestre (Buenos Aires, Madrid, Hawái, Singapore).</p>
          </Section>

          <Section title="🖱 Navegar la escena 3D">
            <p><b>Arrastrar</b> con el mouse para rotar la vista.</p>
            <p><b>Rueda</b> para acercar/alejar. <b>Shift + rueda</b> para zoom 6× más rápido.</p>
            <p><b>🌍 Bloquear vista a Tierra</b> — la cámara orbita solidaria con la rotación terrestre. La Tierra parece fija y los satélites orbitan a su alrededor como se vería desde la superficie. Ideal para observar satélites GEO (aparecen quietos sobre el mismo punto) y comparar órbitas LEO/MEO. Al hacer doble clic en un satélite con esta vista activa, la cámara lo sigue manteniendo el ángulo hacia la Tierra.</p>
            <p><b>Doble clic</b> en un satélite → la cámara lo sigue automáticamente.</p>
            <p><b>Doble clic</b> en la Tierra → vuelve a la vista general.</p>
          </Section>

          <Section title="📦 Paneles">
            <p>Todos los paneles se pueden <b>arrastrar</b> desde el icono ⋮ en la <b>esquina inferior derecha</b> para reubicarlos.</p>
            <p>Se pueden abrir múltiples paneles simultáneamente.</p>
          </Section>

          <Section title="📨 Enviar mensajes">
            <p>Abre <b>📨 Mensaje</b>, seleccioná origen y destino, escribí el contenido y presioná <b>Enviar</b>.</p>
            <p>El enlace se evalúa <b>al instante</b> con las posiciones actuales. La barra de progreso es solo cosmética.</p>
            <p>Al hacer clic en un mensaje del <b>📋 Historial</b> se abre su telemetría y se selecciona el nodo origen.</p>
          </Section>

          <Section title="🌦 Clima — cómo afecta al enlace">
            <p>Usá <b>🌦 Clima</b> para cambiar las condiciones atmosféricas. La atenuación se compone de tres fenómenos (modelos ITU-R):</p>
            <p><b>1. Absorción de gases (O₂ + vapor de agua)</b> — ITU-R P.676. El oxígeno produce atenuación base que crece con la frecuencia. El vapor de agua añade atenuación adicional proporcional a la densidad de vapor y al cuadrado de la frecuencia. A 4 GHz (banda C) la atenuación por gases es mínima (~0.04 dB); a 30 GHz (Ka) ya es notable (~0.7 dB en despejado, más del doble en tormenta por la alta densidad de vapor).</p>
            <p><b>2. Atenuación por nubes</b> — ITU-R P.840. Depende del contenido de agua líquida en las nubes (g/m³). Es máximo en tormenta (3 g/m³) y mínimo en despejado (0 g/m³). Crece con la frecuencia: casi nula en banda L, baja en C (~0.1 dB con niebla), significativa en Ka (~1-2 dB con tormenta).</p>
            <p><b>3. Atenuación por lluvia</b> — ITU-R P.838. Es el factor más perjudicial. La atenuación específica γ = k·R^α depende de la tasa de lluvia R (mm/h) y de coeficientes k, α que aumentan con la frecuencia. A bajas frecuencias (L, S, C) el efecto es leve; en Ku y especialmente Ka la lluvia puede interrumpir el enlace.</p>
            <p style={{ fontSize: 10, color: '#667', marginTop: 6 }}>Validación experimental: Oros (2010) midió en Cochabamba atenuación total <b>&lt;2% a 4 GHz</b> durante 5 años, confirmando que banda C es altamente resiliente al clima. La misma investigación predice que a frecuencias superiores (Ku, Ka) la degradación es mucho mayor.</p>
            <div style={styles.table}>
              <div style={{ ...styles.tr, justifyContent: 'flex-start', gap: 8 }}><span style={{ ...styles.th, minWidth: 115, flexShrink: 0 }}>Condición</span><span style={{ ...styles.th, minWidth: 60, flexShrink: 0 }}>Lluvia</span><span style={{ ...styles.th, minWidth: 55, flexShrink: 0 }}>Vapor</span><span style={{ ...styles.th, minWidth: 55, flexShrink: 0 }}>Nubes</span><span style={{ ...styles.th, minWidth: 45, flexShrink: 0 }}>Temp</span></div>
              <div style={{ ...styles.tr, justifyContent: 'flex-start', gap: 8 }}><span style={{ minWidth: 115, flexShrink: 0 }}>☀ Despejado</span><span style={{ minWidth: 60, flexShrink: 0 }}>0 mm/h</span><span style={{ minWidth: 55, flexShrink: 0 }}>7.5</span><span style={{ minWidth: 55, flexShrink: 0 }}>0</span><span style={{ minWidth: 45, flexShrink: 0 }}>15 °C</span></div>
              <div style={{ ...styles.tr, justifyContent: 'flex-start', gap: 8 }}><span style={{ minWidth: 115, flexShrink: 0 }}>🌦 Lluvia ligera</span><span style={{ minWidth: 60, flexShrink: 0 }}>2.5 mm/h</span><span style={{ minWidth: 55, flexShrink: 0 }}>10</span><span style={{ minWidth: 55, flexShrink: 0 }}>0.3</span><span style={{ minWidth: 45, flexShrink: 0 }}>12 °C</span></div>
              <div style={{ ...styles.tr, justifyContent: 'flex-start', gap: 8 }}><span style={{ minWidth: 115, flexShrink: 0 }}>🌧 Lluvia moderada</span><span style={{ minWidth: 60, flexShrink: 0 }}>12.5 mm/h</span><span style={{ minWidth: 55, flexShrink: 0 }}>15</span><span style={{ minWidth: 55, flexShrink: 0 }}>0.8</span><span style={{ minWidth: 45, flexShrink: 0 }}>10 °C</span></div>
              <div style={{ ...styles.tr, justifyContent: 'flex-start', gap: 8 }}><span style={{ minWidth: 115, flexShrink: 0 }}>🌧 Lluvia intensa</span><span style={{ minWidth: 60, flexShrink: 0 }}>25 mm/h</span><span style={{ minWidth: 55, flexShrink: 0 }}>20</span><span style={{ minWidth: 55, flexShrink: 0 }}>1.5</span><span style={{ minWidth: 45, flexShrink: 0 }}>8 °C</span></div>
              <div style={{ ...styles.tr, justifyContent: 'flex-start', gap: 8 }}><span style={{ minWidth: 115, flexShrink: 0 }}>⛈ Tormenta</span><span style={{ minWidth: 60, flexShrink: 0 }}>50 mm/h</span><span style={{ minWidth: 55, flexShrink: 0 }}>25</span><span style={{ minWidth: 55, flexShrink: 0 }}>3.0</span><span style={{ minWidth: 45, flexShrink: 0 }}>6 °C</span></div>
              <div style={{ ...styles.tr, justifyContent: 'flex-start', gap: 8 }}><span style={{ minWidth: 115, flexShrink: 0 }}>🌫 Niebla</span><span style={{ minWidth: 60, flexShrink: 0 }}>0 mm/h</span><span style={{ minWidth: 55, flexShrink: 0 }}>5</span><span style={{ minWidth: 55, flexShrink: 0 }}>0.5</span><span style={{ minWidth: 45, flexShrink: 0 }}>10 °C</span></div>
              <div style={{ ...styles.tr, justifyContent: 'flex-start', gap: 8 }}><span style={{ minWidth: 115, flexShrink: 0 }}>❄ Nieve</span><span style={{ minWidth: 60, flexShrink: 0 }}>5 mm/h</span><span style={{ minWidth: 55, flexShrink: 0 }}>5</span><span style={{ minWidth: 55, flexShrink: 0 }}>0.2</span><span style={{ minWidth: 45, flexShrink: 0 }}>-2 °C</span></div>
            </div>
            <p style={{ fontSize: 10, color: '#556', marginTop: 4 }}>Atenuación total = gases + nubes + lluvia. A mayor frecuencia, más impacto. La elevación del satélite también importa: a baja elevación la señal atraviesa más atmósfera.</p>
          </Section>

          <Section title="🛰 Presets satelitales — características">
            <p>Cada satélite se crea eligiendo un preset de frecuencia. El preset define <b>frecuencia (GHz)</b>, <b>potencia de transmisión (W)</b> y <b>ancho de banda (MHz)</b>. No se permiten valores libres: solo frecuencias reales con comportamiento validado.</p>
            <PresetTable orbitType="LEO" />
            <PresetTable orbitType="MEO" />
            <PresetTable orbitType="GEO" />
            <p style={{ fontSize: 10, color: '#667', marginTop: 8 }}>Los presets de <b>banda C (4 GHz)</b> están validados experimentalmente por la investigación de Oros (2010) sobre el enlace COMTECO/BRASILSAT B3 en Cochabamba: atenuación atmosférica total &lt;2% en todas las estaciones. La banda Ka (30 GHz) es la más sensible a condiciones meteorológicas adversas.</p>
          </Section>

          <Section title="📊 Telemetría — interpretación">
            <p>Parámetros del último enlace (o del mensaje seleccionado en el historial):</p>
            <div style={styles.metrics}>
              <span><b>FSPL</b> — Pérdida de espacio libre (depende de distancia y frecuencia)</span>
              <span><b>Aten. gases / lluvia / nubes</b> — Atenuación atmosférica según el clima</span>
              <span><b>Pot. recibida</b> — Potencia de señal en dBm (txPower[W]→dBm + ganancias − atenuación total)</span>
              <span><b>C/N₀</b> — Relación portadora a densidad de ruido (dB-Hz)</span>
              <span><b>SNR</b> — Relación señal a ruido en el ancho de banda (10 MHz)</span>
              <span><b>Eb/N₀</b> — Energía por bit a densidad de ruido (para 1 Mbps)</span>
              <span><b>Margen</b> — Eb/N₀ − 8.5 dB (umbral QPSK). Si es &gt; 0, la comunicación es viable.</span>
              <span><b>Throughput</b> — Tasa máxima teórica según Shannon-Hartley</span>
              <span><b>Latencia</b> — Tiempo de propagación (distancia / c)</span>
              <span><b>Doppler</b> — Desplazamiento por velocidad relativa (~7000 km/h)</span>
              <span><b>Temp. ruido</b> — Temperatura equivalente de ruido del receptor</span>
            </div>
            <p style={{ fontSize: 10, color: '#556', marginTop: 4 }}>c = 299 792 458 m/s · k = 1.38×10⁻²³ J/K · NF = 3 dB</p>
          </Section>

          <Section title="🌈 Colores de los enlaces en la escena">
            <div style={styles.table}>
              <div style={styles.tr}><span style={styles.th}>Color</span><span style={styles.th}>Significado</span></div>
              <div style={styles.tr}><span><span style={{ color: '#00ff88' }}>●</span> Verde</span><span>Completado, margen &gt; 10 dB</span></div>
              <div style={styles.tr}><span><span style={{ color: '#ffaa00' }}>●</span> Amarillo</span><span>Completado, margen 0–10 dB</span></div>
              <div style={styles.tr}><span><span style={{ color: '#ff4444' }}>●</span> Rojo</span><span>Fallido por margen insuficiente</span></div>
              <div style={styles.tr}><span><span style={{ color: '#8844cc' }}>●</span> Púrpura</span><span>Fallido por línea de visión bloqueada (solo satélite-satélite)</span></div>
              <div style={styles.tr}><span><span style={{ color: '#4488ff' }}>●</span> Azul</span><span>Transmitiendo</span></div>
            </div>
          </Section>

          <Section title="❓ Causas de fallo">
            <p>Un mensaje puede fallar por dos razones:</p>
            <p><b>1. Línea de visión bloqueada</b> (solo satélite-satélite): la Tierra está entre medio. Los enlaces con estaciones terrestres usan elevación real en vez de un bloqueo binario — la degradación se modela vía atenuación atmosférica.</p>
            <p><b>2. Margen insuficiente</b> (Eb/N₀ &lt; 8.5 dB): la señal es demasiado débil. Causas posibles:</p>
            <ul style={{ margin: '4px 0', paddingLeft: 20, fontSize: 12, color: '#99a' }}>
              <li>Distancia muy grande (alto FSPL)</li>
              <li>Clima adverso (lluvia intensa, tormenta)</li>
              <li>Elevación muy baja (trayectoria atmosférica larga)</li>
              <li>Potencia de transmisión o ganancia de antena insuficientes</li>
            </ul>
            <p>En el <b>📋 Historial</b>, los fallos muestran la causa: <b>🚫 LOS</b> si es por bloqueo, o margen negativo si es por potencia.</p>
          </Section>

          <Section title="⌨ Atajos y tips">
            <p><b>⏸ Pausar</b> — detiene la simulación para inspeccionar posiciones y enviar mensajes sin que los satélites se muevan.</p>
            <p><b>Shift + scroll</b> — zoom rápido.</p>
            <p><b>Paneles</b> — se abren/cierran desde la barra superior. Se pueden reposicionar arrastrando la esquina inferior derecha.</p>
            <p><b>Historial</b> — hace clic en cualquier mensaje para ver su telemetría y el nodo origen.</p>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return (<div style={styles.section}><div style={styles.sectionTitle}>{title}</div><div style={styles.sectionContent}>{children}</div></div>) }

function PresetTable({ orbitType }: { orbitType: OrbitType }) {
  const label: Record<OrbitType, string> = { LEO: 'LEO — Órbita baja (200-2000 km)', MEO: 'MEO — Órbita media (2000-35786 km)', GEO: 'GEO — Geoestacionaria (35786 km)' }
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#889', marginBottom: 4 }}>{label[orbitType]}</div>
      <div style={styles.presetTable}>
        <div style={styles.ptr}><span style={styles.pth}>Preset</span><span style={{ ...styles.pth, minWidth: 52 }}>Frec.</span><span style={{ ...styles.pth, minWidth: 48 }}>Pot.</span><span style={{ ...styles.pth, minWidth: 36 }}>BW</span><span style={{ ...styles.pth, minWidth: 'auto', flex: 1 }}>Uso</span></div>
        {SATELLITE_PRESETS[orbitType].map((p) => (
          <div key={p.label} style={styles.ptr}>
            <span style={{ color: '#aac', minWidth: 102, flexShrink: 0 }}>{p.label}</span>
            <span style={{ minWidth: 52, flexShrink: 0 }}>{p.frequency} GHz</span>
            <span style={{ minWidth: 48, flexShrink: 0 }}>{p.txPower} W</span>
            <span style={{ minWidth: 36, flexShrink: 0 }}>{(p.bandwidth / 1e6).toFixed(0)}</span>
            <span style={{ color: '#889', flex: 1 }}>{p.description}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' },
  modal: { background: 'rgba(12, 20, 36, 0.97)', borderRadius: 14, border: '1px solid rgba(80, 140, 240, 0.2)', width: '90%', maxWidth: 640, maxHeight: '85vh', overflow: 'auto', padding: 0, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 16, fontWeight: 700, color: '#8ab', position: 'sticky', top: 0, background: 'rgba(12, 20, 36, 0.99)', borderRadius: '14px 14px 0 0' },
  closeBtn: { background: 'rgba(255,255,255,0.08)', border: 'none', color: '#889', cursor: 'pointer', fontSize: 16, padding: '4px 10px', borderRadius: 6, transition: 'all 0.15s' },
  content: { padding: '8px 20px 20px' },
  section: { marginTop: 14 },
  sectionTitle: { fontSize: 14, fontWeight: 600, color: '#aac', marginBottom: 4 },
  sectionContent: { fontSize: 12, color: '#99a', lineHeight: 1.6 },
  metrics: { display: 'flex', flexDirection: 'column', gap: 2, fontSize: 11, color: '#99a', background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '6px 10px', marginTop: 4 },
  table: { display: 'flex', flexDirection: 'column', gap: 1, fontSize: 11, background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '4px 8px', marginTop: 4 },
  tr: { display: 'flex', justifyContent: 'space-between', padding: '2px 0' },
  th: { color: '#778', fontWeight: 600 },
  presetTable: { display: 'flex', flexDirection: 'column', gap: 1, fontSize: 10, background: 'rgba(255,255,255,0.02)', borderRadius: 4, padding: '3px 6px' },
  ptr: { display: 'flex', padding: '2px 0', gap: 8 },
  pth: { color: '#667', fontWeight: 600, minWidth: 102, flexShrink: 0 },
}