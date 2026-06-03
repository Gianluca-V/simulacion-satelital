import type { Position3D, WeatherState, LinkBudget } from '../types'
import { distance3D, propagationDelay, orbitalElementsToPosition, degToRad, radToDeg } from '../utils/math'
import { SPEED_OF_LIGHT, BOLTZMANN_CONST, EARTH_RADIUS, RECEIVER_NOISE_FIGURE, REFERENCE_NOISE_TEMP, DEFAULT_BANDWIDTH, DEFAULT_BITRATE, MIN_EB_NO, SATELLITE_VELOCITY_MS } from '../utils/constants'
import { atmosphericGasAttenuation, rainAttenuation, cloudAttenuation } from './atmosphericAttenuation'

function wattsToDBm(watts: number): number { return 10 * Math.log10(watts) + 30 }

export function calculateLinkBudget(txPower: number, txGain: number, rxGain: number, freqGHz: number, distanceKm: number, weather: WeatherState, elevationDeg?: number): LinkBudget {
  const freqHz = freqGHz * 1e9
  const fspl = 20 * Math.log10(distanceKm * 1000) + 20 * Math.log10(freqHz) + 20 * Math.log10(4 * Math.PI / SPEED_OF_LIGHT)
  const elev = elevationDeg ?? 5
  const gasAtt = atmosphericGasAttenuation(freqGHz, weather.humidity, weather.temperature)
  const rainAtt = rainAttenuation(freqGHz, weather.rainRate, elev)
  const cloudAtt = cloudAttenuation(freqGHz, weather.cloudLiquidWater)
  const totalAtt = fspl + gasAtt + rainAtt + cloudAtt
  const txPowerDBm = wattsToDBm(txPower)
  const receivedPower = txPowerDBm + txGain + rxGain - totalAtt
  const bwHz = DEFAULT_BANDWIDTH
  const noiseTemp = REFERENCE_NOISE_TEMP * (Math.pow(10, RECEIVER_NOISE_FIGURE / 10) - 1) + weather.temperature + 273.15
  const noisePower = 10 * Math.log10(BOLTZMANN_CONST * noiseTemp * bwHz) + 30
  const cNo = receivedPower - (10 * Math.log10(BOLTZMANN_CONST * noiseTemp) + 30)
  const ebNo = cNo - 10 * Math.log10(DEFAULT_BITRATE)
  const snr = receivedPower - noisePower
  const bitRate = bwHz * Math.log2(1 + Math.pow(10, snr / 10))
  const delay = propagationDelay(distanceKm)
  const doppler = distanceKm > 0 ? SATELLITE_VELOCITY_MS / (SPEED_OF_LIGHT / freqHz) : 0
  const linkMargin = ebNo - MIN_EB_NO
  return { frequency: freqGHz, distance: distanceKm, fspl, gasAttenuation: gasAtt, rainAttenuation: rainAtt, cloudAttenuation: cloudAtt, totalAttenuation: totalAtt, txPower: txPowerDBm, txGain, rxGain, receivedPower, noiseTemperature: noiseTemp, cNo, ebNo, snr, bitRate: Math.max(bitRate, 0), propagationDelay: delay, dopplerShift: doppler, linkMargin }
}

export function isLineOfSightBlocked(a: Position3D, b: Position3D): boolean {
  const dx = b.x - a.x; const dy = b.y - a.y; const dz = b.z - a.z
  const segLenSq = dx * dx + dy * dy + dz * dz
  if (segLenSq === 0) return false
  const t = -((a.x * dx + a.y * dy + a.z * dz) / segLenSq)
  if (t < 0 || t > 1) return false
  const cx = a.x + t * dx; const cy = a.y + t * dy; const cz = a.z + t * dz
  return (cx * cx + cy * cy + cz * cz) < EARTH_RADIUS * EARTH_RADIUS
}

export function computeElevation(groundPos: Position3D, otherPos: Position3D): number {
  const gMag = Math.sqrt(groundPos.x * groundPos.x + groundPos.y * groundPos.y + groundPos.z * groundPos.z)
  if (gMag === 0) return 90
  const rx = groundPos.x / gMag; const ry = groundPos.y / gMag; const rz = groundPos.z / gMag
  const losX = otherPos.x - groundPos.x; const losY = otherPos.y - groundPos.y; const losZ = otherPos.z - groundPos.z
  const losMag = Math.sqrt(losX * losX + losY * losY + losZ * losZ)
  if (losMag === 0) return 90
  const cosZenith = (losX * rx + losY * ry + losZ * rz) / losMag
  return Math.max(0, 90 - radToDeg(Math.acos(Math.max(-1, Math.min(1, cosZenith)))))
}
