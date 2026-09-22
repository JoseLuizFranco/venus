import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { useDb } from '../db';
import { loadCachedWeather, refreshWeather, type WeatherState } from '../weather';

// Mostra o cache imediatamente, atualiza em background e de novo sempre que
// o app volta para o primeiro plano (o cache tem validade de 30 min).
export function useWeather(): WeatherState & { refresh: () => Promise<void> } {
  const db = useDb();
  const [state, setState] = useState<WeatherState>({ status: 'loading', weather: null });

  const refresh = useCallback(async () => {
    setState(await refreshWeather(db));
  }, [db]);

  useEffect(() => {
    let alive = true;
    loadCachedWeather(db).then((w) => {
      if (alive && w) setState({ status: 'loading', weather: w });
      return refresh();
    });
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') refresh();
    });
    return () => {
      alive = false;
      sub.remove();
    };
  }, [db, refresh]);

  return { ...state, refresh };
}
