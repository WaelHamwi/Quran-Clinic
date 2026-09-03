import { normalizeSearchText, splitByMatch } from '@/utils/verseHighlight';

// Fully-vowelled Uthmani samples (as stored in verses.text.ar)
const RAHMAN_VOWELLED = 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
const FATIHA_V2 = 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ';

describe('normalizeSearchText', () => {
  it('strips harakat, Quranic signs and tatweel, and unifies alef forms', () => {
    expect(normalizeSearchText(RAHMAN_VOWELLED)).toBe('الرحمن الرحيم');
  });

  it('maps alef-maksura to ya and ta-marbuta to ha (backend parity)', () => {
    expect(normalizeSearchText('هدى')).toBe('هدي');
    expect(normalizeSearchText('رحمة')).toBe('رحمه');
  });

  it('lowercases latin text', () => {
    expect(normalizeSearchText('The Merciful')).toBe('the merciful');
  });
});

describe('splitByMatch', () => {
  it('finds an undiacritised term inside fully-vowelled text', () => {
    const segments = splitByMatch(FATIHA_V2, 'الحمد');
    expect(segments[0]).toEqual({ text: 'ٱلْحَمْدُ', match: true });
    expect(segments.filter((s) => s.match)).toHaveLength(1);
  });

  it('expands a partial match to the whole word so Arabic joining is preserved', () => {
    const segments = splitByMatch(FATIHA_V2, 'رب');
    const matched = segments.filter((s) => s.match);
    expect(matched).toEqual([{ text: 'رَبِّ', match: true }]);
  });

  it('marks every occurrence', () => {
    const segments = splitByMatch('رحيم غفور رحيم', 'رحيم');
    expect(segments.filter((s) => s.match)).toHaveLength(2);
  });

  it('reassembles the original text exactly', () => {
    const segments = splitByMatch(FATIHA_V2, 'العالمين');
    expect(segments.map((s) => s.text).join('')).toBe(FATIHA_V2);
  });

  it('matches english case-insensitively', () => {
    const segments = splitByMatch('All praise is due to Allah', 'PRAISE');
    expect(segments.filter((s) => s.match)).toEqual([{ text: 'praise', match: true }]);
  });

  it('returns a single unmatched segment when nothing matches or query is empty', () => {
    expect(splitByMatch(FATIHA_V2, 'قل هو')).toEqual([{ text: FATIHA_V2, match: false }]);
    expect(splitByMatch(FATIHA_V2, '  ')).toEqual([{ text: FATIHA_V2, match: false }]);
  });
});
