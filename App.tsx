import { useMemo, useState } from 'react';
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
import { QuickAccess, type Tile } from './src/components/QuickAccess';
import { ReflectionBlock } from './src/components/ReflectionBlock';
import { WeekStrip } from './src/components/WeekStrip';
import { dateKey, MONTHS, weekDays, WEEKDAY_LONG } from './src/dates';
import { DbProvider, useDb } from './src/db';
import { toggleEventDone } from './src/db/events';
import { toggleWorkoutDone } from './src/db/workouts';
import { useHomeData } from './src/hooks/useHomeData';
import { useWeather } from './src/hooks/useWeather';
import { AgendaSheet } from './src/screens/AgendaSheet';
import { GymSheet } from './src/screens/GymSheet';
import { ReflectionSheet } from './src/screens/ReflectionSheet';
import { WeightSheet } from './src/screens/WeightSheet';
import { colors, space, type } from './src/theme';

type SheetKey = 'gym' | 'agenda' | 'weight' | 'reflection' | null;

export default function App() {
  return (
    <DbProvider>
      <Home />
    </DbProvider>
  );
}

function Home() {
  const db = useDb();
  const today = useMemo(() => new Date(), []);
  const todayKey = dateKey(today);
  const days = useMemo(() => weekDays(today), [today]);

  const data = useHomeData(today);
  const weather = useWeather();
  const [selectedKey, setSelectedKey] = useState(todayKey);
  const [sheet, setSheet] = useState<SheetKey>(null);

  const selectedDate = useMemo(
    () => days.find((d) => dateKey(d) === selectedKey) ?? today,
    [days, selectedKey, today],
  );

  const eventDays = useMemo(
    () => new Set(Object.keys(data.events).filter((k) => data.events[k].length > 0)),
    [data.events],
  );

  const dayEvents = data.events[selectedKey] ?? [];
  const todayEvents = data.events[todayKey] ?? [];
  const doneWorkouts = data.workouts.filter((w) => w.doneOn != null).length;
  const weekEvents = Object.values(data.events).reduce((n, l) => n + l.length, 0);

  const selectedLabel =
    selectedKey === todayKey
      ? 'TODAY'
      : `${WEEKDAY_LONG[selectedDate.getDay()].toUpperCase()} ${selectedDate.getDate()}`;

  // Widgets de acesso rápido: valor = estado atual, toque = abre a folha.
  const tiles: Tile[] = [
    {
      key: 'gym',
      label: 'ACADEMIA',
      value: `${doneWorkouts}/${data.workouts.length}`,
      caption: 'this week',
      onPress: () => setSheet('gym'),
    },
    {
      key: 'agenda',
      label: 'AGENDA',
      value: String(todayEvents.length),
      caption: todayEvents.length === 1 ? 'today' : `today · ${weekEvents} this week`,
      onPress: () => setSheet('agenda'),
    },
    {
      key: 'weight',
      label: 'WEIGHT',
      value: data.weight ? `${data.weight.kg.toFixed(1)}` : '—',
      caption: data.weight ? `kg · ${data.weight.date}` : 'log today',
      onPress: () => setSheet('weight'),
    },
    {
      key: 'reflection',
      label: 'TOGETHER',
      value: data.daysTogether != null ? String(data.daysTogether) : '—',
      caption: 'days',
      onPress: () => setSheet('reflection'),
    },
  ];

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
          <Text style={styles.temp}>
            {weather.weather ? `${weather.weather.temp}°` : '—'}
          </Text>
          <Text style={styles.condition}>
            {weather.weather
              ? weather.weather.condition
              : weather.status === 'denied'
                ? 'Location off'
                : weather.status === 'error'
                  ? 'Weather unavailable'
                  : 'Loading weather…'}
          </Text>
          {weather.weather?.place ? (
            <Text style={styles.place}>{weather.weather.place.toUpperCase()}</Text>
          ) : null}
        </View>

        <View style={styles.divider} />

        {/* Acesso rápido — widgets */}
        <View style={styles.section}>
          <Text style={styles.overline}>QUICK ACCESS</Text>
          <QuickAccess tiles={tiles} />
        </View>

        <View style={styles.divider} />

        {/* Academia — marcar os treinos da semana */}
        <View style={styles.section}>
          <Text style={styles.overline}>ACADEMIA</Text>
          {data.workouts.map((w) => (
            <CheckRow
              key={w.id}
              done={w.doneOn != null}
              label={w.name}
              onToggle={async () => {
                await toggleWorkoutDone(db, w.id, today);
                await data.refresh();
              }}
            />
          ))}
          {data.loaded && data.workouts.length === 0 ? (
            <Text style={styles.empty}>No workouts yet.</Text>
          ) : null}
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
                meta={e.time ?? undefined}
                label={e.title}
                onToggle={async () => {
                  await toggleEventDone(db, e.id);
                  await data.refresh();
                }}
              />
            ))
          ) : (
            <Text style={styles.empty}>Nothing planned.</Text>
          )}
        </View>

        <View style={styles.divider} />

        {/* Reflection — widget 2 */}
        {data.reflection ? (
          <ReflectionBlock
            hanzi={data.reflection.hanzi}
            pinyin={data.reflection.pinyin}
            meaning={data.reflection.meaning}
            quote={data.reflection.quote}
            daysTogether={data.daysTogether ?? 0}
          />
        ) : null}
      </ScrollView>

      <GymSheet
        visible={sheet === 'gym'}
        onClose={() => setSheet(null)}
        today={today}
        workouts={data.workouts}
        onChanged={data.refresh}
      />
      <AgendaSheet
        visible={sheet === 'agenda'}
        onClose={() => setSheet(null)}
        today={today}
        initialDate={selectedKey}
        onChanged={data.refresh}
      />
      <WeightSheet
        visible={sheet === 'weight'}
        onClose={() => setSheet(null)}
        today={today}
        onChanged={data.refresh}
      />
      <ReflectionSheet
        visible={sheet === 'reflection'}
        onClose={() => setSheet(null)}
        reflection={data.reflection}
        anniversary={data.anniversary}
        onChanged={data.refresh}
      />
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
  place: {
    fontSize: type.overline,
    letterSpacing: 3,
    color: colors.textFaint,
    marginTop: 6,
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
