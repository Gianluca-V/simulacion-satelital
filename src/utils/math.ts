import { EARTH_RADIUS, SPEED_OF_LIGHT, EARTH_GM, MS_TO_S } from './constants'
import type { Position3D, OrbitalElements } from '../types'

export function degToRad(deg: number): number { return deg * (Math.PI / 180) }
export function radToDeg(rad: number): number { return rad * (180 / Math.PI) }

export function latLngToPosition(lat: number, lng: number, radius: number = EARTH_RADIUS): Position3D {
  const latRad = degToRad(lat)
  const lngRad = degToRad(lng)
  return {
    x: radius * Math.cos(latRad) * Math.cos(lngRad),
    y: radius * Math.sin(latRad),
    z: radius * Math.cos(latRad) * Math.sin(lngRad),
  }
}

export function distance3D(a: Position3D, b: Position3D): number {
  const dx = a.x - b.x; const dy = a.y - b.y; const dz = a.z - b.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

export function orbitalElementsToPosition(elements: OrbitalElements, time: number): Position3D {
  const { semiMajorAxis, eccentricity, inclination, raan, argPerigee, trueAnomaly } = elements
  const a = semiMajorAxis + EARTH_RADIUS
  const inc = degToRad(inclination)
  const raanR = degToRad(raan)
  const argPerR = degToRad(argPerigee)
  const ta = degToRad(trueAnomaly) + time * MS_TO_S
  const rm = a * (1 - eccentricity * eccentricity) / (1 + eccentricity * Math.cos(ta))
  const xOrb = rm * Math.cos(ta)
  const yOrb = rm * Math.sin(ta)
  const cosRaan = Math.cos(raanR); const sinRaan = Math.sin(raanR)
  const cosInc = Math.cos(inc); const sinInc = Math.sin(inc)
  const cosArg = Math.cos(argPerR); const sinArg = Math.sin(argPerR)
  const x = (cosRaan * cosArg - sinRaan * sinArg * cosInc) * xOrb + (-cosRaan * sinArg - sinRaan * cosArg * cosInc) * yOrb
  const y = (sinRaan * cosArg + cosRaan * sinArg * cosInc) * xOrb + (-sinRaan * sinArg + cosRaan * cosArg * cosInc) * yOrb
  const z = sinInc * sinArg * xOrb + sinInc * cosArg * yOrb
  return { x, y, z }
}

export function orbitalVelocity(elements: OrbitalElements): number {
  const a = elements.semiMajorAxis + EARTH_RADIUS
  return Math.sqrt(EARTH_GM * (2 / a - 1 / a))
}

export function propagationDelay(distance: number): number { return (distance * 1000 / SPEED_OF_LIGHT) * 1000 }
export function generateId(): string { return Math.random().toString(36).substring(2, 9) }
export function clamp(value: number, min: number, max: number): number { return Math.max(min, Math.min(max, value)) }
