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
          <Section title="🎯 Agregar nodos">
            <p><b>➕ LEO / MEO / GEO</b> — añade satélites en órbita baja, media o geoestacionaria.</p>
            <p><b>📡 ＋</b> — elige una ubicación preset para agregar una estación terrestre (Buenos Aires, Madrid, Hawái, Singapore).</p>
          </Section>

          <Section title="🖱 Navegar la escena 3D">
            <p><b>Arrastrar</b> con el mouse para rotar la vista.</p>
            <p><b>Rueda</b> para acercar/alejar. <b>Shift + rueda</b> para zoom 6× más rápido.</p>
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

          <Section title="🌦 Clima — cómo afecta">
            <p>Usá <b>🌦 Clima</b> para cambiar las condiciones. La atenuación atmosférica se aplica <b>siempre</b>, incluso en enlaces entre satélites:</p>
            <div style={styles.table}>
              <div style={styles.tr}><span style={styles.th}>Condición</span><span style={styles.th}>Atenuación aprox. (12 GHz)</span></div>
              <div style={styles.tr}><span>Despejado</span><span>~0.2 dB (solo gases)</span></div>
              <div style={styles.tr}><span>Lluvia ligera</span><span>~0.5–1 dB</span></div>
              <div style={styles.tr}><span>Lluvia moderada</span><span>~2–4 dB</span></div>
              <div style={styles.tr}><span>Tormenta</span><span>~8–12 dB</span></div>
              <div style={styles.tr}><span>Niebla</span><span>~0.3–1 dB (nubes)</span></div>
            </div>
            <p style={{ fontSize: 10, color: '#556', marginTop: 4 }}>Modelos ITU-R P.676 (gases), P.838 (lluvia), P.840 (nubes).</p>
            <p>En enlaces con <b>estación terrestre</b>, la elevación del satélite afecta la longitud de la trayectoria atmosférica: a baja elevación hay más atenuación.</p>
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
}