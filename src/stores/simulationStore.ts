import { create } from 'zustand'
import type { Satellite, GroundStation, SimNode, WeatherState, Message, OrbitType } from '../types'
import type { SatellitePreset } from '../utils/constants'
import { DEFAULT_WEATHER, EARTH_RADIUS, GS_TX_POWER, GS_TX_GAIN, GS_RX_GAIN, DEFAULT_BANDWIDTH, GS_DEFAULT_FREQUENCY, EARTH_ROTATION_RATE } from '../utils/constants'
import { latLngToPosition } from '../utils/math'
import { createSatellite, propagateSatellite } from '../engine/orbit'
import { createWeatherState } from '../engine/weather'

export const SPEED_PRESETS = [1, 10, 50, 100, 500] as const

interface SimulationState {
  satellites: Satellite[]
  groundStations: GroundStation[]
  messages: Message[]
  weather: WeatherState
  time: number
  earthRotation: number
  isPaused: boolean
  speed: number
  selectedNodeId: string | null
  followNodeId: string | null
  transmissionSourceId: string | null
  transmissionDestId: string | null

  addSatellite: (orbitType: OrbitType, preset?: SatellitePreset) => void
  addGroundStation: (lat: number, lng: number) => void
  removeNode: (id: string) => void
  selectNode: (id: string | null) => void
  followNode: (id: string | null) => void
  updateNode: (id: string, updates: Partial<Satellite | GroundStation>) => void
  setWeather: (condition: string) => void
  addMessage: (msg: Message) => void
  updateMessage: (id: string, updates: Partial<Message>) => void
  setTransmissionSource: (id: string | null) => void
  setTransmissionDest: (id: string | null) => void
  tick: (deltaMs: number) => void
  setPaused: (paused: boolean) => void
  setSpeed: (speed: number) => void
  getNodeById: (id: string) => SimNode | undefined
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  satellites: [],
  groundStations: [],
  messages: [],
  weather: DEFAULT_WEATHER,
  time: 0,
  earthRotation: 0,
  isPaused: false,
  speed: 500,
  selectedNodeId: null,
  followNodeId: null,
  transmissionSourceId: null,
  transmissionDestId: null,

  addSatellite: (orbitType, preset) => { const sat = createSatellite(orbitType, preset); set((state) => ({ satellites: [...state.satellites, sat] })) },
  addGroundStation: (lat, lng) => {
    const pos = latLngToPosition(lat, lng, EARTH_RADIUS)
    const gs: GroundStation = { id: `gs-${Date.now()}`, name: `GS-${Math.round(lat)}-${Math.round(lng)}`, type: 'groundStation', lat, lng, position: pos, txPower: GS_TX_POWER, txGain: GS_TX_GAIN, rxGain: GS_RX_GAIN, frequency: GS_DEFAULT_FREQUENCY, bandwidth: DEFAULT_BANDWIDTH, selected: false }
    set((state) => ({ groundStations: [...state.groundStations, gs] }))
  },
  removeNode: (id) => set((state) => ({ satellites: state.satellites.filter(s => s.id !== id), groundStations: state.groundStations.filter(g => g.id !== id), selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId, followNodeId: state.followNodeId === id ? null : state.followNodeId, transmissionSourceId: state.transmissionSourceId === id ? null : state.transmissionSourceId, transmissionDestId: state.transmissionDestId === id ? null : state.transmissionDestId })),
  selectNode: (id) => set((state) => ({ selectedNodeId: id, satellites: state.satellites.map(s => ({ ...s, selected: s.id === id })), groundStations: state.groundStations.map(g => ({ ...g, selected: g.id === id })) })),
  followNode: (id) => set({ followNodeId: id }),
  updateNode: (id, updates) => set((state) => { const satIdx = state.satellites.findIndex(s => s.id === id); if (satIdx !== -1) { const newSats = [...state.satellites]; newSats[satIdx] = { ...newSats[satIdx], ...updates } as Satellite; return { satellites: newSats } }; const gsIdx = state.groundStations.findIndex(g => g.id === id); if (gsIdx !== -1) { const newGS = [...state.groundStations]; newGS[gsIdx] = { ...newGS[gsIdx], ...updates } as GroundStation; return { groundStations: newGS } }; return state }),
  setWeather: (condition) => { const weather = createWeatherState(condition as any); set({ weather }) },
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  updateMessage: (id, updates) => set((state) => ({ messages: state.messages.map(m => m.id === id ? { ...m, ...updates } : m) })),
  setTransmissionSource: (id) => set({ transmissionSourceId: id }),
  setTransmissionDest: (id) => set({ transmissionDestId: id }),
  tick: (deltaMs) => { const state = get(); if (state.isPaused) return; const earthAngle = deltaMs * EARTH_ROTATION_RATE; set({ satellites: state.satellites.map(sat => { const { position, trueAnomaly } = propagateSatellite(sat, deltaMs); return { ...sat, position, orbitalElements: { ...sat.orbitalElements, trueAnomaly } } }), time: state.time + deltaMs, earthRotation: state.earthRotation + earthAngle }) },
  setPaused: (paused) => set({ isPaused: paused }),
  setSpeed: (speed) => set({ speed }),
  getNodeById: (id) => get().satellites.find(s => s.id === id) || get().groundStations.find(g => g.id === id),
}))
