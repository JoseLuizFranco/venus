import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Field } from '../components/Field';
import { Sheet } from '../components/Sheet';
import { TextButton } from '../components/TextButton';
import { useDb } from '../db';
import {
  addEvent,
  deleteEvent,
  listUpcoming,
  toggleEventDone,
  type CalendarEvent,
} from '../db/events';
import { dateKey, isValidKey, isValidTime, parseKey, WEEKDAY_LONG } from '../dates';
import { colors, type } from '../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  today: Date;
  initialDate: string; // dia selecionado na home
  onChanged: () => Promise<void>;
};

// Folha "Agenda": novo evento (data, hora opcional, título) e lista dos
// próximos, com marcar/apagar.
export function AgendaSheet({ visible, onClose, today, initialDate, onChanged }: Props) {
  const db = useDb();
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState('');
  const [title, setTitle] = useState('');
  const [upcoming, setUpcoming] = useState<CalendarEvent[]>([]);

  const load = useCallback(
    async () => setUpcoming(await listUpcoming(db, dateKey(today), 30)),
    [db, today],
  );

  useEffect(() => {
    if (visible) {
      setDate(initialDate);
      load();
    }
  }, [visible, initialDate, load]);

  const timeOk = time.trim() === '' || isValidTime(time.trim());
  const valid = isValidKey(date.trim()) && timeOk && title.trim().length > 0;

  const changed = async () => {
    await onChanged();
    await load();
  };

  const create = async () => {
    if (!valid) return;
    await addEvent(db, {
      date: date.trim(),
      time: time.trim() === '' ? null : time.trim(),
      title,
    });
    setTitle('');
    setTime('');
    await changed();
  };

  let lastDate = '';

  return (
    <Sheet visible={visible} title="AGENDA" onClose={onClose}>
      <Field label="TITLE" value={title} onChangeText={setTitle} placeholder="Dentist" autoFocus />
      <View style={styles.row}>
        <View style={styles.col}>
          <Field label="DATE" value={date} onChangeText={setDate} hint="YYYY-MM-DD"
            keyboardType="numbers-and-punctuation" autoCapitalize="none" />
        </View>
        <View style={styles.col}>
          <Field label="TIME" value={time} onChangeText={setTime} hint="HH:MM · optional"
            keyboardType="numbers-and-punctuation" placeholder="—" />
        </View>
      </View>
      <TextButton label="+ ADD EVENT" onPress={create} disabled={!valid} />

      <View style={styles.list}>
        <Text style={styles.overline}>UPCOMING</Text>
        {upcoming.length === 0 ? (
          <Text style={styles.empty}>Nothing planned.</Text>
        ) : null}
        {upcoming.map((e) => {
          const showDate = e.date !== lastDate;
          lastDate = e.date;
          const d = parseKey(e.date);
          return (
            <View key={e.id}>
              {showDate ? (
                <Text style={styles.dateLabel}>
                  {e.date === dateKey(today)
                    ? 'TODAY'
                    : `${WEEKDAY_LONG[d.getDay()].toUpperCase()} ${d.getDate()}`}
                </Text>
              ) : null}
              <View style={styles.eventRow}>
                <Pressable
                  onPress={async () => {
                    await toggleEventDone(db, e.id);
                    await changed();
                  }}
                  hitSlop={8}
                  style={styles.eventMain}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: e.done }}
                >
                  <Text style={[styles.mark, e.done && styles.markDone]}>{e.done ? '✓' : '○'}</Text>
                  <View style={styles.eventBody}>
                    {e.time ? <Text style={styles.meta}>{e.time}</Text> : null}
                    <Text style={[styles.label, e.done && styles.labelDone]}>{e.title}</Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    await deleteEvent(db, e.id);
                    await changed();
                  }}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${e.title}`}
                >
                  <Text style={styles.delete}>✕</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 14,
  },
  col: {
    flex: 1,
  },
  list: {
    paddingTop: 28,
  },
  overline: {
    fontSize: type.overline,
    letterSpacing: 3,
    color: colors.textFaint,
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: type.overline,
    letterSpacing: 3,
    color: colors.textFaint,
    marginTop: 18,
    marginBottom: 4,
  },
  empty: {
    fontSize: type.label,
    color: colors.done,
    paddingVertical: 13,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  eventMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingVertical: 11,
  },
  eventBody: {
    flex: 1,
    gap: 3,
  },
  mark: {
    width: 22,
    fontSize: 19,
    color: colors.textFaint,
    textAlign: 'center',
  },
  markDone: {
    color: colors.accent,
  },
  meta: {
    fontSize: type.caption,
    letterSpacing: 1,
    color: colors.textFaint,
  },
  label: {
    fontSize: type.label,
    color: colors.text,
  },
  labelDone: {
    color: colors.done,
  },
  delete: {
    fontSize: 15,
    color: colors.textFaint,
    padding: 4,
  },
});
