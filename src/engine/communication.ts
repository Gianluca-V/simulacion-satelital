import type { SimNode, Message, WeatherState } from '../types'
import { distance3D, generateId } from '../utils/math'
import { calculateLinkBudget, isLineOfSightBlocked, computeElevation } from './linkBudget'

export function createMessage(source: SimNode, dest: SimNode, content: string): Message {
  const sizeBytes = new TextEncoder().encode(content).length
  return { id: generateId(), sourceId: source.id, destId: dest.id, content, sizeBytes, timestamp: Date.now(), status: 'pending', linkBudget: null, progress: 0 }
}

export function simulateTransmission(msg: Message, source: SimNode, dest: SimNode, weather: WeatherState): { message: Message; budget: any } {
  const dist = distance3D(source.position, dest.position)
  const freqGHz = source.frequency
  let elevation: number | undefined
  let blocked = false
  let blockReason = ''

  if (source.type === 'groundStation' && dest.type === 'groundStation') {
    blocked = isLineOfSightBlocked(source.position, dest.position)
    if (blocked) blockReason = 'Sin línea de visión: la curvatura terrestre bloquea el enlace entre las bases'
  } else if (source.type === 'groundStation' || dest.type === 'groundStation') {
    const ground = source.type === 'groundStation' ? source : dest
    const other = source.type === 'groundStation' ? dest : source
    elevation = computeElevation(ground.position, other.position)
    blocked = elevation <= 0
    if (blocked) blockReason = 'Sin línea de visión: el satélite está bajo el horizonte desde la base terrestre'
  } else {
    blocked = isLineOfSightBlocked(source.position, dest.position)
    if (blocked) blockReason = 'Sin línea de visión: la Tierra bloquea el enlace entre los satélites'
  }

  const budget = calculateLinkBudget(source.txPower, source.txGain, dest.rxGain, freqGHz, dist, weather, dest.bandwidth, elevation)
  const marginOk = budget.linkMargin > 0
  const success = marginOk && !blocked
  let failureReason: string | undefined
  if (!success) {
    if (blocked) failureReason = blockReason
    else if (!marginOk) failureReason = `Margen de enlace insuficiente (${budget.linkMargin.toFixed(1)} dB): la atenuación total supera la potencia disponible`
  }
  return { message: { ...msg, status: success ? 'completed' : 'failed', linkBudget: budget, failureReason }, budget }
}
