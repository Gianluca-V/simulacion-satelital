import type { FrequencyBandInfo, OrbitTypeInfo, WeatherCondition, WeatherState, OrbitType } from '../types'

export interface SatellitePreset {
  label: string
  description: string
  frequency: number
  txPower: number
  bandwidth: number
  frequencyBand: string
}

export const EARTH_RADIUS = 6371
export const SCENE_SCALE = 100
export const EARTH_ROTATION_RATE = 7.2921159e-5
export const SPEED_OF_LIGHT = 299792458
export const BOLTZMANN_CONST = 1.380649e-23
export const BOLTZMANN_DB = -228.6
export const EARTH_MASS = 5.972e24
export const GRAVITATIONAL_CONST = 6.6743e-11
export const EARTH_GM = 3.986004418e5
export const MS_TO_S = 0.001

export const ORBIT_TYPES: OrbitTypeInfo[] = [
  { type: 'LEO', minAlt: 200, maxAlt: 2000, label: 'LEO - Baja', description: '200-2000 km' },
  { type: 'MEO', minAlt: 2000, maxAlt: 35786, label: 'MEO - Media', description: '2000-35786 km' },
  { type: 'GEO', minAlt: 35786, maxAlt: 35786, label: 'GEO - Geoestacionaria', description: '35786 km' },
]

export const FREQUENCY_BANDS: FrequencyBandInfo[] = [
  { band: 'UHF', minFreq: 0.3, maxFreq: 1.0, label: 'UHF (300-1000 MHz)' },
  { band: 'L', minFreq: 1.0, maxFreq: 2.0, label: 'Banda L (1-2 GHz)' },
  { band: 'S', minFreq: 2.0, maxFreq: 4.0, label: 'Banda S (2-4 GHz)' },
  { band: 'C', minFreq: 4.0, maxFreq: 8.0, label: 'Banda C (4-8 GHz)' },
  { band: 'X', minFreq: 8.0, maxFreq: 12.0, label: 'Banda X (8-12 GHz)' },
  { band: 'Ku', minFreq: 12.0, maxFreq: 18.0, label: 'Banda Ku (12-18 GHz)' },
  { band: 'K', minFreq: 18.0, maxFreq: 27.0, label: 'Banda K (18-27 GHz)' },
  { band: 'Ka', minFreq: 27.0, maxFreq: 40.0, label: 'Banda Ka (27-40 GHz)' },
  { band: 'V', minFreq: 40.0, maxFreq: 75.0, label: 'Banda V (40-75 GHz)' },
]

export const SATELLITE_PRESETS: Record<OrbitType, SatellitePreset[]> = {
  LEO: [
    { label: 'C-band 4 GHz', description: 'Banda C · validado Oros 2010', frequency: 4, txPower: 10, bandwidth: 10e6, frequencyBand: 'C' },
    { label: 'X-band 8.2 GHz', description: 'Observación terrestre', frequency: 8.2, txPower: 15, bandwidth: 20e6, frequencyBand: 'X' },
    { label: 'Ku-band 12 GHz', description: 'Comunicaciones', frequency: 12, txPower: 10, bandwidth: 10e6, frequencyBand: 'Ku' },
    { label: 'Ka-band 30 GHz', description: 'Alta capacidad · sensible a lluvia', frequency: 30, txPower: 5, bandwidth: 50e6, frequencyBand: 'Ka' },
  ],
  MEO: [
    { label: 'L-band 1.575 GHz', description: 'GPS / GNSS', frequency: 1.575, txPower: 25, bandwidth: 2e6, frequencyBand: 'L' },
    { label: 'C-band 5 GHz', description: 'Banda C', frequency: 5, txPower: 25, bandwidth: 10e6, frequencyBand: 'C' },
    { label: 'Ku-band 14 GHz', description: 'Comunicaciones', frequency: 14, txPower: 25, bandwidth: 15e6, frequencyBand: 'Ku' },
  ],
  GEO: [
    { label: 'C-band 4 GHz', description: 'COMTECO/BRASILSAT B3', frequency: 4, txPower: 50, bandwidth: 36e6, frequencyBand: 'C' },
    { label: 'Ku-band 12 GHz', description: 'DBS / VSAT', frequency: 12, txPower: 50, bandwidth: 36e6, frequencyBand: 'Ku' },
    { label: 'Ka-band 30 GHz', description: 'HTS · sensible a lluvia', frequency: 30, txPower: 100, bandwidth: 100e6, frequencyBand: 'Ka' },
  ],
}

export const WEATHER_PARAMS: Record<WeatherCondition, Omit<WeatherState, 'condition'>> = {
  Clear: { rainRate: 0, waterVaporDensity: 7.5, cloudLiquidWater: 0, temperature: 15, humidity: 40, visibility: 50 },
  LightRain: { rainRate: 2.5, waterVaporDensity: 10, cloudLiquidWater: 0.3, temperature: 12, humidity: 65, visibility: 15 },
  ModerateRain: { rainRate: 12.5, waterVaporDensity: 15, cloudLiquidWater: 0.8, temperature: 10, humidity: 80, visibility: 8 },
  HeavyRain: { rainRate: 25, waterVaporDensity: 20, cloudLiquidWater: 1.5, temperature: 8, humidity: 90, visibility: 3 },
  Storm: { rainRate: 50, waterVaporDensity: 25, cloudLiquidWater: 3.0, temperature: 6, humidity: 95, visibility: 1.5 },
  Fog: { rainRate: 0, waterVaporDensity: 5, cloudLiquidWater: 0.5, temperature: 10, humidity: 95, visibility: 0.5 },
  Snow: { rainRate: 5, waterVaporDensity: 5, cloudLiquidWater: 0.2, temperature: -2, humidity: 80, visibility: 4 },
}

export const DEFAULT_WEATHER: WeatherState = { condition: 'Clear', ...WEATHER_PARAMS.Clear }

export const SATELLITE_TX_POWERS: Record<string, number> = { LEO: 10, MEO: 25, GEO: 50 }
export const SAT_TX_GAIN = 30
export const SAT_RX_GAIN = 30
export const GS_TX_POWER = 200
export const GS_TX_GAIN = 40
export const GS_RX_GAIN = 40
export const DEFAULT_BANDWIDTH = 10e6
export const DEFAULT_BITRATE = 1e6
export const RECEIVER_NOISE_FIGURE = 3
export const REFERENCE_NOISE_TEMP = 290
export const MIN_EB_NO = 8.5
export const SATELLITE_VELOCITY_MS = 7500
export const PROCESSING_DELAY_MS = 5
export const SAT_DEFAULT_FREQUENCY = 12
export const GS_DEFAULT_FREQUENCY = 14
export const DEFAULT_ALT_LEO = 600
export const DEFAULT_ALT_MEO = 20200
export const DEFAULT_ALT_GEO = 35786
export const DEFAULT_INCL_LEO = 51.6
export const DEFAULT_INCL_MEO = 55
export const DEFAULT_INCL_GEO = 0
export const SIMULATION_SPEED = 500
export const MAX_LOG_MESSAGES = 50
