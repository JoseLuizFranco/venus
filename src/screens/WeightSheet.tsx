import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Field } from '../components/Field';
import { Sheet } from '../components/Sheet';
import { TextButton } from '../components/TextButton';
import { useDb } from '../db';
import { deleteWeight, listWeights, upsertWeight, type WeightEntry } from '../db/weights';
import { dateKey, isValidKey } from '../dates';
import { colors, type } from '../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  today: Date;
  onChanged: () => Promise<void>;
};

// Folha "Peso": registra o peso do dia (um por data) e lista o histórico
// com a variação em relação ao registro anterior.
export function WeightSheet({ visible, onClose, today, onChanged }: Props) {
  const db = useDb();
  const [kg, setKg] = useState('');
  const [date, setDate] = useState(dateKey(today));
  const [entries, setEntries] = useState<WeightEntry[]>([]);

  const load = useCallback(async () => setEntries(await listWeights(db, 60)), [db]);

  useEffect(() => {
    if (visible) {
      setDate(dateKey(today));
      load();
    }
  }, [visible, today, load]);

  const kgNum = Number(kg.replace(',', '.'));
  const valid = kg.trim() !== '' && Number.isFinite(kgNum) && kgNum > 0 && isValidKey(date.trim());

  const changed = async () => {
    await onChanged();
    await load();
  };

  const save = async () => {
    if (!valid) return;
    await upsertWeight(db, date.trim(), Math.round(kgNum * 10) / 10);
    setKg('');
    await changed();
  };

  return (
    <Sheet visible={visible} title="WEIGHT" onClose={onClose}>
      <View style={styles.row}>
        <View style={styles.col}>
          <Field label="KG" value={kg} onChangeText={setKg} keyboardType="decimal-pad"
            placeholder="72.5" autoFocus onSubmitEditing={save} returnKeyType="done" />
        </View>
        <View style={styles.col}>
          <Field label="DATE" value={date} onChangeText={setDate} hint="YYYY-MM-DD"
            keyboardType="numbers-and-punctuation" />
        </View>
      </View>
      <TextButton label="SAVE" onPress={save} disabled={!valid} />

      <View style={styles.list}>
        <Text style={styles.overline}>HISTORY</Text>
        {entries.length === 0 ? <Text style={styles.empty}>No entries yet.</Text> : null}
        {entries.map((e, i) => {
          const prev = entries[i + 1];
          const delta = prev ? Math.round((e.kg - prev.kg) * 10) / 10 : null;
          return (
            <View key={e.id} style={styles.entry}>
              <Text style={styles.date}>{e.date}</Text>
              <Text style={styles.kg}>{e.kg.toFixed(1)}</Text>
              <Text style={[styles.delta, delta != null && delta < 0 && styles.deltaDown]}>
                {delta == null ? '' : delta === 0 ? '±0' : `${delta > 0 ? '+' : ''}${delta}`}
              </Text>
              <Pressable
                onPress={async () => {
                  await deleteWeight(db, e.id);
                  await changed();
                }}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${e.date}`}
              >
                <Text style={styles.delete}>✕</Text>
              </Pressable>
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
  empty: {
    fontSize: type.label,
    color: colors.done,
    paddingVertical: 13,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
  },
  date: {
    width: 96,
    fontSize: type.caption,
    letterSpacing: 1,
    color: colors.textFaint,
  },
  kg: {
    flex: 1,
    fontSize: type.label,
    color: colors.text,
  },
  delta: {
    width: 48,
    textAlign: 'right',
    fontSize: type.caption,
    color: colors.textFaint,
  },
  deltaDown: {
    color: colors.accent,
  },
  delete: {
    fontSize: 15,
    color: colors.textFaint,
    padding: 4,
  },
});
