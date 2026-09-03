import { useQuery } from '@tanstack/react-query';
import { offlineStorage } from '@/services/common/offlineStorage';

// Quran.com v4 recitation IDs, keyed by the seeded reciter `name.en`.
// Only reciters verified to exist on Quran.com with chapter audio + timestamps
// (checked against /resources/recitations) may be listed here — a wrong ID
// would play a different reciter's voice.
const QURANCOM_IDS: Record<string, number> = {
  'Mishary Rashid Al-Afasy': 7,
  'Abdul Basit Abdus Samad (Murattal)': 2,
  'Abdul Basit Abdus Samad (Mujawwad)': 1,
  'Mahmoud Khaleel Al-Husary': 6,
  'Saud Al-Shuraim': 10,
  'Abu Bakr Al-Shatri': 4,
  'Abdul Rahman Al-Sudais': 3,
  // Quran.com 162 serves the byte-identical quranicaudio file our backend seeds
  // for Al-Juhaynee (sizes verified), so its timestamps describe the same take —
  // including the basmalah lead (verse 1 starts at ~2.5 s, not 0).
  'Abdullah Awwad Al-Juhaynee': 162,
  // Re-seeded reciters (2026-07-14): the backend audio_path now points at the
  // exact file each id's timestamps describe, verified across all 114 surahs.
  // Ghamdi/Maher fold the basmalah into verse 1's window (verse 1 starts at 0);
  // Budair timestamps the basmalah lead explicitly (verse 1 starts > 0).
  // Mohamed Ayyoub & Abdul Wadood Haneef are deliberately NOT here — Quran.com
  // has no timestamps for them; mapping them would only stall the play-tap wait.
  'Saoud Al-Ghamdi': 13,
  'Yasser Al-Dosari': 174,
  'Maher Al-Muaiqly': 159,
  'Salah Al-Budair': 43,
};

/** Whether exact Quran.com verse timing exists for this reciter. */
export function hasQurancomTiming(reciterNameEn: string | undefined): boolean {
  return !!reciterNameEn && reciterNameEn in QURANCOM_IDS;
}

export function qurancomRecitationId(reciterNameEn: string | undefined): number | undefined {
  return reciterNameEn ? QURANCOM_IDS[reciterNameEn] : undefined;
}

export interface VerseTiming {
  timestampFrom: number;
  timestampTo: number;
}

export interface SurahTiming {
  timings: VerseTiming[];
  /**
   * The exact audio file the timestamps are aligned to. Quran.com's qdc chapter
   * files start directly at verse 1; others (e.g. Al-Juhaynee) keep a recited
   * basmalah lead-in that the timestamps account for (verse 1 starts > 0).
   * The backend's legacy quranicaudio.com files are generally DIFFERENT
   * recordings — timings are only valid while this exact file is playing.
   */
  audioUrl: string | null;
}

/** Plain (non-hook) fetch so the root audio provider can resolve the next
 *  surah's timed file during auto-advance, outside any React Query context. */
export async function fetchVerseTiming(surahId: number, recitationId: number): Promise<SurahTiming> {
  try {
    // `segments=true` is required — without it the v4 API omits timing data
    // entirely (and the field is `timestamps`, not the old `verse_timings`).
    const res = await fetch(
      `https://api.quran.com/api/v4/chapter_recitations/${recitationId}/${surahId}?segments=true`
    );
    if (!res.ok) throw new Error(`Timing API returned ${res.status}`);
    const json = await res.json();
    const raw: { timestamp_from: number; timestamp_to: number }[] =
      json?.audio_file?.timestamps ?? json?.audio_file?.verse_timings ?? [];
    if (raw.length === 0) throw new Error('No verse timings in response');
    const timings = raw.map((t) => ({
      timestampFrom: t.timestamp_from,
      timestampTo: t.timestamp_to,
    }));
    const audioUrl: string | null = json?.audio_file?.audio_url ?? null;
    await offlineStorage.saveVerseTiming(surahId, recitationId, timings, audioUrl);
    return { timings, audioUrl };
  } catch {
    const cached = await offlineStorage.getVerseTiming(surahId, recitationId);
    if (cached.timings.length > 0) return cached;
    throw new Error('Verse timing not available offline');
  }
}

export function useVerseTiming(surahId: number, reciterNameEn: string | undefined) {
  const recitationId = reciterNameEn ? QURANCOM_IDS[reciterNameEn] : undefined;

  return useQuery<SurahTiming>({
    queryKey: ['verseTiming', surahId, recitationId],
    queryFn: () => fetchVerseTiming(surahId, recitationId!),
    enabled: !!recitationId && surahId > 0,
    staleTime: 7 * 24 * 60 * 60 * 1000,
    gcTime:    7 * 24 * 60 * 60 * 1000,
    retry: false,
    networkMode: 'offlineFirst',
  });
}
