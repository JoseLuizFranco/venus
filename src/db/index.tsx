import { SQLiteProvider, useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import type { ReactNode } from 'react';

import { DB_NAME, MIGRATIONS } from './schema';
import { seedIfEmpty } from './seed';

export { useSQLiteContext as useDb };
export type { SQLiteDatabase };

// Aplica as migrações pendentes (controladas por PRAGMA user_version) e,
// na primeira abertura, grava os dados iniciais.
export async function initDb(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;

  for (; version < MIGRATIONS.length; version++) {
    const sql = MIGRATIONS[version];
    await db.withTransactionAsync(async () => {
      await db.execAsync(sql);
      await db.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
  }

  await seedIfEmpty(db);
}

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
};

// Abre o banco, roda initDb e só então renderiza os filhos.
export function DbProvider({ children, onError }: Props) {
  return (
    <SQLiteProvider databaseName={DB_NAME} onInit={initDb} onError={onError}>
      {children}
    </SQLiteProvider>
  );
}
