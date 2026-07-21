import { Pressable, StyleSheet, Text, View } from 'react-native';

import { dateKey } from '../mock';
import { colors, type } from '../theme';

const WEEKDAY = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

type Props = {
  days: Date[];
  selectedKey: string;
  todayKey: string;
  eventDays: Set<string>; // dias que têm eventos
  onSelect: (day: Date) => void;
};

// Tira horizontal de 7 dias. Dia selecionado em accent; um ponto discreto
// marca dias com evento. Nada de bordas ou fundos.
export function WeekStrip({ days, selectedKey, todayKey, eventDays, onSelect }: Props) {
  return (
    <View style={styles.strip}>
      {days.map((day) => {
        const key = dateKey(day);
        const selected = key === selectedKey;
        const isToday = key === todayKey;
        const hasEvents = eventDays.has(key);
        return (
          <Pressable
            key={key}
            onPress={() => onSelect(day)}
            style={styles.cell}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text style={[styles.weekday, selected && styles.weekdaySelected]}>
              {WEEKDAY[day.getDay()]}
            </Text>
            <Text
              style={[
                styles.day,
                isToday && styles.dayToday,
                selected && styles.daySelected,
              ]}
            >
              {day.getDate()}
            </Text>
            <View
              style={[
                styles.dot,
                hasEvents && !selected && styles.dotVisible,
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: 9,
    paddingVertical: 6,
  },
  weekday: {
    fontSize: type.overline,
    letterSpacing: 1,
    color: colors.textFaint,
  },
  weekdaySelected: {
    color: colors.accent,
  },
  day: {
    fontSize: type.label,
    color: colors.textMuted,
  },
  dayToday: {
    color: colors.text,
  },
  daySelected: {
    color: colors.accent,
    fontWeight: '700',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  dotVisible: {
    backgroundColor: colors.textFaint,
  },
});
