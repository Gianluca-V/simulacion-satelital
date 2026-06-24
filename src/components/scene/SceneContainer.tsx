import { Suspense, useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { Earth } from './Earth'
import { Atmosphere } from './Atmosphere'
import { Starfield } from './Starfield'
import { Satellite } from './Satellite'
import { GroundStation } from './GroundStation'
import { CommunicationLink } from './CommunicationLink'
import { WeatherParticles } from './WeatherParticles'
import { useSimulationStore } from '../../stores/simulationStore'
import { useUIStore } from '../../stores/uiStore'
import { EARTH_RADIUS, SCENE_SCALE } from '../../utils/constants'
import type { Position3D } from '../../types'

const S = (v: number) => v / SCENE_SCALE
const DEFAULT_CAM_POS = new THREE.Vector3(S(EARTH_RADIUS * 2.5), S(EARTH_RADIUS * 1.2), S(EARTH_RADIUS * 2.5))
const MIN_DIST_DEFAULT = S(EARTH_RADIUS * 1.2)
const MAX_DIST_DEFAULT = S(EARTH_RADIUS * 15)
const MIN_DIST_FOLLOW = 2
const MAX_DIST_FOLLOW = S(EARTH_RADIUS * 8)

function rotateAroundY(pos: Position3D, angle: number): Position3D {
  const c = Math.cos(angle); const s = Math.sin(angle)
  return { x: pos.x * c + pos.z * s, y: pos.y, z: -pos.x * s + pos.z * c }
}

function RotatingEarthGroup({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null)
  const earthRotation = useSimulationStore((s) => s.earthRotation)
  useFrame(() => { if (groupRef.current) groupRef.current.rotation.y = earthRotation })
  return <group ref={groupRef}>{children}</group>
}

function TickController() {
  const tick = useSimulationStore((s) => s.tick)
  const speed = useSimulationStore((s) => s.speed)
  const isPaused = useSimulationStore((s) => s.isPaused)

  useFrame((_, delta) => {
    if (!isPaused) tick(delta * speed)
  })

  return null
}

function SceneContent() {
  const controlsRef = useRef<any>(null)
  const { camera } = useThree()
  const wasFollowingRef = useRef(false)
  const shiftRef = useRef(false)
  const prevEarthRotRef = useRef(0)

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => { if (e.key === 'Shift') shiftRef.current = true }
    const onUp = (e: KeyboardEvent) => { if (e.key === 'Shift') shiftRef.current = false }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp) }
  }, [])

  const satellites = useSimulationStore((s) => s.satellites)
  const groundStations = useSimulationStore((s) => s.groundStations)
  const selectedNodeId = useSimulationStore((s) => s.selectedNodeId)
  const followNodeId = useSimulationStore((s) => s.followNodeId)
  const transmissionSourceId = useSimulationStore((s) => s.transmissionSourceId)
  const transmissionDestId = useSimulationStore((s) => s.transmissionDestId)
  const messages = useSimulationStore((s) => s.messages)
  const selectNode = useSimulationStore((s) => s.selectNode)
  const followNode = useSimulationStore((s) => s.followNode)
  const toggleNodePanel = useUIStore((s) => s.toggleNodePanel)
  const getNodeById = useSimulationStore((s) => s.getNodeById)

  const visibleMessages = useMemo(() => messages.filter(m => m.linkBudget), [messages])
  const earthRotation = useSimulationStore((s) => s.earthRotation)
  const earthLockedView = useUIStore((s) => s.earthLockedView)

  useFrame((_, delta) => {
    const controls = controlsRef.current
    if (!controls) return

    const deltaRot = earthRotation - prevEarthRotRef.current
    prevEarthRotRef.current = earthRotation

    if (earthLockedView && Math.abs(deltaRot) > 0.000001) {
      const cosA = Math.cos(deltaRot); const sinA = Math.sin(deltaRot)
      const cx = camera.position.x; const cz = camera.position.z
      camera.position.x = cx * cosA + cz * sinA
      camera.position.z = -cx * sinA + cz * cosA
    }

    controls.zoomSpeed = shiftRef.current ? 1.5 : 0.25
    const follow = useSimulationStore.getState().followNodeId
    if (follow) {
      const node = getNodeById(follow)
      if (node) {
        const targetPos = node.type === 'groundStation' ? rotateAroundY(node.position, earthRotation) : node.position
        controls.target.set(S(targetPos.x), S(targetPos.y), S(targetPos.z)); controls.update()
      }
      if (!wasFollowingRef.current) { controls.minDistance = MIN_DIST_FOLLOW; controls.maxDistance = MAX_DIST_FOLLOW; wasFollowingRef.current = true }
    } else {
      if (wasFollowingRef.current) { controls.minDistance = MIN_DIST_DEFAULT; controls.maxDistance = MAX_DIST_DEFAULT; wasFollowingRef.current = false }
    }
  })

  const handleSelect = (id: string) => { selectNode(id); if (!useUIStore.getState().showNodePanel) toggleNodePanel() }
  const handleDoubleClickSat = (id: string) => { followNode(id); selectNode(id); if (!useUIStore.getState().showNodePanel) toggleNodePanel() }
  const handleDoubleClickEarth = () => {
    followNode(null); selectNode(null); const controls = controlsRef.current
    if (controls) { controls.target.set(0, 0, 0); controls.minDistance = MIN_DIST_DEFAULT; controls.maxDistance = MAX_DIST_DEFAULT; camera.position.copy(DEFAULT_CAM_POS); controls.update() }
  }

  const allNodes = [...satellites, ...groundStations]

  return (
    <>
      <color attach="background" args={['#05080f']} />
      <ambientLight intensity={0.15} />
      <directionalLight position={[S(100), S(50), S(100)]} intensity={1.8} />
      <directionalLight position={[S(-100), S(-50), S(-100)]} intensity={0.4} />
      <Starfield />
      <group scale={1 / SCENE_SCALE}>
        <TickController />
        <RotatingEarthGroup>
          <Earth onDoubleClick={handleDoubleClickEarth} />
          <Atmosphere />
          <WeatherParticles />
          {groundStations.map((gs) => (
            <group key={gs.id} onClick={(e) => { e.stopPropagation(); handleSelect(gs.id) }} onDoubleClick={(e) => { e.stopPropagation(); handleDoubleClickSat(gs.id) }}>
              <GroundStation station={gs} isSelected={gs.id === selectedNodeId} isSource={gs.id === transmissionSourceId} isDest={gs.id === transmissionDestId} />
            </group>
          ))}
        </RotatingEarthGroup>
        {satellites.map((sat) => (
          <group key={sat.id} onClick={(e) => { e.stopPropagation(); handleSelect(sat.id) }} onDoubleClick={(e) => { e.stopPropagation(); handleDoubleClickSat(sat.id) }}>
            <Satellite satellite={sat} isSelected={sat.id === selectedNodeId} isSource={sat.id === transmissionSourceId} isDest={sat.id === transmissionDestId} isFollowed={sat.id === followNodeId} />
          </group>
        ))}
        {visibleMessages.map((msg) => {
          const source = allNodes.find(n => n.id === msg.sourceId); const dest = allNodes.find(n => n.id === msg.destId)
          if (!source || !dest) return null
          const srcPos = source.type === 'groundStation' ? rotateAroundY(source.position, earthRotation) : source.position
          const dstPos = dest.type === 'groundStation' ? rotateAroundY(dest.position, earthRotation) : dest.position
          return <CommunicationLink key={msg.id} sourcePos={srcPos} destPos={dstPos} progress={msg.progress / 100} status={msg.status} linkMargin={msg.linkBudget?.linkMargin ?? 0} />
        })}
      </group>
      <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.12} rotateSpeed={0.3} zoomSpeed={0.25} minDistance={MIN_DIST_DEFAULT} maxDistance={MAX_DIST_DEFAULT} autoRotate={false} enablePan={false} target={[0, 0, 0]} />
    </>
  )
}

function Fallback() { return <mesh><sphereGeometry args={[S(EARTH_RADIUS), 32, 32]} /><meshBasicMaterial color={0x0a1420} /></mesh> }

export function SceneContainer() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [S(EARTH_RADIUS * 2.5), S(EARTH_RADIUS * 1.2), S(EARTH_RADIUS * 2.5)], fov: 45, near: 0.1, far: 5000 }} gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }} dpr={[1, 2]}>
        <Suspense fallback={<Fallback />}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  )
}
