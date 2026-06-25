import type { Verse } from '@/types/verse';
import {
  VERSES_PER_PAGE,
  chunkVersesIntoPages,
  getPageIndexForVerseIndex,
  getTotalPagesForSurah,
} from '@/utils/mushafPages';

const makeVerses = (count: number): Verse[] =>
  Array.from({ length: count }, (_, i) => ({ id: i + 1 }) as unknown as Verse);

describe('chunkVersesIntoPages', () => {
  it('splits verses into pages of VERSES_PER_PAGE', () => {
    const pages = chunkVersesIntoPages(makeVerses(VERSES_PER_PAGE * 2 + 3));

    expect(pages).toHaveLength(3);
    expect(pages[0]).toHaveLength(VERSES_PER_PAGE);
    expect(pages[2]).toHaveLength(3);
  });

  it('returns a single empty page when there are no verses', () => {
    expect(chunkVersesIntoPages([])).toEqual([[]]);
  });
});

describe('getPageIndexForVerseIndex', () => {
  it('maps a verse index to its zero-based page', () => {
    expect(getPageIndexForVerseIndex(0)).toBe(0);
    expect(getPageIndexForVerseIndex(VERSES_PER_PAGE - 1)).toBe(0);
    expect(getPageIndexForVerseIndex(VERSES_PER_PAGE)).toBe(1);
  });

  it('clamps negative indexes to the first page', () => {
    expect(getPageIndexForVerseIndex(-5)).toBe(0);
  });
});

describe('getTotalPagesForSurah', () => {
  it('always reports at least one page', () => {
    expect(getTotalPagesForSurah(0)).toBe(1);
  });

  it('rounds partial pages up', () => {
    expect(getTotalPagesForSurah(VERSES_PER_PAGE + 1)).toBe(2);
  });
});
