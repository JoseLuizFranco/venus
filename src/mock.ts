// Dados mockados + tipos. Por ora tudo vive em memória; quando a API existir,
// estes tipos viram o contrato de resposta e os `initial*` saem daqui.

export type Workout = {
  id: string;
  name: string;
  done: boolean;
};

export type CalendarEvent = {
  id: string;
  time: string; // "09:00"
  title: string;
  done: boolean;
};

export type EventsByDate = Record<string, CalendarEvent[]>;

// ---- helpers de data (sem lib externa, sempre em horário local) ----

export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

// Segunda-feira da semana que contém `d`.
export function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const offset = (x.getDay() + 6) % 7; // 0 = segunda
  x.setDate(x.getDate() - offset);
  x.setHours(0, 0, 0, 0);
  return x;
}

// Os 7 dias (seg → dom) da semana que contém `d`.
export function weekDays(d: Date): Date[] {
  const monday = startOfWeek(d);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

// ---- academia: split semanal para ir marcando os treinos ----

export const initialWorkouts: Workout[] = [
  { id: 'w1', name: 'Push · Chest & Triceps', done: true },
  { id: 'w2', name: 'Pull · Back & Biceps', done: false },
  { id: 'w3', name: 'Legs · Quads & Glutes', done: false },
  { id: 'w4', name: 'Cardio · 20 min', done: false },
];

// ---- calendário: eventos relativos a "hoje" para sempre haver dados ----

export function buildMockEvents(today: Date): EventsByDate {
  const k = (offset: number) => dateKey(addDays(today, offset));
  return {
    [k(0)]: [
      { id: 'e1', time: '09:00', title: 'Interview', done: false },
      { id: 'e2', time: '14:30', title: 'Dentist', done: false },
    ],
    [k(1)]: [{ id: 'e3', time: '19:00', title: 'Chinese class', done: false }],
    [k(2)]: [{ id: 'e4', time: '08:00', title: 'Long run', done: false }],
    [k(4)]: [{ id: 'e5', time: '21:00', title: 'Movie night', done: false }],
  };
}

// ---- clima (mock estático por enquanto) ----

export const weather = {
  temp: 21,
  condition: 'Mostly clear',
};

// ---- reflexão: hanzi grande, pinyin minúsculo, muito respiro ----

export const reflection = {
  hanzi: '坚持',
  pinyin: 'Jiānchí',
  meaning: 'Perseverance',
  quote: 'No risk,\nno story.',
  daysTogether: 657,
};
