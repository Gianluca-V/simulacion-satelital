import type { SimNode, Message, WeatherState } from '../types'
import { distance3D, generateId } from '../utils/math'
import { calculateLinkBudget } from './linkBudget'

export function createMessage(source: SimNode, dest: SimNode, content: string): Message {
  const sizeBytes = new TextEncoder().encode(content).length
  return { id: generateId(), sourceId: source.id, destId: dest.id, content, sizeBytes, timestamp: Date.now(), status: 'pending', linkBudget: null, progress: 0 }
}

export function simulateTransmission(msg: Message, source: SimNode, dest: SimNode, weather: WeatherState): { message: Message; budget: any } {
  const dist = distance3D(source.position, dest.position)
  const budget = calculateLinkBudget(source.txPower, source.txGain, dest.rxGain, 12, dist, weather)
  const success = budget.linkMargin > 0
  return { message: { ...msg, status: success ? 'completed' : 'failed', linkBudget: budget }, budget }
}
