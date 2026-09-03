import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@mushaf:read-surahs';

export type ReadSurah = {
  surahId: number;
  markedAt: string;
};

export async function getAllReadSurahs(): Promise<ReadSurah[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ReadSurah[]) : [];
  } catch {
    return [];
  }
}

async function persist(list: ReadSurah[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export async function markSurahRead(surahId: number): Promise<ReadSurah[]> {
  const list = await getAllReadSurahs();
  if (list.some((r) => r.surahId === surahId)) return list;
  const next = [{ surahId, markedAt: new Date().toISOString() }, ...list];
  await persist(next);
  return next;
}

export async function unmarkSurahRead(surahId: number): Promise<ReadSurah[]> {
  const list = await getAllReadSurahs();
  const next = list.filter((r) => r.surahId !== surahId);
  await persist(next);
  return next;
}
