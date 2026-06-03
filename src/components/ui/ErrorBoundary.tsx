import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) { super(props); this.state = { hasError: false, error: null } }
  static getDerivedStateFromError(error: Error): State { return { hasError: true, error } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('ErrorBoundary caught:', error, info) }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (<div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0f1a', color: '#8ab', fontFamily: 'monospace', padding: 40, textAlign: 'center' }}><div style={{ fontSize: 24, marginBottom: 12 }}>⚠️</div><div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Error en el simulador</div><div style={{ fontSize: 12, color: '#667', marginBottom: 20, maxWidth: 500 }}>{this.state.error?.message || 'Error desconocido'}</div><button onClick={() => window.location.reload()} style={{ padding: '8px 24px', borderRadius: 6, border: '1px solid rgba(100,160,255,0.3)', background: 'rgba(100,160,255,0.1)', color: '#8ab', cursor: 'pointer', fontSize: 13 }}>Recargar página</button></div>)
    }
    return this.props.children
  }
}
