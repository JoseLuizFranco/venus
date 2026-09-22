import type { SQLiteDatabase } from 'expo-sqlite';

export type Reflection = {
  id: number;
  hanzi: string;
  pinyin: string;
  meaning: string;
  quote: string;
};

export type ReflectionInput = Omit<Reflection, 'id'>;

export async function getActiveReflection(db: SQLiteDatabase): Promise<Reflection | null> {
  return db.getFirstAsync<Reflection>(
    'SELECT id, hanzi, pinyin, meaning, quote FROM reflections WHERE active = 1 ORDER BY id DESC LIMIT 1',
  );
}

// Guarda a versão anterior no histórico e ativa a nova.
export async function setReflection(db: SQLiteDatabase, input: ReflectionInput) {
  await db.withTransactionAsync(async () => {
    await db.runAsync('UPDATE reflections SET active = 0 WHERE active = 1');
    await db.runAsync(
      'INSERT INTO reflections (hanzi, pinyin, meaning, quote, active) VALUES (?, ?, ?, ?, 1)',
      input.hanzi.trim(),
      input.pinyin.trim(),
      input.meaning.trim(),
      input.quote.trim(),
    );
  });
}

export async function getSetting(db: SQLiteDatabase, key: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    key,
  );
  return row?.value ?? null;
}

export async function setSetting(db: SQLiteDatabase, key: string, value: string) {
  await db.runAsync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    value,
  );
}

export const ANNIVERSARY_KEY = 'anniversary_date';
