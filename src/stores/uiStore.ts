import { create } from 'zustand'

interface UIState {
  showNodePanel: boolean
  showTelemetry: boolean
  showMessageLog: boolean
  showLegend: boolean
  showMessageComposer: boolean
  showWeatherControl: boolean
  showHelp: boolean
  activePanel: string | null
  panelPositions: Record<string, { x: number; y: number }>

  toggleNodePanel: () => void
  toggleTelemetry: () => void
  toggleMessageLog: () => void
  toggleLegend: () => void
  toggleMessageComposer: () => void
  toggleWeatherControl: () => void
  toggleHelp: () => void
  setActivePanel: (panel: string | null) => void
  setPanelPosition: (id: string, pos: { x: number; y: number }) => void
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
  activePanel: null,
  panelPositions: {},

  toggleNodePanel: () => set((s) => { const next = !s.showNodePanel; return { showNodePanel: next, showTelemetry: next ? false : s.showTelemetry, showMessageLog: next ? false : s.showMessageLog } }),
  toggleTelemetry: () => set((s) => { const next = !s.showTelemetry; return { showTelemetry: next, showNodePanel: next ? false : s.showNodePanel, showMessageLog: next ? false : s.showMessageLog } }),
  toggleMessageLog: () => set((s) => { const next = !s.showMessageLog; return { showMessageLog: next, showTelemetry: next ? false : s.showTelemetry, showNodePanel: next ? false : s.showNodePanel } }),
  toggleLegend: () => set((s) => ({ showLegend: !s.showLegend })),
  toggleMessageComposer: () => set((s) => ({ showMessageComposer: !s.showMessageComposer })),
  toggleWeatherControl: () => set((s) => ({ showWeatherControl: !s.showWeatherControl })),
  toggleHelp: () => set((s) => ({ showHelp: !s.showHelp })),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setPanelPosition: (id, pos) => set((s) => ({ panelPositions: { ...s.panelPositions, [id]: pos } })),
  closeAll: () => set({ showNodePanel: false, showTelemetry: false, showMessageLog: false, showMessageComposer: false }),
}))
