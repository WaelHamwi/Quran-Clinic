import { API_URL, API_HEADERS, PRODUCTION_API_URL } from '@/services/common/api';
import type { ApiResponse, PaginatedResponse, Surah, SurahWithVerses } from '@/types/surah';
import type { Recitation } from '@/types/recitation';
import type { Reciter } from '@/types/reciter';
import type { Verse } from '@/types/verse';

async function doFetch<T>(url: string, path: string, timeoutMs?: number): Promise<T> {
  const ctrl = new AbortController();
  const timer = timeoutMs != null ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
  try {
    const res = await fetch(`${url}${path}`, { headers: API_HEADERS, signal: ctrl.signal });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json() as Promise<T>;
  } finally {
    if (timer != null) clearTimeout(timer);
  }
}

async function request<T>(path: string): Promise<T> {
  const base = API_URL;
  // 5 s timeout on local so the fallback kicks in quickly when local is down.
  const localTimeout = __DEV__ && base !== PRODUCTION_API_URL ? 5000 : undefined;
  try {
    return await doFetch<T>(base, path, localTimeout);
  } catch (err) {
    if (base === PRODUCTION_API_URL) throw err;
    if (__DEV__) console.log(`[quran] local failed → production (${path})`);
    return doFetch<T>(PRODUCTION_API_URL, path);
  }
}

export const quranService = {
  // 114 = the whole (fixed) surah list in one request; the old per_page=15
  // needed 8 round trips to fill the Mushaf tab. Pagination handling stays —
  // the server just reports last_page=1.
  getSurahs: (page = 1, perPage = 114) =>
    request<PaginatedResponse<Surah>>(`/surahs?page=${page}&per_page=${perPage}`),

  getSurah: (id: number) =>
    request<ApiResponse<SurahWithVerses>>(`/surahs/${id}`),

  getReciters: (page = 1, perPage = 100) =>
    request<PaginatedResponse<Reciter>>(`/reciters?page=${page}&per_page=${perPage}`),

  getReciter: (id: number) =>
    request<ApiResponse<Reciter & { recitations: Recitation[] }>>(`/reciters/${id}`),

  getSurahRecitations: (surahId: number) =>
    request<ApiResponse<Recitation[]>>(`/surahs/${surahId}/recitations`),

  searchVerses: (q: string, page = 1, perPage = 15) =>
    request<PaginatedResponse<Verse>>(`/verses/search?q=${encodeURIComponent(q)}&page=${page}&per_page=${perPage}`),
};
