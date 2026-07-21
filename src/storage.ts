import AsyncStorage from '@react-native-async-storage/async-storage';

// Persistimos apenas o conjunto de ids marcados como "feito". Os defaults
// (treinos, eventos) são reconstruídos a cada abertura — inclusive relativos
// a "hoje" — e depois recebem de volta o estado de conclusão salvo aqui.

const KEY = 'venus.doneIds.v1';

// null  → nunca salvou (usa defaults)
// []    → salvou e nada está marcado (respeita: desmarca tudo)
export async function loadDoneIds(): Promise<string[] | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw == null) return null;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === 'string')
      : null;
  } catch {
    return null;
  }
}

export async function saveDoneIds(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // silencioso: persistência é best-effort por enquanto
  }
}
