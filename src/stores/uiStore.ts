import { create } from 'zustand'

interface UIState {
  showNodePanel: boolean
  showTelemetry: boolean
  showMessageLog: boolean
  showLegend: boolean
  showMessageComposer: boolean
  showWeatherControl: boolean
  showHelp: boolean
  earthLockedView: boolean
  activePanel: string | null
  panelPositions: Record<string, { x: number; y: number }>
  selectedMessageId: string | null

  toggleNodePanel: () => void
  toggleTelemetry: () => void
  toggleMessageLog: () => void
  toggleLegend: () => void
  toggleMessageComposer: () => void
  toggleWeatherControl: () => void
  toggleHelp: () => void
  toggleEarthLockedView: () => void
  setActivePanel: (panel: string | null) => void
  setPanelPosition: (id: string, pos: { x: number; y: number }) => void
  setSelectedMessage: (id: string | null) => void
  closeAll: () => void
}

export const useUIStore = create<UIState>((set) => ({
  showNodePanel: false,
  showTelemetry: false,
  showMessageLog: false,
  showLegend: true,
  showMessageComposer: false,
  showWeatherControl: true,
  showHelp: false,
  earthLockedView: false,
  activePanel: null,
  panelPositions: {},
  selectedMessageId: null,

  toggleNodePanel: () => set((s) => ({ showNodePanel: !s.showNodePanel })),
  toggleTelemetry: () => set((s) => ({ showTelemetry: !s.showTelemetry })),
  toggleMessageLog: () => set((s) => ({ showMessageLog: !s.showMessageLog })),
  toggleLegend: () => set((s) => ({ showLegend: !s.showLegend })),
  toggleMessageComposer: () => set((s) => ({ showMessageComposer: !s.showMessageComposer })),
  toggleWeatherControl: () => set((s) => ({ showWeatherControl: !s.showWeatherControl })),
  toggleHelp: () => set((s) => ({ showHelp: !s.showHelp })),
  toggleEarthLockedView: () => set((s) => ({ earthLockedView: !s.earthLockedView })),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setPanelPosition: (id, pos) => set((s) => ({ panelPositions: { ...s.panelPositions, [id]: pos } })),
  setSelectedMessage: (id) => set({ selectedMessageId: id }),
  closeAll: () => set({ showNodePanel: false, showTelemetry: false, showMessageLog: false, showMessageComposer: false }),
}))
