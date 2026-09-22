import type { SQLiteDatabase } from 'expo-sqlite';

import { dateKey, startOfWeek, addDays } from '../dates';

export type Workout = {
  id: number;
  name: string;
  position: number;
  exerciseCount: number;
  // Data (YYYY-MM-DD) em que foi concluído nesta semana, ou null.
  doneOn: string | null;
};

export type Exercise = {
  id: number;
  workoutId: number;
  name: string;
  sets: number;
  reps: string;
  weightKg: number | null;
  position: number;
};

export type WorkoutLog = {
  id: number;
  workoutId: number;
  workoutName: string;
  date: string;
  notes: string | null;
};

function weekRange(today: Date): [string, string] {
  const monday = startOfWeek(today);
  return [dateKey(monday), dateKey(addDays(monday, 6))];
}

// Treinos ativos + se já foram feitos na semana de `today`.
export async function listWorkouts(db: SQLiteDatabase, today: Date): Promise<Workout[]> {
  const [from, to] = weekRange(today);
  const rows = await db.getAllAsync<{
    id: number;
    name: string;
    position: number;
    exercise_count: number;
    done_on: string | null;
  }>(
    `SELECT w.id, w.name, w.position,
            (SELECT COUNT(*) FROM exercises e WHERE e.workout_id = w.id) AS exercise_count,
            (SELECT MAX(l.date) FROM workout_logs l
              WHERE l.workout_id = w.id AND l.date BETWEEN ? AND ?) AS done_on
       FROM workouts w
      WHERE w.archived = 0
      ORDER BY w.position, w.id`,
    from,
    to,
  );
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    position: r.position,
    exerciseCount: r.exercise_count,
    doneOn: r.done_on,
  }));
}

// Marca/desmarca o treino como feito na semana atual. Ao marcar, registra
// em `today`; ao desmarcar, apaga os logs da semana.
export async function toggleWorkoutDone(
  db: SQLiteDatabase,
  workoutId: number,
  today: Date,
): Promise<void> {
  const [from, to] = weekRange(today);
  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM workout_logs WHERE workout_id = ? AND date BETWEEN ? AND ? LIMIT 1',
    workoutId,
    from,
    to,
  );
  if (existing) {
    await db.runAsync(
      'DELETE FROM workout_logs WHERE workout_id = ? AND date BETWEEN ? AND ?',
      workoutId,
      from,
      to,
    );
  } else {
    await db.runAsync(
      'INSERT OR IGNORE INTO workout_logs (workout_id, date) VALUES (?, ?)',
      workoutId,
      dateKey(today),
    );
  }
}

export async function addWorkout(db: SQLiteDatabase, name: string): Promise<number> {
  const row = await db.getFirstAsync<{ p: number | null }>(
    'SELECT MAX(position) AS p FROM workouts',
  );
  const res = await db.runAsync(
    'INSERT INTO workouts (name, position) VALUES (?, ?)',
    name.trim(),
    (row?.p ?? -1) + 1,
  );
  return res.lastInsertRowId;
}

export async function renameWorkout(db: SQLiteDatabase, id: number, name: string) {
  await db.runAsync('UPDATE workouts SET name = ? WHERE id = ?', name.trim(), id);
}

// Arquiva em vez de apagar: o histórico de logs continua íntegro.
export async function archiveWorkout(db: SQLiteDatabase, id: number) {
  await db.runAsync('UPDATE workouts SET archived = 1 WHERE id = ?', id);
}

export async function listExercises(db: SQLiteDatabase, workoutId: number): Promise<Exercise[]> {
  const rows = await db.getAllAsync<{
    id: number;
    workout_id: number;
    name: string;
    sets: number;
    reps: string;
    weight_kg: number | null;
    position: number;
  }>(
    'SELECT * FROM exercises WHERE workout_id = ? ORDER BY position, id',
    workoutId,
  );
  return rows.map((r) => ({
    id: r.id,
    workoutId: r.workout_id,
    name: r.name,
    sets: r.sets,
    reps: r.reps,
    weightKg: r.weight_kg,
    position: r.position,
  }));
}

export type ExerciseInput = {
  name: string;
  sets: number;
  reps: string;
  weightKg: number | null;
};

export async function addExercise(
  db: SQLiteDatabase,
  workoutId: number,
  input: ExerciseInput,
): Promise<number> {
  const row = await db.getFirstAsync<{ p: number | null }>(
    'SELECT MAX(position) AS p FROM exercises WHERE workout_id = ?',
    workoutId,
  );
  const res = await db.runAsync(
    'INSERT INTO exercises (workout_id, name, sets, reps, weight_kg, position) VALUES (?, ?, ?, ?, ?, ?)',
    workoutId,
    input.name.trim(),
    input.sets,
    input.reps.trim(),
    input.weightKg,
    (row?.p ?? -1) + 1,
  );
  return res.lastInsertRowId;
}

export async function updateExercise(db: SQLiteDatabase, id: number, input: ExerciseInput) {
  await db.runAsync(
    'UPDATE exercises SET name = ?, sets = ?, reps = ?, weight_kg = ? WHERE id = ?',
    input.name.trim(),
    input.sets,
    input.reps.trim(),
    input.weightKg,
    id,
  );
}

export async function deleteExercise(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM exercises WHERE id = ?', id);
}

// Últimos treinos concluídos (histórico).
export async function recentLogs(db: SQLiteDatabase, limit = 30): Promise<WorkoutLog[]> {
  const rows = await db.getAllAsync<{
    id: number;
    workout_id: number;
    workout_name: string;
    date: string;
    notes: string | null;
  }>(
    `SELECT l.id, l.workout_id, w.name AS workout_name, l.date, l.notes
       FROM workout_logs l JOIN workouts w ON w.id = l.workout_id
      ORDER BY l.date DESC, l.id DESC
      LIMIT ?`,
    limit,
  );
  return rows.map((r) => ({
    id: r.id,
    workoutId: r.workout_id,
    workoutName: r.workout_name,
    date: r.date,
    notes: r.notes,
  }));
}
