import { setWidgetSnapshot } from '../modules/widget-bridge';
import type { Workout } from './db/workouts';

// Formato lido por targets/widget/Shared.swift (struct Snapshot).
type WidgetSnapshot = {
  anniversary: string | null;
  workouts: { name: string; doneOn: string | null }[];
};

let last: string | null = null;

// Publica para os widgets da home screen o que eles mostram. Chamado a cada
// refresh da home; só grava (e recarrega o WidgetKit) quando algo mudou.
export function syncWidgets(workouts: Workout[], anniversary: string | null) {
  const snapshot: WidgetSnapshot = {
    anniversary,
    workouts: workouts.map((w) => ({ name: w.name, doneOn: w.doneOn })),
  };
  const json = JSON.stringify(snapshot);
  if (json === last) return;
  if (setWidgetSnapshot(json)) last = json;
}
