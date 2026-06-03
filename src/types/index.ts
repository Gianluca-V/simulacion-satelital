export type OrbitType = 'LEO' | 'MEO' | 'GEO'
export type WeatherCondition = 'Clear' | 'LightRain' | 'ModerateRain' | 'HeavyRain' | 'Storm' | 'Fog' | 'Snow'
export type FrequencyBand = 'UHF' | 'L' | 'S' | 'C' | 'X' | 'Ku' | 'K' | 'Ka' | 'V'
export type NodeType = 'satellite' | 'groundStation'
export type LinkDirection = 'uplink' | 'downlink' | 'crosslink'

export interface OrbitalElements {
  semiMajorAxis: number
  eccentricity: number
  inclination: number
  raan: number
  argPerigee: number
  trueAnomaly: number
}

export interface Position3D {
  x: number
  y: number
  z: number
}

export interface Satellite {
  id: string
  name: string
  type: 'satellite'
  orbitType: OrbitType
  orbitalElements: OrbitalElements
  position: Position3D
  velocity: Position3D
  altitude: number
  txPower: number
  txGain: number
  rxGain: number
  frequency: number
  bandwidth: number
  selected: boolean
}

export interface GroundStation {
  id: string
  name: string
  type: 'groundStation'
  lat: number
  lng: number
  position: Position3D
  txPower: number
  txGain: number
  rxGain: number
  frequency: number
  bandwidth: number
  selected: boolean
}

export type SimNode = Satellite | GroundStation

export interface WeatherState {
  condition: WeatherCondition
  rainRate: number
  waterVaporDensity: number
  cloudLiquidWater: number
  temperature: number
  humidity: number
  visibility: number
}

export interface LinkBudget {
  frequency: number
  distance: number
  fspl: number
  gasAttenuation: number
  rainAttenuation: number
  cloudAttenuation: number
  totalAttenuation: number
  txPower: number
  txGain: number
  rxGain: number
  receivedPower: number
  noiseTemperature: number
  cNo: number
  ebNo: number
  snr: number
  bitRate: number
  propagationDelay: number
  dopplerShift: number
  linkMargin: number
}

export interface Message {
  id: string
  sourceId: string
  destId: string
  content: string
  sizeBytes: number
  timestamp: number
  status: 'pending' | 'transmitting' | 'completed' | 'failed'
  linkBudget: LinkBudget | null
  progress: number
}

export interface FrequencyBandInfo {
  band: FrequencyBand
  minFreq: number
  maxFreq: number
  label: string
}

export interface OrbitTypeInfo {
  type: OrbitType
  minAlt: number
  maxAlt: number
  label: string
  description: string
}
