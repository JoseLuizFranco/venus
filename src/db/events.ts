import type { SQLiteDatabase } from 'expo-sqlite';

export type CalendarEvent = {
  id: number;
  date: string; // YYYY-MM-DD
  time: string | null; // "09:00"
  title: string;
  done: boolean;
};

export type EventsByDate = Record<string, CalendarEvent[]>;

type Row = { id: number; date: string; time: string | null; title: string; done: number };

const fromRow = (r: Row): CalendarEvent => ({
  id: r.id,
  date: r.date,
  time: r.time,
  title: r.title,
  done: r.done === 1,
});

// Eventos num intervalo fechado de datas, agrupados por dia.
export async function listEventsBetween(
  db: SQLiteDatabase,
  from: string,
  to: string,
): Promise<EventsByDate> {
  const rows = await db.getAllAsync<Row>(
    `SELECT id, date, time, title, done FROM events
      WHERE date BETWEEN ? AND ?
      ORDER BY date, time IS NULL, time, id`,
    from,
    to,
  );
  const out: EventsByDate = {};
  for (const r of rows) (out[r.date] ??= []).push(fromRow(r));
  return out;
}

// Próximos eventos a partir de uma data (inclusive), para o widget.
export async function listUpcoming(
  db: SQLiteDatabase,
  from: string,
  limit = 20,
): Promise<CalendarEvent[]> {
  const rows = await db.getAllAsync<Row>(
    `SELECT id, date, time, title, done FROM events
      WHERE date >= ?
      ORDER BY date, time IS NULL, time, id
      LIMIT ?`,
    from,
    limit,
  );
  return rows.map(fromRow);
}

export async function addEvent(
  db: SQLiteDatabase,
  input: { date: string; time: string | null; title: string },
): Promise<number> {
  const res = await db.runAsync(
    'INSERT INTO events (date, time, title) VALUES (?, ?, ?)',
    input.date,
    input.time,
    input.title.trim(),
  );
  return res.lastInsertRowId;
}

export async function toggleEventDone(db: SQLiteDatabase, id: number) {
  await db.runAsync('UPDATE events SET done = 1 - done WHERE id = ?', id);
}

export async function deleteEvent(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM events WHERE id = ?', id);
}
