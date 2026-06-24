import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { GroundStation as GroundStationType } from '../../types'

interface Props { station: GroundStationType; isSelected: boolean; isSource: boolean; isDest: boolean }

export function GroundStation({ station, isSelected, isSource, isDest }: Props) {
  const glowRef = useRef<THREE.Mesh>(null); const beamRef = useRef<THREE.Mesh>(null)
  const pos = station.position
  const color = isSource ? '#00ff88' : isDest ? '#ff8800' : isSelected ? '#ffff00' : '#ff4466'
  const SIZE = 80

  const outwardQuat = useMemo(() => {
    const normal = new THREE.Vector3(pos.x, pos.y, pos.z).normalize()
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal)
  }, [pos.x, pos.y, pos.z])

  useFrame(() => {
    if (glowRef.current) glowRef.current.rotation.y += 0.02
    if (beamRef.current) beamRef.current.rotation.y += 0.03
  })

  return (
    <group position={[pos.x, pos.y, pos.z]} quaternion={outwardQuat}>
      <sprite position={[0, 0, 0]} scale={[SIZE * 4, SIZE * 4, 1]}>
        <spriteMaterial color={color} transparent opacity={0.6} depthWrite={false} />
      </sprite>
      <mesh ref={glowRef}><sphereGeometry args={[SIZE * 2, 16, 16]} /><meshBasicMaterial color={color} transparent opacity={0.15} depthWrite={false} /></mesh>
      <mesh><cylinderGeometry args={[SIZE * 0.3, SIZE * 0.6, SIZE, 6]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={isSelected ? 1 : 0.4} metalness={0.6} roughness={0.3} /></mesh>
      <mesh ref={beamRef} position={[0, SIZE * 0.5, 0]}><coneGeometry args={[SIZE * 0.1, SIZE * 1.5, 6]} /><meshStandardMaterial color={color} transparent opacity={0.3} emissive={color} emissiveIntensity={0.1} /></mesh>
    </group>
  )
}
