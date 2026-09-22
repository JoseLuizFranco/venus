// Esquema do banco local (SQLite via expo-sqlite).
//
// Cada entrada em MIGRATIONS é aplicada uma vez, em ordem; a versão atual fica
// em `PRAGMA user_version`. Para evoluir o esquema, acrescente uma nova entrada
// ao final — nunca edite uma já publicada.
//
// Tabelas:
//   workouts      treinos do split semanal (Push, Pull, Legs…)
//   exercises     exercícios de cada treino (séries × reps, carga)
//   workout_logs  uma linha por treino concluído em uma data
//   events        compromissos do calendário
//   weights       histórico de peso corporal
//   reflections   hanzi/pinyin/quote exibidos no widget Reflection (1 ativo)
//   settings      chave/valor (ex.: anniversary_date)

export const DB_NAME = 'venus.db';

export const MIGRATIONS: string[] = [
  // v1 — esquema inicial
  `
  CREATE TABLE IF NOT EXISTS workouts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    position   INTEGER NOT NULL DEFAULT 0,
    archived   INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS exercises (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    name       TEXT    NOT NULL,
    sets       INTEGER NOT NULL DEFAULT 3,
    reps       TEXT    NOT NULL DEFAULT '10',
    weight_kg  REAL,
    position   INTEGER NOT NULL DEFAULT 0
  );
  CREATE INDEX IF NOT EXISTS idx_exercises_workout ON exercises(workout_id, position);

  CREATE TABLE IF NOT EXISTS workout_logs (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    date       TEXT    NOT NULL,
    notes      TEXT,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE (workout_id, date)
  );
  CREATE INDEX IF NOT EXISTS idx_workout_logs_date ON workout_logs(date);

  CREATE TABLE IF NOT EXISTS events (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    date       TEXT    NOT NULL,
    time       TEXT,
    title      TEXT    NOT NULL,
    done       INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_events_date ON events(date, time);

  CREATE TABLE IF NOT EXISTS weights (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    date       TEXT    NOT NULL UNIQUE,
    kg         REAL    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reflections (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    hanzi      TEXT    NOT NULL,
    pinyin     TEXT    NOT NULL,
    meaning    TEXT    NOT NULL,
    quote      TEXT    NOT NULL,
    active     INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  `,
];
