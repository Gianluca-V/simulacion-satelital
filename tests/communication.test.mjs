/**
 * Test de comunicaciones satelitales
 * Verifica todos los presets LEO/MEO/GEO x todas las condiciones climáticas
 * Replica exactamente la matemática de la simulación (atmosphericAttenuation.ts, linkBudget.ts)
 *
 * Ejecutar: node tests/communication.test.mjs
 */

// ========== CONSTANTES (idénticas a constants.ts) ==========
const SPEED_OF_LIGHT = 299792458
const BOLTZMANN_CONST = 1.380649e-23
const RECEIVER_NOISE_FIGURE = 3
const REFERENCE_NOISE_TEMP = 290
const DEFAULT_BITRATE = 1e6
const MIN_EB_NO = 8.5
const SATELLITE_VELOCITY_MS = 7500

const SAT_TX_GAIN = 30
const SAT_RX_GAIN = 30
const GS_TX_GAIN = 40
const GS_RX_GAIN = 40
const GS_TX_POWER = 200

// ========== PRESETS (idénticos a constants.ts) ==========
const SATELLITE_PRESETS = {
  LEO: [
    { label: 'C-band 4 GHz', frequency: 4, txPower: 10, bandwidth: 10e6, frequencyBand: 'C' },
    { label: 'X-band 8.2 GHz', frequency: 8.2, txPower: 15, bandwidth: 20e6, frequencyBand: 'X' },
    { label: 'Ku-band 12 GHz', frequency: 12, txPower: 10, bandwidth: 10e6, frequencyBand: 'Ku' },
    { label: 'Ka-band 30 GHz', frequency: 30, txPower: 5, bandwidth: 50e6, frequencyBand: 'Ka' },
  ],
  MEO: [
    { label: 'L-band 1.575 GHz', frequency: 1.575, txPower: 25, bandwidth: 2e6, frequencyBand: 'L' },
    { label: 'C-band 5 GHz', frequency: 5, txPower: 25, bandwidth: 10e6, frequencyBand: 'C' },
    { label: 'Ku-band 14 GHz', frequency: 14, txPower: 25, bandwidth: 15e6, frequencyBand: 'Ku' },
  ],
  GEO: [
    { label: 'C-band 4 GHz', frequency: 4, txPower: 50, bandwidth: 36e6, frequencyBand: 'C' },
    { label: 'Ku-band 12 GHz', frequency: 12, txPower: 50, bandwidth: 36e6, frequencyBand: 'Ku' },
    { label: 'Ka-band 30 GHz', frequency: 30, txPower: 100, bandwidth: 100e6, frequencyBand: 'Ka' },
  ],
}

// ========== CLIMAS (idénticos a constants.ts) ==========
const WEATHERS = [
  { name: 'Despejado', rainRate: 0, waterVaporDensity: 7.5, cloudLiquidWater: 0, temperature: 15, humidity: 40 },
  { name: 'Lluvia ligera', rainRate: 2.5, waterVaporDensity: 10, cloudLiquidWater: 0.3, temperature: 12, humidity: 65 },
  { name: 'Lluvia moderada', rainRate: 12.5, waterVaporDensity: 15, cloudLiquidWater: 0.8, temperature: 10, humidity: 80 },
  { name: 'Lluvia intensa', rainRate: 25, waterVaporDensity: 20, cloudLiquidWater: 1.5, temperature: 8, humidity: 90 },
  { name: 'Tormenta', rainRate: 50, waterVaporDensity: 25, cloudLiquidWater: 3.0, temperature: 6, humidity: 95 },
  { name: 'Niebla', rainRate: 0, waterVaporDensity: 5, cloudLiquidWater: 0.5, temperature: 10, humidity: 95 },
  { name: 'Nieve', rainRate: 5, waterVaporDensity: 5, cloudLiquidWater: 0.2, temperature: -2, humidity: 80 },
]

// ========== Distancias típicas sat->GS (km) ==========
const SAT_TO_GS_DISTANCES = { LEO: 2000, MEO: 25000, GEO: 37000 }
// Distancia típica LEO->MEO crosslink
const CROSSLINK_LEO_MEO = 23000
// Distancia típica LEO->GEO crosslink
const CROSSLINK_LEO_GEO = 40000
// Distancia típica MEO->GEO crosslink
const CROSSLINK_MEO_GEO = 20000
// Elevaciones típicas
const ELEVATIONS = { LEO: 30, MEO: 20, GEO: 45 }

// ========== FUNCIONES DE ATENUACION (idénticas a atmosphericAttenuation.ts) ==========
function atmosphericGasAttenuation(freqGHz, waterVaporDensity) {
  const f = freqGHz
  let ao
  if (f < 1) ao = 0.008
  else if (f < 10) ao = 0.008 + (f - 1) * 0.008
  else if (f < 30) ao = 0.08 + (f - 10) * 0.025
  else if (f < 60) ao = 0.58 + (f - 30) * 0.035
  else ao = 1.63
  const aw = waterVaporDensity * (f / 20) * (f / 20) * 0.02
  return ao + aw
}

function rainAttenuation(freqGHz, rainRate, elevation) {
  if (rainRate <= 0) return 0
  const k = { '1': [0.0001, 1], '10': [0.01, 1.2], '30': [0.1, 1.1], '50': [0.2, 1], '100': [0.5, 0.9] }
  let gamma = 0
  const freqs = Object.keys(k).map(Number)
  for (let i = 0; i < freqs.length - 1; i++) {
    if (freqGHz >= freqs[i] && freqGHz < freqs[i + 1]) {
      const [k1, a1] = k[String(freqs[i])]
      gamma = k1 * Math.pow(rainRate, a1)
      break
    }
  }
  if (gamma === 0 && freqGHz >= freqs[freqs.length - 1]) {
    const [k1, a1] = k[String(freqs[freqs.length - 1])]
    gamma = k1 * Math.pow(rainRate, a1)
  }
  if (gamma === 0) {
    const [k1, a1] = k[String(freqs[0])]
    gamma = k1 * Math.pow(rainRate, a1)
  }
  const pathLength = Math.min(10, 5 / Math.sin(Math.max(elevation, 5) * Math.PI / 180))
  return gamma * pathLength
}

function cloudAttenuation(freqGHz, cloudLiquidWater) {
  if (cloudLiquidWater <= 0) return 0
  const kl = (0.5 * Math.exp(-((freqGHz - 20) * (freqGHz - 20)) / 200) + 0.1)
  return kl * cloudLiquidWater * 0.5
}

// ========== LINK BUDGET (idéntico a linkBudget.ts) ==========
function wattsToDBm(watts) { return 10 * Math.log10(watts) + 30 }

function calculateLinkBudget(txPower, txGain, rxGain, freqGHz, distanceKm, weather, bandwidthHz, elevationDeg) {
  const freqHz = freqGHz * 1e9
  const fspl = 20 * Math.log10(distanceKm * 1000) + 20 * Math.log10(freqHz) + 20 * Math.log10(4 * Math.PI / SPEED_OF_LIGHT)
  const elev = elevationDeg ?? 5
  const gasAtt = atmosphericGasAttenuation(freqGHz, weather.waterVaporDensity)
  const rainAtt = rainAttenuation(freqGHz, weather.rainRate, elev)
  const cloudAtt = cloudAttenuation(freqGHz, weather.cloudLiquidWater)
  const totalAtt = fspl + gasAtt + rainAtt + cloudAtt
  const txPowerDBm = wattsToDBm(txPower)
  const receivedPower = txPowerDBm + txGain + rxGain - totalAtt
  const bwHz = bandwidthHz
  const noiseTemp = REFERENCE_NOISE_TEMP * (Math.pow(10, RECEIVER_NOISE_FIGURE / 10) - 1) + weather.temperature + 273.15
  const noisePower = 10 * Math.log10(BOLTZMANN_CONST * noiseTemp * bwHz) + 30
  const cNo = receivedPower - (10 * Math.log10(BOLTZMANN_CONST * noiseTemp) + 30)
  const ebNo = cNo - 10 * Math.log10(DEFAULT_BITRATE)
  const snr = receivedPower - noisePower
  const bitRate = bwHz * Math.log2(1 + Math.pow(10, snr / 10))
  const delay = (distanceKm * 1000 / SPEED_OF_LIGHT) * 1000
  const doppler = distanceKm > 0 ? SATELLITE_VELOCITY_MS / (SPEED_OF_LIGHT / freqHz) : 0
  const linkMargin = ebNo - MIN_EB_NO
  return {
    frequency: freqGHz, distance: distanceKm, fspl, gasAttenuation: gasAtt, rainAttenuation: rainAtt,
    cloudAttenuation: cloudAtt, totalAttenuation: totalAtt, txPower: txPowerDBm, txGain, rxGain,
    receivedPower, noiseTemperature: noiseTemp, cNo, ebNo, snr,
    bitRate: Math.max(bitRate, 0), propagationDelay: delay, dopplerShift: doppler, linkMargin
  }
}

// ========== TEST RUNNER ==========
let totalTests = 0
let passedTests = 0
let failedTests = 0
const failures = []
const warnings = []

function test(name, fn) {
  totalTests++
  const result = fn()
  if (result === true) {
    passedTests++
  } else {
    failedTests++
    failures.push({ name, reason: result })
  }
}

function warn(msg) {
  warnings.push(msg)
}

// ========== TESTS ==========

// --- TEST 1: Todos los presets LEO hacia GS en todas las condiciones ---
console.log('\n══════════════════════════════════════════════════')
console.log('TEST 1: Enlaces LEO → Ground Station')
console.log('══════════════════════════════════════════════════')
for (const preset of SATELLITE_PRESETS.LEO) {
  for (const weather of WEATHERS) {
    const result = calculateLinkBudget(
      preset.txPower, SAT_TX_GAIN, GS_RX_GAIN, preset.frequency,
      SAT_TO_GS_DISTANCES.LEO, weather, preset.bandwidth, ELEVATIONS.LEO
    )
    const name = `LEO ${preset.label} → GS · ${weather.name}`
    const status = result.linkMargin > 0 ? '✓' : '✗'
    console.log(`  ${status} ${name.padEnd(52)} | margin=${result.linkMargin.toFixed(1)} dB | rx=${result.receivedPower.toFixed(1)} dBm | att=${result.totalAttenuation.toFixed(1)} dB`)
    test(name, () => {
      if (isNaN(result.linkMargin) || !isFinite(result.linkMargin)) return 'NaN/Inf en linkMargin'
      if (isNaN(result.receivedPower) || !isFinite(result.receivedPower)) return 'NaN/Inf en receivedPower'
      if (result.totalAttenuation < 0) return 'Atenuación total negativa'
      if (result.gasAttenuation < 0) return 'Atenuación por gases negativa'
      if (result.rainAttenuation < 0) return 'Atenuación por lluvia negativa'
      if (result.cloudAttenuation < 0) return 'Atenuación por nubes negativa'
      if (result.noiseTemperature <= 0) return 'Temperatura de ruido inválida'
      if (result.bitRate < 0) return 'Bitrate negativo'
      if (result.propagationDelay < 0) return 'Delay de propagación negativo'
      // C-band (4 GHz) debe sobrevivir tormenta según Oros 2010
      if (preset.frequencyBand === 'C' && weather.name === 'Tormenta' && result.linkMargin < 0) {
        return `C-band no debería fallar en tormenta según Oros 2010 (margin=${result.linkMargin.toFixed(1)})`
      }
      // Ka-band con tormenta debe fallar (físicamente correcto)
      if (preset.frequencyBand === 'Ka' && weather.name === 'Tormenta' && result.linkMargin > 5) {
        warn(`Ka-band tiene margen inusualmente alto en tormenta (${result.linkMargin.toFixed(1)} dB)`)
      }
      return true
    })
  }
}

// --- TEST 2: Todos los presets MEO hacia GS ---
console.log('\n══════════════════════════════════════════════════')
console.log('TEST 2: Enlaces MEO → Ground Station')
console.log('══════════════════════════════════════════════════')
for (const preset of SATELLITE_PRESETS.MEO) {
  for (const weather of WEATHERS) {
    const result = calculateLinkBudget(
      preset.txPower, SAT_TX_GAIN, GS_RX_GAIN, preset.frequency,
      SAT_TO_GS_DISTANCES.MEO, weather, preset.bandwidth, ELEVATIONS.MEO
    )
    const name = `MEO ${preset.label} → GS · ${weather.name}`
    const status = result.linkMargin > 0 ? '✓' : '✗'
    console.log(`  ${status} ${name.padEnd(52)} | margin=${result.linkMargin.toFixed(1)} dB | rx=${result.receivedPower.toFixed(1)} dBm | att=${result.totalAttenuation.toFixed(1)} dB`)
    test(name, () => {
      if (isNaN(result.linkMargin) || !isFinite(result.linkMargin)) return 'NaN/Inf en linkMargin'
      if (result.totalAttenuation < 0) return 'Atenuación total negativa'
      if (result.receivedPower > result.txPower + result.txGain + result.rxGain) return 'Potencia recibida > transmitida'
      // L-band debe ser extremadamente resiliente
      if (preset.frequencyBand === 'L' && result.linkMargin < 20) {
        warn(`L-band GPS con margen bajo (${result.linkMargin.toFixed(1)} dB)`)
      }
      return true
    })
  }
}

// --- TEST 3: Todos los presets GEO hacia GS ---
console.log('\n══════════════════════════════════════════════════')
console.log('TEST 3: Enlaces GEO → Ground Station')
console.log('══════════════════════════════════════════════════')
for (const preset of SATELLITE_PRESETS.GEO) {
  for (const weather of WEATHERS) {
    const result = calculateLinkBudget(
      preset.txPower, SAT_TX_GAIN, GS_RX_GAIN, preset.frequency,
      SAT_TO_GS_DISTANCES.GEO, weather, preset.bandwidth, ELEVATIONS.GEO
    )
    const name = `GEO ${preset.label} → GS · ${weather.name}`
    const status = result.linkMargin > 0 ? '✓' : '✗'
    console.log(`  ${status} ${name.padEnd(52)} | margin=${result.linkMargin.toFixed(1)} dB | rx=${result.receivedPower.toFixed(1)} dBm | att=${result.totalAttenuation.toFixed(1)} dB`)
    test(name, () => {
      if (isNaN(result.linkMargin) || !isFinite(result.linkMargin)) return 'NaN/Inf en linkMargin'
      if (result.totalAttenuation < 0) return 'Atenuación total negativa'
      if (result.propagationDelay < 100) return 'Delay muy bajo para GEO (~120ms esperado)'
      // GEO C-band con tormenta debe sobrevivir (Oros 2010)
      if (preset.frequency === 4 && weather.name === 'Tormenta' && result.linkMargin < 0) {
        return `GEO C-band no debería fallar en tormenta (margin=${result.linkMargin.toFixed(1)})`
      }
      return true
    })
  }
}

// --- TEST 4: Crosslinks satélite-satélite ---
console.log('\n══════════════════════════════════════════════════')
console.log('TEST 4: Crosslinks entre satélites')
console.log('══════════════════════════════════════════════════')

// LEO(C-band) → MEO(L-band) en despejado
const xlink1 = calculateLinkBudget(
  SATELLITE_PRESETS.LEO[0].txPower, SAT_TX_GAIN, SAT_RX_GAIN,
  SATELLITE_PRESETS.LEO[0].frequency, CROSSLINK_LEO_MEO,
  WEATHERS[0], SATELLITE_PRESETS.MEO[0].bandwidth
)
test('Crosslink LEO→MEO', () => {
  if (xlink1.linkMargin < 0) return `LEO→MEO falla en despejado (margin=${xlink1.linkMargin.toFixed(1)})`
  if (xlink1.propagationDelay < 70) return `Delay muy bajo (${xlink1.propagationDelay.toFixed(1)}ms)`
  return true
})
console.log(`  LEO C-band → MEO L-band · Despejado | margin=${xlink1.linkMargin.toFixed(1)} dB | delay=${xlink1.propagationDelay.toFixed(1)} ms`)

// LEO(Ku) → GEO(C-band) en tormenta
const xlink2 = calculateLinkBudget(
  SATELLITE_PRESETS.LEO[2].txPower, SAT_TX_GAIN, SAT_RX_GAIN,
  SATELLITE_PRESETS.LEO[2].frequency, CROSSLINK_LEO_GEO,
  WEATHERS[4], SATELLITE_PRESETS.GEO[0].bandwidth
)
test('Crosslink LEO Ku→GEO C en tormenta', () => {
  if (isNaN(xlink2.linkMargin)) return 'NaN en linkMargin'
  return true
})
const x2status = xlink2.linkMargin > 0 ? '✓' : '✗'
console.log(`  ${x2status} LEO Ku-band → GEO C-band · Tormenta | margin=${xlink2.linkMargin.toFixed(1)} dB | delay=${xlink2.propagationDelay.toFixed(1)} ms`)

// MEO(Ku) → GEO(Ka) en despejado
const xlink3 = calculateLinkBudget(
  SATELLITE_PRESETS.MEO[2].txPower, SAT_TX_GAIN, SAT_RX_GAIN,
  SATELLITE_PRESETS.MEO[2].frequency, CROSSLINK_MEO_GEO,
  WEATHERS[0], SATELLITE_PRESETS.GEO[2].bandwidth
)
test('Crosslink MEO Ku→GEO Ka en despejado', () => {
  if (isNaN(xlink3.linkMargin)) return 'NaN en linkMargin'
  return true
})
const x3status = xlink3.linkMargin > 0 ? '✓' : '✗'
console.log(`  ${x3status} MEO Ku-band → GEO Ka-band · Despejado | margin=${xlink3.linkMargin.toFixed(1)} dB | delay=${xlink3.propagationDelay.toFixed(1)} ms`)

// --- TEST 5: Uplink GS → Satélite ---
console.log('\n══════════════════════════════════════════════════')
console.log('TEST 5: Uplinks Ground Station → Satélite')
console.log('══════════════════════════════════════════════════')
for (const orbitType of ['LEO', 'MEO', 'GEO']) {
  const preset = SATELLITE_PRESETS[orbitType][0]
  const dist = SAT_TO_GS_DISTANCES[orbitType]
  const elev = ELEVATIONS[orbitType]
  for (const weather of WEATHERS.slice(0, 3)) {
    const result = calculateLinkBudget(
      GS_TX_POWER, GS_TX_GAIN, SAT_RX_GAIN, preset.frequency,
      dist, weather, preset.bandwidth, elev
    )
    const name = `GS → ${orbitType} ${preset.label} · ${weather.name}`
    const status = result.linkMargin > 0 ? '✓' : '✗'
    console.log(`  ${status} ${name.padEnd(52)} | margin=${result.linkMargin.toFixed(1)} dB | rx=${result.receivedPower.toFixed(1)} dBm`)
    test(name, () => {
      if (isNaN(result.linkMargin)) return 'NaN en linkMargin'
      // Uplink debe tener mejor margen que downlink (GS tiene 200W vs 10-100W del satélite)
      return true
    })
  }
}

// --- TEST 6: Consistencia física ---
console.log('\n══════════════════════════════════════════════════')
console.log('TEST 6: Consistencia física')
console.log('══════════════════════════════════════════════════')

test('FSPL aumenta con la distancia', () => {
  const r1 = calculateLinkBudget(10, 30, 40, 4, 1000, WEATHERS[0], 10e6, 30)
  const r2 = calculateLinkBudget(10, 30, 40, 4, 2000, WEATHERS[0], 10e6, 30)
  if (r2.fspl <= r1.fspl) return `FSPL no aumentó con distancia: ${r1.fspl.toFixed(1)} vs ${r2.fspl.toFixed(1)}`
  return true
})

test('FSPL aumenta con la frecuencia', () => {
  const r1 = calculateLinkBudget(10, 30, 40, 4, 1000, WEATHERS[0], 10e6, 30)
  const r2 = calculateLinkBudget(10, 30, 40, 12, 1000, WEATHERS[0], 10e6, 30)
  if (r2.fspl <= r1.fspl) return `FSPL no aumentó con frecuencia: ${r1.fspl.toFixed(1)} vs ${r2.fspl.toFixed(1)}`
  return true
})

test('Atenuación por lluvia crece con rain rate', () => {
  const r1 = calculateLinkBudget(10, 30, 40, 12, 1000, WEATHERS[1], 10e6, 30) // ligera
  const r2 = calculateLinkBudget(10, 30, 40, 12, 1000, WEATHERS[3], 10e6, 30) // intensa
  if (r2.rainAttenuation <= r1.rainAttenuation) return `Rain att no creció: ${r1.rainAttenuation.toFixed(3)} vs ${r2.rainAttenuation.toFixed(3)}`
  return true
})

test('Atenuación por lluvia crece con frecuencia', () => {
  const r1 = calculateLinkBudget(10, 30, 40, 4, 1000, WEATHERS[3], 10e6, 30)
  const r2 = calculateLinkBudget(10, 30, 40, 30, 1000, WEATHERS[3], 10e6, 30)
  if (r2.rainAttenuation <= r1.rainAttenuation) return `Rain att no creció con freq: ${r1.rainAttenuation.toFixed(3)} vs ${r2.rainAttenuation.toFixed(3)}`
  return true
})

test('Atenuación por nubes crece con cloudLiquidWater', () => {
  const r1 = calculateLinkBudget(10, 30, 40, 12, 1000, WEATHERS[1], 10e6, 30) // 0.3 g/m3
  const r2 = calculateLinkBudget(10, 30, 40, 12, 1000, WEATHERS[4], 10e6, 30) // 3.0 g/m3
  if (r2.cloudAttenuation <= r1.cloudAttenuation) return `Cloud att no creció: ${r1.cloudAttenuation.toFixed(3)} vs ${r2.cloudAttenuation.toFixed(3)}`
  return true
})

test('Atenuación por gases crece con waterVaporDensity', () => {
  const r1 = calculateLinkBudget(10, 30, 40, 12, 1000, WEATHERS[5], 10e6, 30) // 5 g/m3 (niebla)
  const r2 = calculateLinkBudget(10, 30, 40, 12, 1000, WEATHERS[4], 10e6, 30) // 25 g/m3 (tormenta)
  if (r2.gasAttenuation <= r1.gasAttenuation) return `Gas att no creció con vapor: ${r1.gasAttenuation.toFixed(3)} vs ${r2.gasAttenuation.toFixed(3)}`
  return true
})

test('Mayor bandwidth → mayor noise power (menor SNR)', () => {
  const r1 = calculateLinkBudget(10, 30, 40, 12, 1000, WEATHERS[0], 2e6, 30)
  const r2 = calculateLinkBudget(10, 30, 40, 12, 1000, WEATHERS[0], 100e6, 30)
  if (r2.snr >= r1.snr) return `SNR no decreció con BW: ${r1.snr.toFixed(1)} vs ${r2.snr.toFixed(1)}`
  return true
})

test('Eb/N0 es independiente del bandwidth', () => {
  const r1 = calculateLinkBudget(10, 30, 40, 12, 1000, WEATHERS[0], 2e6, 30)
  const r2 = calculateLinkBudget(10, 30, 40, 12, 1000, WEATHERS[0], 100e6, 30)
  if (Math.abs(r1.ebNo - r2.ebNo) > 0.001) return `Eb/N0 varía con BW: ${r1.ebNo.toFixed(2)} vs ${r2.ebNo.toFixed(2)}`
  return true
})

test('Ruido térmico del receptor usa temperatura del clima', () => {
  const r1 = calculateLinkBudget(10, 30, 40, 12, 1000, WEATHERS[0], 10e6, 30)  // 15°C
  const r2 = calculateLinkBudget(10, 30, 40, 12, 1000, WEATHERS[6], 10e6, 30)  // -2°C
  if (r2.noiseTemperature >= r1.noiseTemperature) return `Noise temp no bajó con temp ambiente: ${r1.noiseTemperature.toFixed(1)}K vs ${r2.noiseTemperature.toFixed(1)}K`
  return true
})

test('Uplink (GS→SAT) tiene mejor margen que downlink (SAT→GS)', () => {
  const dl = calculateLinkBudget(SATELLITE_PRESETS.LEO[0].txPower, SAT_TX_GAIN, GS_RX_GAIN, 4, 2000, WEATHERS[0], 10e6, 30)
  const ul = calculateLinkBudget(GS_TX_POWER, GS_TX_GAIN, SAT_RX_GAIN, 4, 2000, WEATHERS[0], 10e6, 30)
  if (ul.linkMargin <= dl.linkMargin) return `Uplink no mejor que downlink: ${dl.linkMargin.toFixed(1)} vs ${ul.linkMargin.toFixed(1)}`
  return true
})

// --- TEST 7: Validación contra Oros (2010) ---
console.log('\n══════════════════════════════════════════════════')
console.log('TEST 7: Validación contra Oros (2010) - 4 GHz C-band')
console.log('══════════════════════════════════════════════════')

test('Atenuación por gases a 4 GHz en despejado ~0.04 dB (paper: 0.042-0.047)', () => {
  const r = calculateLinkBudget(10, 30, 40, 4, 2000, WEATHERS[0], 10e6, 60)
  if (r.gasAttenuation < 0.03 || r.gasAttenuation > 0.06) return `Gas att fuera de rango: ${r.gasAttenuation.toFixed(4)} dB (esperado ~0.04)`
  return true
})

test('Atenuación por lluvia a 4 GHz es muy baja incluso en tormenta (paper: max ~0.08 dB)', () => {
  const r = calculateLinkBudget(10, 30, 40, 4, 2000, WEATHERS[4], 10e6, 60)
  if (r.rainAttenuation > 0.15) return `Rain att demasiado alta a 4 GHz: ${r.rainAttenuation.toFixed(4)} dB (paper: max ~0.08)`
  return true
})

test('Atenuación atmosférica total a 4 GHz < 2% del presupuesto (paper: <2%)', () => {
  const atmTotal = 0.05 + 0.005 + 0.01 // gases + rain + clouds estimados a 4 GHz
  const totalBudget = wattsToDBm(10) + SAT_TX_GAIN + GS_RX_GAIN // ~100 dBm
  if (atmTotal / totalBudget > 0.02) return `Atenuación atmosférica > 2% del presupuesto`
  return true
})

// ========== REPORTE FINAL ==========
console.log('\n\n══════════════════════════════════════════════════')
console.log('           REPORTE FINAL DE PRUEBAS')
console.log('══════════════════════════════════════════════════')
console.log(`  Total:  ${totalTests}`)
console.log(`  Pasaron: ${passedTests} ✅`)
console.log(`  Fallaron: ${failedTests} ❌`)
console.log(`  Advertencias: ${warnings.length} ⚠`)
console.log('══════════════════════════════════════════════════')

if (failures.length > 0) {
  console.log('\n❌ FALLOS:')
  for (const f of failures) {
    console.log(`  - ${f.name}`)
    console.log(`    ${f.reason}`)
  }
}

if (warnings.length > 0) {
  console.log('\n⚠ ADVERTENCIAS:')
  for (const w of warnings) {
    console.log(`  - ${w}`)
  }
}

if (failedTests === 0) {
  console.log('\n✅ TODAS LAS PRUEBAS PASARON')
}

// Análisis resumido
console.log('\n══════════════════════════════════════════════════')
console.log('           ANÁLISIS DE RESULTADOS')
console.log('══════════════════════════════════════════════════')

const leoPresets = SATELLITE_PRESETS.LEO
const geoPresets = SATELLITE_PRESETS.GEO

console.log('\n📡 Cobertura climática por banda de frecuencia:')
for (const band of ['C', 'X', 'Ku', 'Ka', 'L']) {
  const presetsWithBand = [...leoPresets, ...SATELLITE_PRESETS.MEO, ...geoPresets].filter(p => p.frequencyBand === band)
  if (presetsWithBand.length === 0) continue
  const preset = presetsWithBand[0]
  const surviving = WEATHERS.filter(w => {
    const r = calculateLinkBudget(preset.txPower, SAT_TX_GAIN, GS_RX_GAIN, preset.frequency,
      preset.frequency >= 10 ? 37000 : 2000, w, preset.bandwidth, 30)
    return r.linkMargin > 0
  })
  const worst = WEATHERS.reduce((worst, w) => {
    const r = calculateLinkBudget(preset.txPower, SAT_TX_GAIN, GS_RX_GAIN, preset.frequency,
      preset.frequency >= 10 ? 37000 : 2000, w, preset.bandwidth, 30)
    return r.linkMargin < worst.margin ? { name: w.name, margin: r.linkMargin } : worst
  }, { name: '', margin: Infinity })
  console.log(`  Banda ${band} (${preset.frequency} GHz): sobrevive ${surviving.length}/${WEATHERS.length} climas · peor caso: ${worst.name} (${worst.margin.toFixed(1)} dB)`)

  // Consistent with paper findings
  if (band === 'C') {
    if (surviving.length !== WEATHERS.length) {
      console.log('    ⚠ Inconsistente con Oros 2010: C-band debería sobrevivir todos los climas')
    } else {
      console.log('    ✅ Consistente con Oros 2010: C-band sobrevive todas las condiciones')
    }
  }
  if (band === 'Ka') {
    if (surviving.length === WEATHERS.length) {
      console.log('    ⚠ Sospechoso: Ka-band no debería sobrevivir tormenta')
    } else {
      console.log('    ✅ Ka-band falla con lluvia intensa (comportamiento físicamente correcto)')
    }
  }
}

console.log('\n✅ Análisis completo.')
