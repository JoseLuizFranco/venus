import { useCallback, useEffect, useMemo, useState } from 'react';

import { useDb } from '../db';
import { listEventsBetween, type EventsByDate } from '../db/events';
import {
  ANNIVERSARY_KEY,
  getActiveReflection,
  getSetting,
  type Reflection,
} from '../db/reflection';
import { latestWeight, type WeightEntry } from '../db/weights';
import { listWorkouts, type Workout } from '../db/workouts';
import { addDays, dateKey, daysBetween, parseKey, startOfWeek } from '../dates';

export type HomeData = {
  workouts: Workout[];
  events: EventsByDate; // semana atual, por dia
  weight: WeightEntry | null;
  reflection: Reflection | null;
  anniversary: string | null; // YYYY-MM-DD
  daysTogether: number | null;
  loaded: boolean;
  refresh: () => Promise<void>;
};

// Lê tudo que a home mostra numa única passada e expõe `refresh()` para as
// telas de edição chamarem depois de gravar.
export function useHomeData(today: Date): HomeData {
  const db = useDb();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [events, setEvents] = useState<EventsByDate>({});
  const [weight, setWeight] = useState<WeightEntry | null>(null);
  const [reflection, setReflection] = useState<Reflection | null>(null);
  const [anniversary, setAnniversary] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const [weekFrom, weekTo] = useMemo(() => {
    const monday = startOfWeek(today);
    return [dateKey(monday), dateKey(addDays(monday, 6))];
  }, [today]);

  const refresh = useCallback(async () => {
    const [w, e, wt, r, a] = await Promise.all([
      listWorkouts(db, today),
      listEventsBetween(db, weekFrom, weekTo),
      latestWeight(db),
      getActiveReflection(db),
      getSetting(db, ANNIVERSARY_KEY),
    ]);
    setWorkouts(w);
    setEvents(e);
    setWeight(wt);
    setReflection(r);
    setAnniversary(a);
    setLoaded(true);
  }, [db, today, weekFrom, weekTo]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const daysTogether = useMemo(
    () => (anniversary ? daysBetween(parseKey(anniversary), today) : null),
    [anniversary, today],
  );

  return { workouts, events, weight, reflection, anniversary, daysTogether, loaded, refresh };
}
