import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Field } from '../components/Field';
import { Sheet } from '../components/Sheet';
import { TextButton } from '../components/TextButton';
import { useDb } from '../db';
import {
  addExercise,
  addWorkout,
  archiveWorkout,
  deleteExercise,
  listExercises,
  recentLogs,
  toggleWorkoutDone,
  updateExercise,
  type Exercise,
  type ExerciseInput,
  type Workout,
  type WorkoutLog,
} from '../db/workouts';
import { colors, type } from '../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  today: Date;
  workouts: Workout[];
  onChanged: () => Promise<void>;
};

// Folha "Academia": treinos do split, exercícios de cada um (séries × reps ×
// carga), marcação da semana e histórico recente. Tudo gravado no SQLite.
export function GymSheet({ visible, onClose, today, workouts, onChanged }: Props) {
  const db = useDb();
  const [open, setOpen] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [logs, setLogs] = useState<WorkoutLog[]>([]);

  const loadLogs = useCallback(async () => setLogs(await recentLogs(db, 10)), [db]);

  useEffect(() => {
    if (visible) loadLogs();
  }, [visible, loadLogs]);

  const changed = async () => {
    await onChanged();
    await loadLogs();
  };

  const create = async () => {
    if (!newName.trim()) return;
    const id = await addWorkout(db, newName);
    setNewName('');
    setOpen(id);
    await changed();
  };

  return (
    <Sheet visible={visible} title="ACADEMIA" onClose={onClose}>
      {workouts.map((w) => (
        <WorkoutRow
          key={w.id}
          workout={w}
          expanded={open === w.id}
          onToggleExpand={() => setOpen(open === w.id ? null : w.id)}
          onToggleDone={async () => {
            await toggleWorkoutDone(db, w.id, today);
            await changed();
          }}
          onArchive={async () => {
            await archiveWorkout(db, w.id);
            setOpen(null);
            await changed();
          }}
        />
      ))}

      <View style={styles.newWrap}>
        <Field
          label="NEW WORKOUT"
          placeholder="e.g. Shoulders · Delts"
          value={newName}
          onChangeText={setNewName}
          onSubmitEditing={create}
          returnKeyType="done"
        />
        <TextButton label="+ ADD WORKOUT" onPress={create} disabled={!newName.trim()} />
      </View>

      {logs.length > 0 ? (
        <View style={styles.history}>
          <Text style={styles.overline}>HISTORY</Text>
          {logs.map((l) => (
            <View key={l.id} style={styles.logRow}>
              <Text style={styles.logDate}>{l.date}</Text>
              <Text style={styles.logName}>{l.workoutName}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Sheet>
  );
}

type RowProps = {
  workout: Workout;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleDone: () => void;
  onArchive: () => void;
};

function WorkoutRow({ workout, expanded, onToggleExpand, onToggleDone, onArchive }: RowProps) {
  const db = useDb();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [editing, setEditing] = useState<number | 'new' | null>(null);

  const load = useCallback(
    async () => setExercises(await listExercises(db, workout.id)),
    [db, workout.id],
  );

  useEffect(() => {
    if (expanded) load();
  }, [expanded, load]);

  const done = workout.doneOn != null;

  return (
    <View style={styles.workout}>
      <View style={styles.workoutHead}>
        <Pressable onPress={onToggleDone} hitSlop={8} accessibilityRole="checkbox"
          accessibilityState={{ checked: done }}>
          <Text style={[styles.mark, done && styles.markDone]}>{done ? '✓' : '○'}</Text>
        </Pressable>
        <Pressable onPress={onToggleExpand} style={styles.workoutTitle} accessibilityRole="button">
          <Text style={[styles.name, done && styles.nameDone]}>{workout.name}</Text>
          <Text style={styles.sub}>
            {workout.exerciseCount} exercise{workout.exerciseCount === 1 ? '' : 's'}
            {done ? `  ·  done ${workout.doneOn}` : ''}
          </Text>
        </Pressable>
        <Text style={styles.chevron}>{expanded ? '–' : '+'}</Text>
      </View>

      {expanded ? (
        <View style={styles.exercises}>
          {exercises.map((e) =>
            editing === e.id ? (
              <ExerciseForm
                key={e.id}
                initial={e}
                onCancel={() => setEditing(null)}
                onSave={async (input) => {
                  await updateExercise(db, e.id, input);
                  setEditing(null);
                  await load();
                }}
                onDelete={async () => {
                  await deleteExercise(db, e.id);
                  setEditing(null);
                  await load();
                }}
              />
            ) : (
              <Pressable key={e.id} onPress={() => setEditing(e.id)} style={styles.exRow}>
                <Text style={styles.exName}>{e.name}</Text>
                <Text style={styles.exMeta}>
                  {e.sets} × {e.reps}
                  {e.weightKg != null ? `  ·  ${e.weightKg} kg` : ''}
                </Text>
              </Pressable>
            ),
          )}

          {editing === 'new' ? (
            <ExerciseForm
              onCancel={() => setEditing(null)}
              onSave={async (input) => {
                await addExercise(db, workout.id, input);
                setEditing(null);
                await load();
              }}
            />
          ) : (
            <View style={styles.actions}>
              <TextButton label="+ EXERCISE" onPress={() => setEditing('new')} />
              <TextButton label="ARCHIVE" muted onPress={onArchive} />
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

type FormProps = {
  initial?: Exercise;
  onSave: (input: ExerciseInput) => void;
  onCancel: () => void;
  onDelete?: () => void;
};

function ExerciseForm({ initial, onSave, onCancel, onDelete }: FormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [sets, setSets] = useState(String(initial?.sets ?? 3));
  const [reps, setReps] = useState(initial?.reps ?? '10');
  const [weight, setWeight] = useState(
    initial?.weightKg != null ? String(initial.weightKg) : '',
  );

  const setsNum = parseInt(sets, 10);
  const weightNum = weight.trim() === '' ? null : Number(weight.replace(',', '.'));
  const valid =
    name.trim().length > 0 &&
    Number.isInteger(setsNum) &&
    setsNum > 0 &&
    reps.trim().length > 0 &&
    (weightNum === null || (Number.isFinite(weightNum) && weightNum >= 0));

  return (
    <View style={styles.form}>
      <Field label="EXERCISE" value={name} onChangeText={setName} placeholder="Bench press" autoFocus />
      <View style={styles.formRow}>
        <View style={styles.formCol}>
          <Field label="SETS" value={sets} onChangeText={setSets} keyboardType="number-pad" />
        </View>
        <View style={styles.formCol}>
          <Field label="REPS" value={reps} onChangeText={setReps} placeholder="8-12" />
        </View>
        <View style={styles.formCol}>
          <Field label="KG" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="—" />
        </View>
      </View>
      <View style={styles.actions}>
        <TextButton
          label="SAVE"
          disabled={!valid}
          onPress={() => onSave({ name, sets: setsNum, reps, weightKg: weightNum })}
        />
        <TextButton label="CANCEL" muted onPress={onCancel} />
        {onDelete ? <TextButton label="DELETE" muted onPress={onDelete} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  workout: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
    paddingVertical: 6,
  },
  workoutHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingVertical: 10,
  },
  workoutTitle: {
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
  name: {
    fontSize: type.label,
    color: colors.text,
  },
  nameDone: {
    color: colors.done,
  },
  sub: {
    fontSize: type.caption,
    color: colors.textFaint,
  },
  chevron: {
    fontSize: type.label,
    color: colors.textFaint,
    width: 16,
    textAlign: 'center',
  },
  exercises: {
    paddingLeft: 37,
    paddingBottom: 6,
  },
  exRow: {
    paddingVertical: 9,
    gap: 2,
  },
  exName: {
    fontSize: type.label - 2,
    color: colors.textMuted,
  },
  exMeta: {
    fontSize: type.caption,
    color: colors.textFaint,
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: 'row',
    gap: 22,
  },
  form: {
    paddingTop: 10,
  },
  formRow: {
    flexDirection: 'row',
    gap: 14,
  },
  formCol: {
    flex: 1,
  },
  newWrap: {
    paddingTop: 28,
  },
  history: {
    paddingTop: 28,
  },
  overline: {
    fontSize: type.overline,
    letterSpacing: 3,
    color: colors.textFaint,
    marginBottom: 8,
  },
  logRow: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 8,
  },
  logDate: {
    fontSize: type.caption,
    color: colors.textFaint,
    letterSpacing: 1,
    width: 92,
  },
  logName: {
    flex: 1,
    fontSize: type.caption + 1,
    color: colors.textMuted,
  },
});
