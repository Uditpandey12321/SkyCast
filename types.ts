
export interface WeatherData {
  tempC: number;
  tempF: number;
  tempK: number;
  condition: string;
  windSpeedMph: number;
  windSpeedKph: number;
  windSpeedMs: number;
  humidity: number;
  rainChance: number;
  aqi: number;
  aqiDescription: string;
  location: string;
  alerts: string[];
  summary: string;
  sources: Array<{ title: string; uri: string }>;
}

export interface GeolocationState {
  lat: number | null;
  lng: number | null;
  error: string | null;
  loading: boolean;
}

export type WindUnit = 'mph' | 'kph' | 'ms';

export enum WeatherTheme {
  CLEAR = 'bg-blue-500',
  CLOUDY = 'bg-slate-500',
  RAINY = 'bg-indigo-700',
  STORM = 'bg-purple-900',
  NIGHT = 'bg-slate-900'
}
