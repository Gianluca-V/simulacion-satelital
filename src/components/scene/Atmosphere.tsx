import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { EARTH_RADIUS } from '../../utils/constants'

export function Atmosphere() {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => { if (meshRef.current) meshRef.current.rotation.y += delta * 0.005 })

  const uniforms = useMemo(() => ({ c: { value: 0.1 }, p: { value: 3.5 }, glowColor: { value: new THREE.Color(0x4488ff) }, viewVector: { value: new THREE.Vector3(0, 0, 10) } }), [])

  const vertexShader = `uniform vec3 viewVector; varying float intensity; void main() { vec3 vNormal = normalize(normalMatrix * normal); vec3 vNormel = normalize(normalMatrix * viewVector); intensity = pow(0.65 - dot(vNormal, vNormel), 3.0); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`
  const fragmentShader = `uniform vec3 glowColor; varying float intensity; void main() { vec3 glow = glowColor * intensity; gl_FragColor = vec4(glow, intensity * 0.4); }`

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[EARTH_RADIUS * 1.05, 64, 64]} />
      <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} blending={THREE.AdditiveBlending} side={THREE.BackSide} transparent depthWrite={false} />
    </mesh>
  )
}
