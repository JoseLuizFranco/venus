import type { SQLiteDatabase } from 'expo-sqlite';

// Dados iniciais gravados uma única vez, na primeira abertura (quando o banco
// ainda está vazio). Depois disso tudo é editado pelo app e vive no SQLite.

type SeedWorkout = {
  name: string;
  exercises: { name: string; sets: number; reps: string; weight?: number }[];
};

const WORKOUTS: SeedWorkout[] = [
  {
    name: 'Push · Chest & Triceps',
    exercises: [
      { name: 'Bench press', sets: 4, reps: '8', weight: 60 },
      { name: 'Incline dumbbell press', sets: 3, reps: '10', weight: 22 },
      { name: 'Cable fly', sets: 3, reps: '12' },
      { name: 'Triceps pushdown', sets: 3, reps: '12' },
    ],
  },
  {
    name: 'Pull · Back & Biceps',
    exercises: [
      { name: 'Deadlift', sets: 4, reps: '5', weight: 100 },
      { name: 'Lat pulldown', sets: 3, reps: '10' },
      { name: 'Seated row', sets: 3, reps: '10' },
      { name: 'Barbell curl', sets: 3, reps: '12', weight: 25 },
    ],
  },
  {
    name: 'Legs · Quads & Glutes',
    exercises: [
      { name: 'Squat', sets: 4, reps: '6', weight: 80 },
      { name: 'Leg press', sets: 3, reps: '12' },
      { name: 'Romanian deadlift', sets: 3, reps: '10', weight: 60 },
      { name: 'Calf raise', sets: 4, reps: '15' },
    ],
  },
  {
    name: 'Cardio · 20 min',
    exercises: [{ name: 'Treadmill / bike', sets: 1, reps: '20 min' }],
  },
];

const REFLECTION = {
  hanzi: '坚持',
  pinyin: 'Jiānchí',
  meaning: 'Perseverance',
  quote: 'No risk,\nno story.',
};

// Data de referência do contador "♡ N days" (editável no widget Reflection).
const ANNIVERSARY_DATE = '2024-10-01';

export async function seedIfEmpty(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ n: number }>(
    'SELECT COUNT(*) AS n FROM workouts',
  );
  if ((row?.n ?? 0) > 0) return;

  await db.withTransactionAsync(async () => {
    for (let wi = 0; wi < WORKOUTS.length; wi++) {
      const w = WORKOUTS[wi];
      const res = await db.runAsync(
        'INSERT INTO workouts (name, position) VALUES (?, ?)',
        w.name,
        wi,
      );
      for (let ei = 0; ei < w.exercises.length; ei++) {
        const e = w.exercises[ei];
        await db.runAsync(
          'INSERT INTO exercises (workout_id, name, sets, reps, weight_kg, position) VALUES (?, ?, ?, ?, ?, ?)',
          res.lastInsertRowId,
          e.name,
          e.sets,
          e.reps,
          e.weight ?? null,
          ei,
        );
      }
    }

    await db.runAsync(
      'INSERT INTO reflections (hanzi, pinyin, meaning, quote, active) VALUES (?, ?, ?, ?, 1)',
      REFLECTION.hanzi,
      REFLECTION.pinyin,
      REFLECTION.meaning,
      REFLECTION.quote,
    );

    await db.runAsync(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      'anniversary_date',
      ANNIVERSARY_DATE,
    );
  });
}
