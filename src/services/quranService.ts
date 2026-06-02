import { API_URL, API_HEADERS } from '@/services/api';
import type { ApiResponse, PaginatedResponse, Surah, SurahWithVerses } from '@/types/surah';
import type { Recitation } from '@/types/recitation';
import type { Reciter } from '@/types/reciter';

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { headers: API_HEADERS });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export const quranService = {
  getSurahs: (page = 1, perPage = 15) =>
    request<PaginatedResponse<Surah>>(`/surahs?page=${page}&per_page=${perPage}`),

  getSurah: (id: number) =>
    request<ApiResponse<SurahWithVerses>>(`/surahs/${id}`),

  getReciters: (page = 1, perPage = 100) =>
    request<PaginatedResponse<Reciter>>(`/reciters?page=${page}&per_page=${perPage}`),

  getReciter: (id: number) =>
    request<ApiResponse<Reciter & { recitations: Recitation[] }>>(`/reciters/${id}`),

  getSurahRecitations: (surahId: number) =>
    request<ApiResponse<Recitation[]>>(`/surahs/${surahId}/recitations`),
};
