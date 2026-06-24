import { EARTH_RADIUS, GRAVITATIONAL_CONST, EARTH_MASS, SATELLITE_TX_POWERS, SAT_TX_GAIN, SAT_RX_GAIN, DEFAULT_BANDWIDTH, SAT_DEFAULT_FREQUENCY, DEFAULT_ALT_LEO, DEFAULT_ALT_MEO, DEFAULT_ALT_GEO, DEFAULT_INCL_LEO, DEFAULT_INCL_MEO, DEFAULT_INCL_GEO } from '../utils/constants'
import type { SatellitePreset } from '../utils/constants'
import type { OrbitalElements, Position3D, Satellite, OrbitType } from '../types'
import { degToRad, orbitalElementsToPosition, orbitalVelocity, generateId } from '../utils/math'

export function createOrbitalElements(orbitType: OrbitType, altitudeKm: number, inclinationDeg: number = 51.6, raanDeg: number = 0, argPerigeeDeg: number = 0, trueAnomalyDeg: number = 0, eccentricity: number = 0.001): OrbitalElements {
  return { semiMajorAxis: altitudeKm, eccentricity: Math.max(0.0001, eccentricity), inclination: inclinationDeg, raan: raanDeg, argPerigee: argPerigeeDeg, trueAnomaly: trueAnomalyDeg }
}

export function getDefaultAltitude(orbitType: OrbitType): number {
  switch (orbitType) { case 'LEO': return DEFAULT_ALT_LEO; case 'MEO': return DEFAULT_ALT_MEO; case 'GEO': return DEFAULT_ALT_GEO }
}

export function getDefaultInclination(orbitType: OrbitType): number {
  switch (orbitType) { case 'LEO': return DEFAULT_INCL_LEO; case 'MEO': return DEFAULT_INCL_MEO; case 'GEO': return DEFAULT_INCL_GEO }
}

export function computeOrbitalDelta(altitudeKm: number, elapsedSec: number): number {
  const a = altitudeKm + EARTH_RADIUS
  const orbitalPeriod = 2 * Math.PI * Math.sqrt(Math.pow(a * 1000, 3) / (GRAVITATIONAL_CONST * EARTH_MASS))
  const meanMotion = (2 * Math.PI) / orbitalPeriod
  return (meanMotion * elapsedSec) * (180 / Math.PI)
}

export function propagateSatellite(sat: Satellite, elapsedMs: number): { position: Position3D; trueAnomaly: number } {
  const deltaDeg = computeOrbitalDelta(sat.orbitalElements.semiMajorAxis, elapsedMs)
  const newTA = sat.orbitalElements.trueAnomaly + deltaDeg
  const propagated: OrbitalElements = { ...sat.orbitalElements, trueAnomaly: newTA }
  return { position: orbitalElementsToPosition(propagated, 0), trueAnomaly: newTA }
}

export function createSatellite(orbitType: OrbitType, preset?: SatellitePreset, altitudeKm?: number, inclinationDeg?: number, raanDeg?: number): Satellite {
  const alt = altitudeKm ?? getDefaultAltitude(orbitType)
  const incl = inclinationDeg ?? getDefaultInclination(orbitType)
  const raan = raanDeg ?? Math.random() * 360
  const els = createOrbitalElements(orbitType, alt, incl, raan)
  const pos = orbitalElementsToPosition(els, 0)
  const vel = orbitalVelocity(els)
  return { id: generateId(), name: preset ? `${orbitType}-${preset.frequencyBand}-${generateId().substring(0, 4)}` : `${orbitType}-${generateId().substring(0, 4)}`, type: 'satellite', orbitType, orbitalElements: els, position: pos, velocity: { x: 0, y: 0, z: vel }, altitude: alt, txPower: preset?.txPower ?? SATELLITE_TX_POWERS[orbitType], txGain: SAT_TX_GAIN, rxGain: SAT_RX_GAIN, frequency: preset?.frequency ?? SAT_DEFAULT_FREQUENCY, bandwidth: preset?.bandwidth ?? DEFAULT_BANDWIDTH, selected: false }
}
