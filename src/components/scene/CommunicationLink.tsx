import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props { sourcePos: { x: number; y: number; z: number }; destPos: { x: number; y: number; z: number }; progress: number; status: string; linkMargin: number }

export function CommunicationLink({ sourcePos, destPos, progress, status, linkMargin }: Props) {
  const dotRef = useRef<THREE.Mesh>(null)
  const points = useMemo(() => {
    const start = new THREE.Vector3(sourcePos.x, sourcePos.y, sourcePos.z)
    const end = new THREE.Vector3(destPos.x, destPos.y, destPos.z)
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
    return new THREE.QuadraticBezierCurve3(start, mid, end).getPoints(32)
  }, [sourcePos.x, sourcePos.y, sourcePos.z, destPos.x, destPos.y, destPos.z])

  const positions = useMemo(() => { const pts = new Float32Array(points.length * 3); points.forEach((p, i) => { pts[i * 3] = p.x; pts[i * 3 + 1] = p.y; pts[i * 3 + 2] = p.z }); return pts }, [points])
  const finished = status === 'completed' || status === 'failed'
  const active = status === 'transmitting' || status === 'completed'
  const blocked = status === 'failed' && linkMargin > 0
  let color: string
  if (blocked) color = '#8844cc'
  else if (status === 'completed' && linkMargin > 10) color = '#00ff88'
  else if (status === 'completed') color = '#ffaa00'
  else if (status === 'failed') color = '#ff4444'
  else color = '#4488ff'

  useFrame(() => {
    if (dotRef.current && points.length > 1) { const totalLength = points.length - 1; const idx = Math.floor(progress * totalLength); const p = points[Math.min(idx, totalLength)]; dotRef.current.position.copy(p) }
  })

  return (
    <group>
      <line><bufferGeometry><bufferAttribute args={[positions, 3]} attach="attributes-position" /></bufferGeometry><lineBasicMaterial color={color} transparent opacity={finished ? 0.5 : 0.8} /></line>
      {!finished && <mesh ref={dotRef}><sphereGeometry args={[0.8, 8, 8]} /><meshBasicMaterial color={color} /></mesh>}
    </group>
  )
}
