import surahPages from '@/assets/data/qcf4-surah-pages.json';
import fontMap from '@/assets/data/qcf4-font-map.json';
import { juzForPage } from '@/hooks/mushaf/useMadaniReader';
import { qcf4PageQueryOptions } from '@/services/mushaf/qcf4Pages';
import { readerSurahForPage, surahForPage } from '@/utils/qcf4Verse';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({})),
  useRouter: jest.fn(),
}));
jest.mock('@/context/MushafContext', () => ({
  useMushafContext: jest.fn(),
}));
jest.mock('@/services/mushaf/qcf4Pages', () => ({
  ...jest.requireActual('@/services/mushaf/qcf4Pages'),
  getQcf4Page: jest.fn(),
}));
// useMadaniReader now composes the audio playback stack, which pulls in
// expo-audio (a native module this suite doesn't otherwise need — it only
// exercises the pure helpers below) — mocked out purely to keep that import
// chain from loading.
jest.mock('@/context/MushafAudioContext', () => ({
  useMushafAudio: jest.fn(),
}));

const SURAH_PAGES = surahPages as Record<string, number>;
const FONT_MAP = fontMap as Record<string, string>;

describe('qcf4 bundled metadata', () => {
  it('maps every surah to its first page', () => {
    expect(Object.keys(SURAH_PAGES)).toHaveLength(114);
    expect(SURAH_PAGES['1']).toBe(1);
    expect(SURAH_PAGES['2']).toBe(2);
    expect(SURAH_PAGES['114']).toBe(604);
  });

  it('maps every page to a QCF4 font family', () => {
    expect(Object.keys(FONT_MAP)).toHaveLength(604);
    expect(FONT_MAP['1']).toBe('QCF4_Hafs_01');
    expect(FONT_MAP['604']).toBe('QCF4_Hafs_47');
  });
});

describe('juzForPage', () => {
  it('resolves juz boundaries on the 604-page Madina layout', () => {
    expect(juzForPage(1)).toBe(1);
    expect(juzForPage(21)).toBe(1);
    expect(juzForPage(22)).toBe(2);
    expect(juzForPage(281)).toBe(14);
    expect(juzForPage(282)).toBe(15);
    expect(juzForPage(582)).toBe(30);
    expect(juzForPage(604)).toBe(30);
  });
});

describe('surahForPage — owning surah of a shared page', () => {
  it('labels a shared page by the surah that starts on it, not the tail of the previous one', () => {
    // p.255 holds the tail of Surah 13 and the start of Surah 14 — the reader
    // (and the reciter) must resolve it to 14, not 13.
    expect(surahForPage(255)).toBe(14);
    expect(surahForPage(293)).toBe(18);
    expect(SURAH_PAGES['14']).toBe(255);
    expect(SURAH_PAGES['18']).toBe(293);
  });

  it('resolves a mid-surah page to that surah', () => {
    expect(surahForPage(3)).toBe(2);
    expect(surahForPage(604)).toBe(114);
  });
});

describe('readerSurahForPage — the surah the reader is on', () => {
  // p.600 carries three surahs; both Al-Qari'ah (101) and At-Takathur (102)
  // *start* on it, so surahForPage alone resolves to 102.
  const page600 = [{ id: 100 }, { id: 101 }, { id: 102 }];

  it('keeps the surah the user opened when it is on a multi-surah page', () => {
    // Opening Al-Qari'ah must recite Al-Qari'ah, not the At-Takathur below it.
    expect(readerSurahForPage(page600, 101, 600)).toBe(101);
    expect(readerSurahForPage(page600, 100, 600)).toBe(100);
    expect(readerSurahForPage(page600, 102, 600)).toBe(102);
  });

  it('falls back to the page-owning surah once scrolled off the opened one', () => {
    // Opened surah 99 is no longer on p.600 → the page owner (102) takes over.
    expect(readerSurahForPage(page600, 99, 600)).toBe(102);
  });

  it('resolves a tail+start shared page to whichever of the two was opened', () => {
    // p.255 = tail of Surah 13 + start of Surah 14.
    const page255 = [{ id: 13 }, { id: 14 }];
    expect(readerSurahForPage(page255, 14, 255)).toBe(14);
    expect(readerSurahForPage(page255, 13, 255)).toBe(13);
  });
});

describe('qcf4PageQueryOptions', () => {
  it('keys the query by page and never marks cached pages stale', () => {
    const options = qcf4PageQueryOptions(42);
    expect(options.queryKey).toEqual(['qcf4Page', 42]);
    expect(options.staleTime).toBe(Infinity);
    expect(options.networkMode).toBe('offlineFirst');
  });
});
