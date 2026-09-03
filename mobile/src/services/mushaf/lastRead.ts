import AsyncStorage from '@react-native-async-storage/async-storage';

// The Madani (QCF4) reader's position is an absolute 1-604 print page.
const MADANI_KEY = '@mushaf:last-read-madani';

export async function getMadaniLastPage(): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(MADANI_KEY);
    const page = raw != null ? Number(raw) : NaN;
    return Number.isInteger(page) && page >= 1 ? page : null;
  } catch {
    return null;
  }
}

export async function saveMadaniLastPage(page: number): Promise<void> {
  try {
    await AsyncStorage.setItem(MADANI_KEY, String(page));
  } catch {}
}
