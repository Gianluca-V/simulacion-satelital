import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSimulationStore } from '../../stores/simulationStore'

export function Starfield() {
  const ref = useRef<THREE.Points>(null)
  const [positions, colors] = useMemo(() => {
    const count = 8000; const pos = new Float32Array(count * 3); const col = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 2000 + Math.random() * 3000; const theta = Math.random() * Math.PI * 2; const phi = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
      const brightness = 0.5 + Math.random() * 0.5; const tint = Math.random()
      if (tint < 0.1) { col[i * 3] = brightness; col[i * 3 + 1] = brightness * 0.7; col[i * 3 + 2] = brightness * 0.4 }
      else if (tint < 0.2) { col[i * 3] = brightness * 0.6; col[i * 3 + 1] = brightness * 0.7; col[i * 3 + 2] = brightness }
      else { col[i * 3] = brightness; col[i * 3 + 1] = brightness; col[i * 3 + 2] = brightness }
    }
    return [pos, col]
  }, [])

  useFrame((_, delta) => {
    if (useSimulationStore.getState().isPaused) return
    if (ref.current) ref.current.rotation.y += delta * 0.001
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute args={[positions, 3]} attach="attributes-position" />
        <bufferAttribute args={[colors, 3]} attach="attributes-color" />
      </bufferGeometry>
      <pointsMaterial size={1.5} vertexColors transparent opacity={0.9} sizeAttenuation depthWrite={false} />
    </points>
  )
}
