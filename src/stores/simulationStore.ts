import { create } from 'zustand'
import type { Satellite, GroundStation, SimNode, WeatherState, Message } from '../types'
import { DEFAULT_WEATHER, EARTH_RADIUS } from '../utils/constants'
import { latLngToPosition } from '../utils/math'
import { createSatellite, propagateSatellite } from '../engine/orbit'
import { createWeatherState } from '../engine/weather'

interface SimulationState {
  satellites: Satellite[]
  groundStations: GroundStation[]
  messages: Message[]
  weather: WeatherState
  time: number
  isPaused: boolean
  selectedNodeId: string | null
  followNodeId: string | null
  transmissionSourceId: string | null
  transmissionDestId: string | null

  addSatellite: (orbitType: 'LEO' | 'MEO' | 'GEO') => void
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
  getNodeById: (id: string) => SimNode | undefined
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  satellites: [],
  groundStations: [],
  messages: [],
  weather: DEFAULT_WEATHER,
  time: 0,
  isPaused: false,
  selectedNodeId: null,
  followNodeId: null,
  transmissionSourceId: null,
  transmissionDestId: null,

  addSatellite: (orbitType) => { const sat = createSatellite(orbitType); set((state) => ({ satellites: [...state.satellites, sat] })) },
  addGroundStation: (lat, lng) => {
    const pos = latLngToPosition(lat, lng, EARTH_RADIUS)
    const gs: GroundStation = { id: `gs-${Date.now()}`, name: `GS-${Math.round(lat)}-${Math.round(lng)}`, type: 'groundStation', lat, lng, position: pos, txPower: 200, txGain: 40, rxGain: 40, frequency: 14, bandwidth: 10e6, selected: false }
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
  tick: (deltaMs) => { const state = get(); if (state.isPaused) return; set({ satellites: state.satellites.map(sat => ({ ...sat, position: propagateSatellite(sat, deltaMs) })), time: state.time + deltaMs }) },
  setPaused: (paused) => set({ isPaused: paused }),
  getNodeById: (id) => get().satellites.find(s => s.id === id) || get().groundStations.find(g => g.id === id),
}))
