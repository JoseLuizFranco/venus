import { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

import { CheckRow } from './src/components/CheckRow';
import { ReflectionBlock } from './src/components/ReflectionBlock';
import { WeekStrip } from './src/components/WeekStrip';
import {
  buildMockEvents,
  CalendarEvent,
  dateKey,
  EventsByDate,
  initialWorkouts,
  reflection,
  weather,
  weekDays,
  Workout,
} from './src/mock';
import { loadDoneIds, saveDoneIds } from './src/storage';
import { colors, space, type } from './src/theme';

const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

const WEEKDAY_LONG = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

function collectDoneIds(workouts: Workout[], events: EventsByDate): string[] {
  const ids: string[] = [];
  workouts.forEach((w) => w.done && ids.push(w.id));
  Object.values(events).forEach((list) =>
    list.forEach((e) => e.done && ids.push(e.id)),
  );
  return ids;
}

function applyDone(events: EventsByDate, done: Set<string>): EventsByDate {
  const out: EventsByDate = {};
  for (const [key, list] of Object.entries(events)) {
    out[key] = list.map((e: CalendarEvent) => ({ ...e, done: done.has(e.id) }));
  }
  return out;
}

export default function App() {
  const today = useMemo(() => new Date(), []);
  const todayKey = dateKey(today);
  const days = useMemo(() => weekDays(today), [today]);

  const [workouts, setWorkouts] = useState(initialWorkouts);
  const [events, setEvents] = useState(() => buildMockEvents(today));
  const [selectedKey, setSelectedKey] = useState(todayKey);
  const [hydrated, setHydrated] = useState(false);

  // Hidrata o estado de conclusão salvo (uma vez, na abertura).
  useEffect(() => {
    let alive = true;
    loadDoneIds().then((ids) => {
      if (!alive) return;
      if (ids != null) {
        const done = new Set(ids);
        setWorkouts((prev) => prev.map((w) => ({ ...w, done: done.has(w.id) })));
        setEvents((prev) => applyDone(prev, done));
      }
      setHydrated(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Persiste sempre que algo é marcado/desmarcado (após hidratar).
  useEffect(() => {
    if (!hydrated) return;
    saveDoneIds(collectDoneIds(workouts, events));
  }, [hydrated, workouts, events]);

  const selectedDate = useMemo(
    () => days.find((d) => dateKey(d) === selectedKey) ?? today,
    [days, selectedKey, today],
  );

  const eventDays = useMemo(
    () => new Set(Object.keys(events).filter((k) => events[k].length > 0)),
    [events],
  );

  const dayEvents = events[selectedKey] ?? [];

  const toggleWorkout = (id: string) =>
    setWorkouts((prev) =>
      prev.map((w) => (w.id === id ? { ...w, done: !w.done } : w)),
    );

  const toggleEvent = (id: string) =>
    setEvents((prev) => ({
      ...prev,
      [selectedKey]: (prev[selectedKey] ?? []).map((e) =>
        e.id === id ? { ...e, done: !e.done } : e,
      ),
    }));

  const selectedLabel =
    selectedKey === todayKey
      ? 'TODAY'
      : `${WEEKDAY_LONG[selectedDate.getDay()].toUpperCase()} ${selectedDate.getDate()}`;

  return (
    <SafeAreaView style={styles.safe}>
      <ExpoStatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header — data + clima, só tipografia */}
        <View style={styles.header}>
          <Text style={styles.date}>
            {today.getDate()} {MONTHS[today.getMonth()]}
          </Text>
          <Text style={styles.temp}>{weather.temp}°</Text>
          <Text style={styles.condition}>{weather.condition}</Text>
        </View>

        <View style={styles.divider} />

        {/* Academia — marcar os treinos */}
        <View style={styles.section}>
          <Text style={styles.overline}>ACADEMIA</Text>
          {workouts.map((w) => (
            <CheckRow
              key={w.id}
              done={w.done}
              label={w.name}
              onToggle={() => toggleWorkout(w.id)}
            />
          ))}
        </View>

        <View style={styles.divider} />

        {/* Calendário — eventos dia a dia */}
        <View style={styles.section}>
          <Text style={styles.overline}>CALENDÁRIO</Text>
          <WeekStrip
            days={days}
            selectedKey={selectedKey}
            todayKey={todayKey}
            eventDays={eventDays}
            onSelect={(d) => setSelectedKey(dateKey(d))}
          />

          <Text style={[styles.overline, styles.dayLabel]}>{selectedLabel}</Text>
          {dayEvents.length > 0 ? (
            dayEvents.map((e) => (
              <CheckRow
                key={e.id}
                done={e.done}
                meta={e.time}
                label={e.title}
                onToggle={() => toggleEvent(e.id)}
              />
            ))
          ) : (
            <Text style={styles.empty}>Nothing planned.</Text>
          )}
        </View>

        <View style={styles.divider} />

        {/* Reflection — widget 2 */}
        <ReflectionBlock
          hanzi={reflection.hanzi}
          pinyin={reflection.pinyin}
          meaning={reflection.meaning}
          quote={reflection.quote}
          daysTogether={reflection.daysTogether}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scroll: {
    paddingHorizontal: space.screen,
    paddingTop: space.section,
    paddingBottom: space.section * 2,
  },
  header: {
    gap: 4,
  },
  date: {
    fontSize: type.overline,
    letterSpacing: 3,
    color: colors.textFaint,
  },
  temp: {
    fontSize: type.hero,
    fontWeight: '200',
    color: colors.text,
    marginTop: 6,
  },
  condition: {
    fontSize: type.label,
    color: colors.textMuted,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginVertical: space.section,
  },
  section: {
    gap: 4,
  },
  overline: {
    fontSize: type.overline,
    letterSpacing: 3,
    color: colors.textFaint,
    marginBottom: 8,
  },
  dayLabel: {
    marginTop: space.section - 6,
  },
  empty: {
    fontSize: type.label,
    color: colors.done,
    paddingVertical: 13,
  },
});
