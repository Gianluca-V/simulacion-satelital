import { useMemo, useState, useEffect } from 'react'
import * as THREE from 'three'
import { EARTH_RADIUS } from '../../utils/constants'
import { useSimulationStore } from '../../stores/simulationStore'

function generateEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024; canvas.height = 512
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createLinearGradient(0, 0, 0, 512)
  gradient.addColorStop(0, '#1a3a6a'); gradient.addColorStop(0.15, '#1a5a3a'); gradient.addColorStop(0.2, '#2a6a3a')
  gradient.addColorStop(0.25, '#1a4a2a'); gradient.addColorStop(0.3, '#2a6a3a'); gradient.addColorStop(0.4, '#1a5a4a')
  gradient.addColorStop(0.5, '#2a6a8a'); gradient.addColorStop(0.55, '#1a5a6a'); gradient.addColorStop(0.6, '#2a6a3a')
  gradient.addColorStop(0.65, '#3a7a4a'); gradient.addColorStop(0.7, '#1a5a3a'); gradient.addColorStop(0.75, '#2a6a3a')
  gradient.addColorStop(0.8, '#1a4a3a'); gradient.addColorStop(0.85, '#2a6a5a'); gradient.addColorStop(0.9, '#1a3a6a')
  gradient.addColorStop(1, '#1a2a4a')
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1024, 512)
  ctx.strokeStyle = 'rgba(40, 100, 60, 0.3)'; ctx.lineWidth = 2
  for (let i = 0; i < 20; i++) { ctx.beginPath(); const y = Math.random() * 512; const x = Math.random() * 1024; ctx.arc(x, y, 30 + Math.random() * 80, 0, Math.PI * 2); ctx.stroke() }
  ctx.fillStyle = 'rgba(60, 140, 80, 0.2)'
  for (let i = 0; i < 30; i++) { ctx.beginPath(); ctx.arc(Math.random() * 1024, Math.random() * 512, 20 + Math.random() * 50, 0, Math.PI * 2); ctx.fill() }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.ClampToEdgeWrapping; texture.repeat.set(1, 1)
  return texture
}

function generateBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 256
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, 512, 256)
  for (let i = 0; i < 100; i++) { const brightness = 30 + Math.random() * 200; ctx.fillStyle = `rgb(${brightness},${brightness},${brightness})`; ctx.beginPath(); ctx.arc(Math.random() * 512, Math.random() * 256, 2 + Math.random() * 15, 0, Math.PI * 2); ctx.fill() }
  return new THREE.CanvasTexture(canvas)
}

const fallbackDayTex = generateEarthTexture()
const fallbackBumpTex = generateBumpTexture()

interface EarthProps { onDoubleClick?: () => void }

export function Earth({ onDoubleClick }: EarthProps) {
  const weather = useSimulationStore((s) => s.weather)
  const [dayTex, setDayTex] = useState<THREE.Texture>(fallbackDayTex)
  const [cloudsTex, setCloudsTex] = useState<THREE.Texture | null>(null)
  const [bumpTex] = useState<THREE.Texture>(fallbackBumpTex)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const loader = new THREE.TextureLoader(); let active = true
    const dayUrl = 'https://unpkg.com/three-globe/example/img/earth-day.jpg'
    const cloudsUrl = 'https://unpkg.com/three-globe/example/img/earth-clouds.png'
    loader.load(dayUrl, (tex) => { if (active) { setDayTex(tex); setLoaded(true) } }, undefined, () => { if (active) setLoaded(true) })
    loader.load(cloudsUrl, (tex) => { if (active) setCloudsTex(tex) }, undefined, () => {})
    return () => { active = false }
  }, [])

  const weatherTint = useMemo(() => {
    const tints: Record<string, [number, number, number]> = { Clear: [1, 1, 1], LightRain: [0.85, 0.88, 0.92], ModerateRain: [0.7, 0.75, 0.82], HeavyRain: [0.55, 0.6, 0.7], Storm: [0.4, 0.45, 0.55], Fog: [0.75, 0.78, 0.82], Snow: [0.9, 0.92, 0.95] }
    return tints[weather.condition] || tints.Clear
  }, [weather.condition])

  return (
    <group onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick?.() }} rotation={[0, -4 * Math.PI / 180, 0]}>
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS, 80, 80]} />
        <meshPhongMaterial map={dayTex} bumpMap={bumpTex} bumpScale={0.04} specular={new THREE.Color(0x222244)} shininess={8} color={weatherTint} transparent={weather.condition !== 'Clear'} opacity={weather.condition === 'Storm' ? 0.75 : 1} />
      </mesh>
      {cloudsTex && (
        <mesh>
          <sphereGeometry args={[EARTH_RADIUS * 1.004, 64, 64]} />
          <meshPhongMaterial map={cloudsTex} transparent opacity={0.2} depthWrite={false} />
        </mesh>
      )}
      {!loaded && (
        <mesh>
          <sphereGeometry args={[EARTH_RADIUS * 1.002, 16, 16]} />
          <meshBasicMaterial color={0x2244aa} wireframe transparent opacity={0.1} />
        </mesh>
      )}
    </group>
  )
}
