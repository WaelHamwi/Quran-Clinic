import type { Verse } from '@/types/verse';

export const VERSES_PER_PAGE = 10;

export function chunkVersesIntoPages(verses: Verse[]): Verse[][] {
  const chunks: Verse[][] = [];
  for (let i = 0; i < verses.length; i += VERSES_PER_PAGE) {
    chunks.push(verses.slice(i, i + VERSES_PER_PAGE));
  }
  return chunks.length > 0 ? chunks : [[]];
}

export function getPageIndexForVerseIndex(verseIndex: number): number {
  if (verseIndex < 0) return 0;
  return Math.floor(verseIndex / VERSES_PER_PAGE);
}

export function getTotalPagesForSurah(verseCount: number): number {
  return Math.max(1, Math.ceil(verseCount / VERSES_PER_PAGE));
}
