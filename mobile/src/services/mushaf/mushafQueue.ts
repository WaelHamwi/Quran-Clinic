import { API_URL } from '@/services/common/api';
import { audioService } from '@/services/player/audioService';
import { offlineStorage } from '@/services/common/offlineStorage';
import { quranService } from '@/services/mushaf/quranService';
import { fetchVerseTiming, qurancomRecitationId } from '@/hooks/mushaf/useVerseTiming';
import { TOTAL_SURAHS } from '@/utils/mushafReader';
import type { Recitation } from '@/types/recitation';

// A reciter can be missing a few surahs — skipping keeps a khatma going
// instead of dead-ending, while a small cap avoids hammering the API when
// something is systematically wrong (e.g. offline with nothing cached).
const MAX_SKIPPED_SURAHS = 3;

export type NextSurahSource = {
  surahId: number;
  name: { ar: string; en?: string | null };
  reciterName: { ar: string; en?: string | null } | undefined;
  uri: string;
};

// CDN/remote recitations expose an absolute `audio_url` we can stream directly —
// this also sidesteps the local API base, which is unreachable from a device
// when the backend isn't on the LAN (the recitation data itself may have arrived
// from production via the per-request fallback while API_URL still points local).
// Only backend-stored files (relative path) need the API proxy endpoint.
export function resolveRecitationUri(recitation: Recitation): string {
  const url = recitation.audio_url ?? '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_URL}/recitations/${recitation.id}/audio`;
}

async function getRecitationFor(surahId: number, reciterId: number): Promise<Recitation | undefined> {
  let recitations: Recitation[];
  try {
    recitations = (await quranService.getSurahRecitations(surahId)).data ?? [];
  } catch {
    recitations = await offlineStorage.getRecitationsBySurah(surahId);
  }
  return recitations.find((r) => r.reciter_id === reciterId);
}

async function getSurahName(surahId: number): Promise<{ ar: string; en?: string | null }> {
  try {
    let surahs = await offlineStorage.getSurahs();
    if (!surahs.some((s) => s.id === surahId)) {
      surahs = (await quranService.getSurahs()).data ?? [];
    }
    const surah = surahs.find((s) => s.id === surahId);
    if (surah) return surah.name;
  } catch {}
  return { ar: `سورة ${surahId}`, en: `Surah ${surahId}` };
}

/**
 * Resolve what to play after `currentSurahId` ends: the next surah's audio for
 * the same reciter, using the reader's own source-preference order — the
 * timing-aligned Quran.com file (exact highlight if the user opens the reader),
 * its local download when cached, else the legacy backend file.
 */
export async function resolveNextSurahSource(
  currentSurahId: number,
  reciterId: number | null,
): Promise<NextSurahSource | null> {
  if (reciterId == null) return null;

  for (
    let surahId = currentSurahId + 1;
    surahId <= Math.min(currentSurahId + MAX_SKIPPED_SURAHS, TOTAL_SURAHS);
    surahId++
  ) {
    const recitation = await getRecitationFor(surahId, reciterId);
    if (!recitation) continue;

    let timedUrl: string | null = null;
    const qcId = qurancomRecitationId(recitation.reciter?.name?.en ?? undefined);
    if (qcId) {
      try {
        timedUrl = (await fetchVerseTiming(surahId, qcId)).audioUrl;
      } catch {
        timedUrl = null;
      }
    }

    const timed = timedUrl != null;
    const cached = await audioService.isAudioCached(surahId, reciterId, timed);
    const uri = cached
      ? audioService.getLocalPath(surahId, reciterId, timed)
      : timedUrl ?? resolveRecitationUri(recitation);

    return {
      surahId,
      name: await getSurahName(surahId),
      reciterName: recitation.reciter?.name,
      uri,
    };
  }
  return null;
}
