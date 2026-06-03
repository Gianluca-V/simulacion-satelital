import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSimulationStore } from '../../stores/simulationStore'
import { EARTH_RADIUS } from '../../utils/constants'

export function WeatherParticles() {
  const weather = useSimulationStore((s) => s.weather)
  const isPaused = useSimulationStore((s) => s.isPaused)
  const ref = useRef<THREE.Points>(null)
  const isRain = ['LightRain', 'ModerateRain', 'HeavyRain', 'Storm'].includes(weather.condition)
  const isSnow = weather.condition === 'Snow'
  const isFog = weather.condition === 'Fog'
  const count = isRain ? 3000 : isSnow ? 2000 : isFog ? 1500 : 0

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3); const vel = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2; const phi = Math.acos(2 * Math.random() - 1); const r = EARTH_RADIUS * 1.02 + Math.random() * 10
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.cos(phi)
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
      vel[i * 3] = 0; vel[i * 3 + 1] = -(2 + Math.random() * 5); vel[i * 3 + 2] = 0
    }
    return [pos, vel]
  }, [count])

  useFrame((_, delta) => {
    if (!ref.current || count === 0) return
    if (isPaused) return
    const pos = ref.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += velocities[i * 3 + 1] * delta * 0.5
      if (pos[i * 3 + 1] < -EARTH_RADIUS * 0.5) {
        const theta = Math.random() * Math.PI * 2; const phi = Math.acos(2 * Math.random() - 1); const r = EARTH_RADIUS * 1.02 + Math.random() * 10
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta); pos[i * 3 + 1] = r * Math.cos(phi); pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  if (count === 0) return null
  const particleColor = isSnow ? '#ffffff' : isFog ? '#c0c8d0' : '#88aaff'
  const size = isRain ? 0.3 : isSnow ? 0.6 : 2
  const opacity = isFog ? 0.15 : 0.5

  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute args={[positions, 3]} attach="attributes-position" /></bufferGeometry>
      <pointsMaterial color={particleColor} size={size} transparent opacity={opacity} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}
