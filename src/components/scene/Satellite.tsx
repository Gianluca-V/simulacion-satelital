import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Satellite as SatelliteType } from '../../types'
import { orbitalElementsToPosition } from '../../utils/math'

interface Props { satellite: SatelliteType; isSelected: boolean; isSource: boolean; isDest: boolean; isFollowed: boolean }

function makeSpriteTexture(color: string): THREE.CanvasTexture {
  const c = document.createElement('canvas'); c.width = 64; c.height = 64
  const ctx = c.getContext('2d')!
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, color); grad.addColorStop(0.3, color + '88'); grad.addColorStop(1, 'transparent')
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

export function Satellite({ satellite, isSelected, isSource, isDest, isFollowed }: Props) {
  const groupRef = useRef<THREE.Group>(null); const panelsRef = useRef<THREE.Group>(null); const spriteRef = useRef<THREE.Sprite>(null)
  const pos = satellite.position
  const S = satellite.altitude < 2000 ? 50 : satellite.altitude < 35786 ? 65 : 80

  const orbitPoints = useMemo(() => {
    const pts: number[] = []; const steps = 256; const seed = satellite.orbitalElements
    for (let i = 0; i <= steps; i++) { const ta = (i / steps) * 360; const p = orbitalElementsToPosition({ ...seed, trueAnomaly: ta }, 0); pts.push(p.x, p.y, p.z) }
    return new Float32Array(pts)
  }, [satellite.orbitalElements.semiMajorAxis, satellite.orbitalElements.eccentricity, satellite.orbitalElements.inclination, satellite.orbitalElements.raan, satellite.orbitalElements.argPerigee])

  const color = isSource ? '#00ff88' : isDest ? '#ff8800' : isSelected ? '#ffff00' : isFollowed ? '#ffaa00' : '#44aaff'
  const spriteTex = useMemo(() => makeSpriteTexture(color), [isSource, isDest, isSelected, isFollowed])

  useFrame(() => {
    if (groupRef.current) { groupRef.current.position.set(pos.x, pos.y, pos.z); groupRef.current.lookAt(0, 0, 0) }
    if (panelsRef.current) panelsRef.current.rotation.z += 0.005
    if (spriteRef.current) spriteRef.current.position.set(pos.x, pos.y, pos.z)
  })

  const BODY = S * 0.35; const PANEL_W = S * 1.6; const PANEL_H = S * 0.12; const PANEL_D = S * 0.55

  return (
    <group>
      <sprite ref={spriteRef} position={[pos.x, pos.y, pos.z]} scale={[S * 6, S * 6, 1]}>
        <spriteMaterial map={spriteTex} transparent depthWrite={false} />
      </sprite>
      <mesh position={[pos.x, pos.y, pos.z]}>
        <sphereGeometry args={[S * 2.5, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={isFollowed ? 0.3 : 0.12} depthWrite={false} />
      </mesh>
      <group ref={groupRef} position={[pos.x, pos.y, pos.z]}>
        <mesh><boxGeometry args={[BODY, BODY, BODY * 1.2]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={isSelected || isFollowed ? 1 : 0.3} metalness={0.6} roughness={0.3} /></mesh>
        <group ref={panelsRef}>
          <mesh position={[PANEL_W * 0.5 + BODY * 0.5, 0, 0]}><boxGeometry args={[PANEL_W, PANEL_H, PANEL_D]} /><meshStandardMaterial color="#4477aa" emissive="#335588" emissiveIntensity={0.1} metalness={0.7} roughness={0.4} /></mesh>
          <mesh position={[-(PANEL_W * 0.5 + BODY * 0.5), 0, 0]}><boxGeometry args={[PANEL_W, PANEL_H, PANEL_D]} /><meshStandardMaterial color="#4477aa" emissive="#335588" emissiveIntensity={0.1} metalness={0.7} roughness={0.4} /></mesh>
        </group>
        <mesh position={[0, BODY * 0.9, 0]}><cylinderGeometry args={[1, 0.3, BODY * 0.5, 6]} /><meshStandardMaterial color="#bbb" emissive="#999" emissiveIntensity={0.1} metalness={0.8} roughness={0.2} /></mesh>
        <mesh position={[0, BODY * 1.3, 0]}><sphereGeometry args={[1, 6, 6]} /><meshStandardMaterial color="#ff4444" emissive="#ff2222" emissiveIntensity={0.5} /></mesh>
        <mesh position={[0, -BODY * 0.5, BODY * 0.8]}><coneGeometry args={[2, BODY * 0.4, 8]} /><meshStandardMaterial color="#eee" metalness={0.9} roughness={0.1} /></mesh>
      </group>
      <line><bufferGeometry><bufferAttribute args={[orbitPoints, 3]} attach="attributes-position" /></bufferGeometry><lineBasicMaterial color="#4488cc" transparent opacity={isFollowed ? 0.8 : 0.5} depthWrite={false} /></line>
    </group>
  )
}
