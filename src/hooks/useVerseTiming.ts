import { useQuery } from '@tanstack/react-query';
import { offlineStorage } from '@/services/offlineStorage';

const QURANCOM_IDS: Record<string, number> = {
  'Mishary Rashid Al-Afasy': 7,
};

export interface VerseTiming {
  timestampFrom: number;
  timestampTo: number;
}

export function useVerseTiming(surahId: number, reciterNameEn: string | undefined) {
  const recitationId = reciterNameEn ? QURANCOM_IDS[reciterNameEn] : undefined;

  return useQuery<VerseTiming[]>({
    queryKey: ['verseTiming', surahId, recitationId],
    queryFn: async () => {
      if (!recitationId) throw new Error('Unknown reciter');
      try {
        const res = await fetch(
          `https://api.quran.com/api/v4/chapter_recitations/${recitationId}/${surahId}`
        );
        if (!res.ok) throw new Error(`Timing API returned ${res.status}`);
        const json = await res.json();
        const raw: { timestamp_from: number; timestamp_to: number }[] =
          json?.audio_file?.verse_timings ?? [];
        if (raw.length === 0) throw new Error('No verse timings in response');
        const timings = raw.map((t) => ({
          timestampFrom: t.timestamp_from,
          timestampTo: t.timestamp_to,
        }));
        await offlineStorage.saveVerseTiming(surahId, recitationId, timings);
        return timings;
      } catch {
        const cached = await offlineStorage.getVerseTiming(surahId, recitationId);
        if (cached.length > 0) return cached;
        throw new Error('Verse timing not available offline');
      }
    },
    enabled: !!recitationId && surahId > 0,
    staleTime: 7 * 24 * 60 * 60 * 1000,
    gcTime:    7 * 24 * 60 * 60 * 1000,
    retry: 1,
  });
}
