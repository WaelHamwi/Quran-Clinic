import type { QueryClient } from '@tanstack/react-query';
import surahPages from '@/assets/data/qcf4-surah-pages.json';
import { qcf4PageQueryOptions } from '@/services/mushaf/qcf4Pages';
import { QCF4_TOTAL_PAGES } from '@/constants/qcf4';
import type { Qcf4Page } from '@/types/qcf4';

const SURAH_FIRST_PAGE = surahPages as Record<string, number>;

/** The pages of `surahId` span [firstPage, lastPage] in the 604-page layout.
 *  Short surahs can share a page with the next surah (nextFirst === firstPage),
 *  hence the Math.max clamp. */
export function surahPageRange(surahId: number): { firstPage: number; lastPage: number } {
  const firstPage = SURAH_FIRST_PAGE[String(surahId)] ?? 1;
  const nextFirst = SURAH_FIRST_PAGE[String(surahId + 1)];
  const lastPage = nextFirst != null ? Math.max(firstPage, nextFirst - 1) : QCF4_TOTAL_PAGES;
  return { firstPage, lastPage };
}

/** The surah that owns `page` in the 604-page layout — the last surah whose
 *  first page is ≤ `page`. Where two surahs share a page, the one that starts
 *  on it wins, matching how the reader labels a shared page by its later surah. */
export function surahForPage(page: number): number {
  let surahId = 1;
  for (let id = 1; id <= 114; id++) {
    const first = SURAH_FIRST_PAGE[String(id)];
    if (first != null && first <= page) surahId = id;
    else if (first != null && first > page) break;
  }
  return surahId;
}

/**
 * The surah the reader is *actually on* for `page`, used to label the header and
 * pick the reciter. A print page routinely holds several surahs — the tail of a
 * previous one and/or multiple short surahs that each begin on it (e.g. p.600
 * carries Al-'Adiyat, Al-Qari'ah AND At-Takathur, the last two both starting
 * there). So neither `surahs[0]` (always the earliest — recites the previous
 * surah) nor `surahForPage` (always the last to begin — skips to the next)
 * identifies it on its own. The surah the user opened/last navigated to
 * (`openedSurahId`) is that identity as long as it's still on the visible page;
 * only once they've scrolled onto a page it no longer appears on do we fall back
 * to that page's owning surah, then to whatever the page starts with.
 */
export function readerSurahForPage(
  pageSurahs: { id: number }[],
  openedSurahId: number,
  page: number
): number {
  if (pageSurahs.some((s) => s.id === openedSurahId)) return openedSurahId;
  const owner = surahForPage(page);
  if (pageSurahs.some((s) => s.id === owner)) return owner;
  return pageSurahs[0]?.id ?? openedSurahId;
}

/** One surah's print-page layout, coarse-grained to a handful of segments —
 *  e.g. a 3-page surah is 3 segments, not one per verse. */
export type SurahPageSegment = { page: number; verseStart: number; verseEnd: number };

/**
 * Fetches (via the same cached `qcf4PageQueryOptions` the pager itself uses)
 * every QCF4 page in `[firstPage, lastPage]` and extracts `surahId`'s
 * verse-range on each — the data needed to resolve "verse N of this surah"
 * to a print page, for search jump-to-verse and cross-surah bookmarks.
 */
export async function getSurahPageSegments(
  queryClient: QueryClient,
  surahId: number,
  firstPage: number,
  lastPage: number
): Promise<SurahPageSegment[]> {
  const pageNumbers = Array.from({ length: lastPage - firstPage + 1 }, (_, i) => firstPage + i);
  const pages = await Promise.all(
    pageNumbers.map((p) => queryClient.fetchQuery<Qcf4Page>(qcf4PageQueryOptions(p)))
  );
  return pages.flatMap((pg) =>
    pg.surahs
      .filter((s) => s.id === surahId)
      .map((s) => ({ page: pg.page, verseStart: s.verse_start, verseEnd: s.verse_end }))
  );
}

/** Which page (from a surah's own segments) contains `verseNumber` — null if
 *  out of range (a stale/invalid verse number). */
export function pageForVerse(segments: SurahPageSegment[], verseNumber: number): number | null {
  const seg = segments.find((s) => verseNumber >= s.verseStart && verseNumber <= s.verseEnd);
  return seg?.page ?? null;
}
