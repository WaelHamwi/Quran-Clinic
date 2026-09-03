import AsyncStorage from '@react-native-async-storage/async-storage';

const MADANI_STORAGE_KEY = '@mushaf:page-bookmarks-madani';

export type MadaniPageBookmark = {
  surahId: number;
  page: number;
  createdAt: string;
};

async function readList<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

async function writeList<T>(key: string, list: T[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(list));
  } catch {}
}

export async function getAllMadaniPageBookmarks(): Promise<MadaniPageBookmark[]> {
  return readList<MadaniPageBookmark>(MADANI_STORAGE_KEY);
}

export async function addMadaniPageBookmark(surahId: number, page: number): Promise<MadaniPageBookmark[]> {
  const list = await getAllMadaniPageBookmarks();
  if (list.some((b) => b.page === page)) return list;
  const next = [{ surahId, page, createdAt: new Date().toISOString() }, ...list];
  await writeList(MADANI_STORAGE_KEY, next);
  return next;
}

export async function removeMadaniPageBookmark(page: number): Promise<MadaniPageBookmark[]> {
  const list = await getAllMadaniPageBookmarks();
  const next = list.filter((b) => b.page !== page);
  await writeList(MADANI_STORAGE_KEY, next);
  return next;
}

