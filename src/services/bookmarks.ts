import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@mushaf:page-bookmarks';

export type PageBookmark = {
  surahId: number;
  pageIndex: number;
  createdAt: string;
};

export async function getAllPageBookmarks(): Promise<PageBookmark[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PageBookmark[]) : [];
  } catch {
    return [];
  }
}

async function persist(list: PageBookmark[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export async function addPageBookmark(surahId: number, pageIndex: number): Promise<PageBookmark[]> {
  const list = await getAllPageBookmarks();
  if (list.some((b) => b.surahId === surahId && b.pageIndex === pageIndex)) return list;
  const next = [{ surahId, pageIndex, createdAt: new Date().toISOString() }, ...list];
  await persist(next);
  return next;
}

export async function removePageBookmark(surahId: number, pageIndex: number): Promise<PageBookmark[]> {
  const list = await getAllPageBookmarks();
  const next = list.filter((b) => !(b.surahId === surahId && b.pageIndex === pageIndex));
  await persist(next);
  return next;
}
