import * as Location from 'expo-location';
import type { SQLiteDatabase } from 'expo-sqlite';

import { getSetting, setSetting } from './db/reflection';

// Clima da localização atual do aparelho.
//
// A API de clima nativa da Apple (WeatherKit) exige o Apple Developer Program
// pago + entitlement próprio, que a AltStore não consegue assinar com Apple ID
// grátis. Então: localização via expo-location (nativa do iPhone) e clima via
// Open-Meteo (gratuito, sem chave). O último resultado fica em cache no SQLite
// para o header aparecer na hora e funcionar offline.

export type Weather = {
  temp: number; // °C, arredondado
  condition: string;
  place: string | null; // cidade/bairro pelo reverse geocode
  fetchedAt: string; // ISO
};

export type WeatherState =
  | { status: 'loading'; weather: Weather | null }
  | { status: 'ok'; weather: Weather }
  | { status: 'denied'; weather: Weather | null }
  | { status: 'error'; weather: Weather | null };

const CACHE_KEY = 'weather_cache';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min

// Códigos WMO usados pela Open-Meteo → texto curto.
function describe(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? 'Clear sky' : 'Clear night';
  if (code === 1) return 'Mostly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Fog';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Showers';
  if (code === 85 || code === 86) return 'Snow showers';
  if (code === 95) return 'Thunderstorm';
  if (code === 96 || code === 99) return 'Hail storm';
  return 'Unknown';
}

export async function loadCachedWeather(db: SQLiteDatabase): Promise<Weather | null> {
  try {
    const raw = await getSetting(db, CACHE_KEY);
    return raw ? (JSON.parse(raw) as Weather) : null;
  } catch {
    return null;
  }
}

function isFresh(w: Weather | null): boolean {
  return w != null && Date.now() - Date.parse(w.fetchedAt) < CACHE_TTL_MS;
}

async function currentCoords(): Promise<{ latitude: number; longitude: number }> {
  // Última posição conhecida é instantânea; só pede fix novo se não houver.
  const last = await Location.getLastKnownPositionAsync({ maxAge: 15 * 60 * 1000 });
  const pos =
    last ??
    (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }));
  return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
}

async function placeName(c: { latitude: number; longitude: number }): Promise<string | null> {
  try {
    const [a] = await Location.reverseGeocodeAsync(c);
    return a?.district ?? a?.city ?? a?.subregion ?? a?.region ?? null;
  } catch {
    return null;
  }
}

async function fetchOpenMeteo(c: { latitude: number; longitude: number }) {
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${c.latitude.toFixed(4)}&longitude=${c.longitude.toFixed(4)}` +
    '&current=temperature_2m,weather_code,is_day&timezone=auto';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`open-meteo ${res.status}`);
  const json = (await res.json()) as {
    current: { temperature_2m: number; weather_code: number; is_day: number };
  };
  return json.current;
}

// Fluxo completo: permissão → posição → clima (+ nome do lugar) → cache.
export async function refreshWeather(
  db: SQLiteDatabase,
  opts: { force?: boolean } = {},
): Promise<WeatherState> {
  const cached = await loadCachedWeather(db);
  if (!opts.force && isFresh(cached)) return { status: 'ok', weather: cached! };

  const perm = await Location.requestForegroundPermissionsAsync();
  if (!perm.granted) return { status: 'denied', weather: cached };

  try {
    const coords = await currentCoords();
    const [cur, place] = await Promise.all([fetchOpenMeteo(coords), placeName(coords)]);
    const weather: Weather = {
      temp: Math.round(cur.temperature_2m),
      condition: describe(cur.weather_code, cur.is_day === 1),
      place,
      fetchedAt: new Date().toISOString(),
    };
    await setSetting(db, CACHE_KEY, JSON.stringify(weather));
    return { status: 'ok', weather };
  } catch {
    return { status: 'error', weather: cached };
  }
}
