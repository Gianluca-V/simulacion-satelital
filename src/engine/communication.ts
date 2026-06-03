import type { SimNode, Message, WeatherState } from '../types'
import { distance3D, generateId } from '../utils/math'
import { calculateLinkBudget, isLineOfSightBlocked, computeElevation } from './linkBudget'
import { EARTH_RADIUS } from '../utils/constants'

export function createMessage(source: SimNode, dest: SimNode, content: string): Message {
  const sizeBytes = new TextEncoder().encode(content).length
  return { id: generateId(), sourceId: source.id, destId: dest.id, content, sizeBytes, timestamp: Date.now(), status: 'pending', linkBudget: null, progress: 0 }
}

export function simulateTransmission(msg: Message, source: SimNode, dest: SimNode, weather: WeatherState): { message: Message; budget: any } {
  const dist = distance3D(source.position, dest.position)
  const freqGHz = source.frequency
  const isGroundLink = source.type === 'groundStation' || dest.type === 'groundStation'
  const blocked = isLineOfSightBlocked(source.position, dest.position)
  let elevation: number | undefined
  if (isGroundLink) {
    const ground = source.type === 'groundStation' ? source : dest
    const other = source.type === 'groundStation' ? dest : source
    elevation = computeElevation(ground.position, other.position)
  }
  const budget = calculateLinkBudget(source.txPower, source.txGain, dest.rxGain, freqGHz, dist, weather, isGroundLink, elevation)
  const success = budget.linkMargin > 0 && !blocked
  return { message: { ...msg, status: success ? 'completed' : 'failed', linkBudget: budget }, budget }
}
