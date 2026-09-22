import type { SQLiteDatabase } from 'expo-sqlite';

export type WeightEntry = {
  id: number;
  date: string; // YYYY-MM-DD
  kg: number;
};

export async function listWeights(db: SQLiteDatabase, limit = 60): Promise<WeightEntry[]> {
  return db.getAllAsync<WeightEntry>(
    'SELECT id, date, kg FROM weights ORDER BY date DESC LIMIT ?',
    limit,
  );
}

export async function latestWeight(db: SQLiteDatabase): Promise<WeightEntry | null> {
  return db.getFirstAsync<WeightEntry>(
    'SELECT id, date, kg FROM weights ORDER BY date DESC LIMIT 1',
  );
}

// Um registro por dia: gravar de novo no mesmo dia substitui o valor.
export async function upsertWeight(db: SQLiteDatabase, date: string, kg: number) {
  await db.runAsync(
    `INSERT INTO weights (date, kg) VALUES (?, ?)
     ON CONFLICT(date) DO UPDATE SET kg = excluded.kg`,
    date,
    kg,
  );
}

export async function deleteWeight(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM weights WHERE id = ?', id);
}
