import {
  computeVerseStartFractions,
  resolveActiveVerseIndex,
  resolveEntryVerse,
  resolveVerseStartMs,
} from '@/utils/verseTiming';
import type { Verse } from '@/types/verse';

const timings = [
  { timestampFrom: 0, timestampTo: 4000 },
  { timestampFrom: 4000, timestampTo: 9000 },
  { timestampFrom: 9000, timestampTo: 15000 },
];

// Ten non-space letters each, so the proportional fallback's thirds are exact.
const verses = ['ابتثج حخدذر', 'زسشصض طظعغف', 'قكلمن هويءآ'].map(
  (ar, i) => ({ verse_number: i + 1, text: { ar } }) as unknown as Verse
);

describe('resolveVerseStartMs', () => {
  it('reads the exact timestamp when timings describe the playing file', () => {
    expect(
      resolveVerseStartMs({
        verseIndex: 2,
        durationMillis: 15000,
        verseTiming: timings,
        verseStartFractions: [],
        basmalahLeadMs: 0,
      })
    ).toBe(9000);
  });

  it('falls back to the text-length proportion, offset past the basmalah lead', () => {
    const fractions = computeVerseStartFractions(verses);
    const ms = resolveVerseStartMs({
      verseIndex: 1,
      durationMillis: 66000,
      verseTiming: undefined,
      verseStartFractions: fractions,
      basmalahLeadMs: 6000,
    });
    // Verse 2 opens a third of the way through the 60 s that follow the lead.
    expect(ms).toBeCloseTo(26000, -2);
  });

  it('round-trips with resolveActiveVerseIndex on the proportional fallback', () => {
    const verseStartFractions = computeVerseStartFractions(verses);
    const opts = { durationMillis: 66000, verseTiming: undefined, verseStartFractions, basmalahLeadMs: 6000 };
    for (const verseIndex of [0, 1, 2]) {
      const ms = resolveVerseStartMs({ ...opts, verseIndex })!;
      expect(resolveActiveVerseIndex({ ...opts, positionMs: ms })).toBe(verseIndex);
    }
  });

  it('returns null while nothing can place the verse yet', () => {
    const base = { verseTiming: undefined, verseStartFractions: [0, 0.5], basmalahLeadMs: 0 };
    // Source not loaded — no length to scale the proportion against.
    expect(resolveVerseStartMs({ ...base, verseIndex: 1, durationMillis: 0 })).toBeNull();
    // Verse beyond the surah.
    expect(resolveVerseStartMs({ ...base, verseIndex: 9, durationMillis: 60000 })).toBeNull();
    expect(resolveVerseStartMs({ ...base, verseIndex: -1, durationMillis: 60000 })).toBeNull();
  });
});

describe('resolveEntryVerse', () => {
  const page = { pageVerseStart: 17, pageVerseEnd: 24 };

  it('enters at the top of the visible page when nothing is playing there', () => {
    expect(resolveEntryVerse({ ...page, jumpedVerse: null, activeVerse: -1 })).toBe(17);
    expect(resolveEntryVerse({ ...page, jumpedVerse: null, activeVerse: 3 })).toBe(17);
  });

  it('leaves a recitation already inside the visible page alone, so resume stays resume', () => {
    expect(resolveEntryVerse({ ...page, jumpedVerse: null, activeVerse: 20 })).toBeNull();
    expect(resolveEntryVerse({ ...page, jumpedVerse: null, activeVerse: 17 })).toBeNull();
  });

  it('prefers a jumped-to verse over the page it landed on', () => {
    expect(resolveEntryVerse({ ...page, jumpedVerse: 22, activeVerse: 17 })).toBe(22);
    expect(resolveEntryVerse({ ...page, jumpedVerse: 22, activeVerse: 22 })).toBeNull();
  });

  it('ignores a jump the reader has since paged away from', () => {
    expect(resolveEntryVerse({ ...page, jumpedVerse: 255, activeVerse: -1 })).toBe(17);
  });

  it('leaves the surah opening alone so its basmalah still plays in', () => {
    expect(
      resolveEntryVerse({ pageVerseStart: 1, pageVerseEnd: 9, jumpedVerse: null, activeVerse: -1 })
    ).toBeNull();
    expect(
      resolveEntryVerse({ pageVerseStart: 1, pageVerseEnd: 9, jumpedVerse: 1, activeVerse: -1 })
    ).toBeNull();
  });
});
