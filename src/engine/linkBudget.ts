import type { Position3D, WeatherState, LinkBudget } from '../types'
import { distance3D, propagationDelay, orbitalElementsToPosition, degToRad } from '../utils/math'
import { SPEED_OF_LIGHT, BOLTZMANN_CONST, EARTH_RADIUS } from '../utils/constants'
import { atmosphericGasAttenuation, rainAttenuation, cloudAttenuation } from './atmosphericAttenuation'

export function calculateLinkBudget(txPower: number, txGain: number, rxGain: number, freqGHz: number, distanceKm: number, weather: WeatherState): LinkBudget {
  const freqHz = freqGHz * 1e9
  const fspl = 20 * Math.log10(distanceKm * 1000) + 20 * Math.log10(freqHz) + 20 * Math.log10(4 * Math.PI / SPEED_OF_LIGHT)
  const gasAtt = atmosphericGasAttenuation(freqGHz, weather.humidity, weather.temperature)
  const rainAtt = rainAttenuation(freqGHz, weather.rainRate, 0)
  const cloudAtt = cloudAttenuation(freqGHz, weather.cloudLiquidWater)
  const totalAtt = fspl + gasAtt + rainAtt + cloudAtt
  const receivedPower = txPower + txGain + rxGain - totalAtt
  const bwHz = 10e6
  const noiseTemp = 290 * Math.pow(10, 3 / 10) + weather.temperature + 273.15
  const noisePower = 10 * Math.log10(BOLTZMANN_CONST * noiseTemp * bwHz) + 30
  const cNo = receivedPower - (10 * Math.log10(BOLTZMANN_CONST * noiseTemp) + 30)
  const ebNo = cNo - 10 * Math.log10(1e6)
  const snr = receivedPower - noisePower
  const bitRate = bwHz * Math.log2(1 + Math.pow(10, snr / 10))
  const delay = propagationDelay(distanceKm)
  const doppler = (distanceKm > 0 ? (7000 / 3.6) / (SPEED_OF_LIGHT / freqHz) : 0) * 1e3
  const minEbNo = 8.5
  const linkMargin = ebNo - minEbNo
  return { frequency: freqGHz, distance: distanceKm, fspl, gasAttenuation: gasAtt, rainAttenuation: rainAtt, cloudAttenuation: cloudAtt, totalAttenuation: totalAtt, txPower, txGain, rxGain, receivedPower, noiseTemperature: noiseTemp, cNo, ebNo, snr, bitRate: Math.max(bitRate, 0), propagationDelay: delay, dopplerShift: doppler, linkMargin }
}
