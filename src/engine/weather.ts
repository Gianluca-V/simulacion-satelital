import type { WeatherCondition, WeatherState } from '../types'
import { WEATHER_PARAMS, DEFAULT_WEATHER } from '../utils/constants'

export function createWeatherState(condition: WeatherCondition): WeatherState {
  const params = WEATHER_PARAMS[condition]
  return { condition, ...params }
}

export function getWeatherDescription(weather: WeatherState): string {
  const descs: Record<string, string> = { Clear: '☀ Despejado', LightRain: '🌦 Lluvia ligera', ModerateRain: '🌧 Lluvia moderada', HeavyRain: '🌧 Lluvia intensa', Storm: '⛈ Tormenta', Fog: '🌫 Niebla', Snow: '❄ Nieve' }
  return descs[weather.condition] || weather.condition
}
