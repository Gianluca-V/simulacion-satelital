export function atmosphericGasAttenuation(freqGHz: number, waterVaporDensity: number, temperature: number): number {
  const f = freqGHz
  let ao: number
  if (f < 1) ao = 0.008
  else if (f < 10) ao = 0.008 + (f - 1) * 0.008
  else if (f < 30) ao = 0.08 + (f - 10) * 0.025
  else if (f < 60) ao = 0.58 + (f - 30) * 0.035
  else ao = 1.63
  const aw = waterVaporDensity * (f / 20) * (f / 20) * 0.02
  return ao + aw
}

export function rainAttenuation(freqGHz: number, rainRate: number, elevation: number): number {
  if (rainRate <= 0) return 0
  const k: Record<string, [number, number]> = { '1': [0.0001, 1], '10': [0.01, 1.2], '30': [0.1, 1.1], '50': [0.2, 1], '100': [0.5, 0.9] }
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

export function cloudAttenuation(freqGHz: number, cloudLiquidWater: number): number {
  if (cloudLiquidWater <= 0) return 0
  const kl = (0.5 * Math.exp(-((freqGHz - 20) * (freqGHz - 20)) / 200) + 0.1)
  return kl * cloudLiquidWater * 0.5
}
