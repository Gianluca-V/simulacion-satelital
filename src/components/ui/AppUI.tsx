import { Toolbar } from './Toolbar'
import { WeatherControl } from './WeatherControl'
import { MessageComposer } from './MessageComposer'
import { NodePanel } from './NodePanel'
import { TelemetryPanel } from './TelemetryPanel'
import { MessageLog } from './MessageLog'
import { Legend } from './Legend'
import { HelpInstructions } from './HelpInstructions'

export function AppUI() {
  return (<><Toolbar /><WeatherControl /><MessageComposer /><NodePanel /><TelemetryPanel /><MessageLog /><Legend /><HelpInstructions /></>)
}
