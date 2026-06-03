import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { GroundStation as GroundStationType } from '../../types'

interface Props { station: GroundStationType; isSelected: boolean; isSource: boolean; isDest: boolean }

export function GroundStation({ station, isSelected, isSource, isDest }: Props) {
  const glowRef = useRef<THREE.Mesh>(null); const beamRef = useRef<THREE.Mesh>(null)
  const pos = station.position
  const color = isSource ? '#00ff88' : isDest ? '#ff8800' : isSelected ? '#ffff00' : '#ff4466'
  const SIZE = 12

  useFrame(() => { if (beamRef.current) beamRef.current.rotation.y += 0.03 })

  return (
    <group position={[pos.x, pos.y, pos.z]}>
      <mesh ref={glowRef}><sphereGeometry args={[SIZE * 2.5, 12, 12]} /><meshBasicMaterial color={color} transparent opacity={0.2} depthWrite={false} /></mesh>
      <mesh><cylinderGeometry args={[SIZE * 0.4, SIZE * 0.8, SIZE, 6]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={isSelected ? 1 : 0.4} metalness={0.6} roughness={0.3} /></mesh>
      <mesh ref={beamRef} position={[0, SIZE * 0.5, 0]}><coneGeometry args={[SIZE * 0.15, SIZE * 2, 6]} /><meshStandardMaterial color={color} transparent opacity={0.35} emissive={color} emissiveIntensity={0.15} /></mesh>
    </group>
  )
}
