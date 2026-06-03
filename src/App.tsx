import { SceneContainer } from './components/scene/SceneContainer'
import { AppUI } from './components/ui/AppUI'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <div className="app-container">
        <SceneContainer />
        <AppUI />
      </div>
    </ErrorBoundary>
  )
}

export default App
