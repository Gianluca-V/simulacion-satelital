import { EARTH_RADIUS, GRAVITATIONAL_CONST, EARTH_MASS, SATELLITE_TX_POWERS, SAT_TX_GAIN, SAT_RX_GAIN, DEFAULT_BANDWIDTH, SAT_DEFAULT_FREQUENCY, DEFAULT_ALT_LEO, DEFAULT_ALT_MEO, DEFAULT_ALT_GEO, DEFAULT_INCL_LEO, DEFAULT_INCL_MEO, DEFAULT_INCL_GEO } from '../utils/constants'
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

export function propagateSatellite(sat: Satellite, elapsedMs: number): Position3D {
  const els = sat.orbitalElements
  const orbitalPeriod = 2 * Math.PI * Math.sqrt(Math.pow((els.semiMajorAxis + EARTH_RADIUS) * 1000, 3) / (GRAVITATIONAL_CONST * EARTH_MASS))
  const meanMotion = (2 * Math.PI) / orbitalPeriod
  const deltaTrueAnomaly = degToRad(meanMotion * elapsedMs)
  const propagated: OrbitalElements = { ...els, trueAnomaly: els.trueAnomaly + deltaTrueAnomaly * (180 / Math.PI) }
  return orbitalElementsToPosition(propagated, 0)
}

export function createSatellite(orbitType: OrbitType, altitudeKm?: number, inclinationDeg?: number, raanDeg?: number): Satellite {
  const alt = altitudeKm ?? getDefaultAltitude(orbitType)
  const incl = inclinationDeg ?? getDefaultInclination(orbitType)
  const raan = raanDeg ?? Math.random() * 360
  const els = createOrbitalElements(orbitType, alt, incl, raan)
  const pos = orbitalElementsToPosition(els, 0)
  const vel = orbitalVelocity(els)
  return { id: generateId(), name: `${orbitType}-${generateId().substring(0, 4)}`, type: 'satellite', orbitType, orbitalElements: els, position: pos, velocity: { x: 0, y: 0, z: vel }, altitude: alt, txPower: SATELLITE_TX_POWERS[orbitType], txGain: SAT_TX_GAIN, rxGain: SAT_RX_GAIN, frequency: SAT_DEFAULT_FREQUENCY, bandwidth: DEFAULT_BANDWIDTH, selected: false }
}
