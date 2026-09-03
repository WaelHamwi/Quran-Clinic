// Client-side mirror of the backend's Verse::normalizeArabic() (see
// backend/app/Models/Verse.php) — the search API matches diacritic-insensitively
// against a pre-normalized column, so locating WHERE the term matched inside the
// fully-vowelled Uthmani text requires re-running the exact same normalization
// here with an index map back to the original string.

export type HighlightSegment = { text: string; match: boolean };

// Harakat (064B-065F), dagger alef (0670), Quranic annotation signs
// (0610-061A, 06D6-06ED ranges) and tatweel (0640) — same set as the backend.
const ARABIC_MARKS_RE =
  /[ؐ-ًؚ-ٰٟۖ-ۜ۟-۪ۨ-ۭـ]/;

const ALEF_VARIANTS_RE = /[آأإٱ]/; // آ أ إ ٱ

function normalizeChar(ch: string): string {
  if (ARABIC_MARKS_RE.test(ch)) return '';
  if (ALEF_VARIANTS_RE.test(ch)) return 'ا'; // → bare alef ا
  if (ch === 'ى') return 'ي'; // alef-maksura ى → ya ي
  if (ch === 'ة') return 'ه'; // ta-marbuta ة → ha ه
  return ch.toLowerCase();
}

export function normalizeSearchText(value: string): string {
  return Array.from(value).map(normalizeChar).join('');
}

const isSpace = (ch: string) => /\s/.test(ch);

/**
 * Split `text` into segments marking every whitespace-delimited word that
 * contains a (normalized) occurrence of `query`. Matches are expanded to whole
 * words so segment boundaries always fall on spaces — nested styled spans that
 * cut mid-word would visually break Arabic letter joining.
 */
export function splitByMatch(text: string, query: string): HighlightSegment[] {
  const q = normalizeSearchText(query.trim());
  if (!q) return [{ text, match: false }];

  const chars = Array.from(text);
  const normChars: string[] = [];
  const charIndexOfNorm: number[] = [];
  chars.forEach((ch, i) => {
    for (const nc of normalizeChar(ch)) {
      normChars.push(nc);
      charIndexOfNorm.push(i);
    }
  });
  const norm = normChars.join('');

  const matchFlags = new Array<boolean>(chars.length).fill(false);
  let found = false;
  for (let from = norm.indexOf(q); from >= 0; from = norm.indexOf(q, from + q.length)) {
    found = true;
    let start = charIndexOfNorm[from];
    let end = charIndexOfNorm[from + q.length - 1];
    while (start > 0 && !isSpace(chars[start - 1])) start--;
    while (end + 1 < chars.length && !isSpace(chars[end + 1])) end++;
    for (let i = start; i <= end; i++) matchFlags[i] = true;
  }
  if (!found) return [{ text, match: false }];

  const segments: HighlightSegment[] = [];
  let segStart = 0;
  for (let i = 1; i <= chars.length; i++) {
    if (i === chars.length || matchFlags[i] !== matchFlags[segStart]) {
      segments.push({ text: chars.slice(segStart, i).join(''), match: matchFlags[segStart] });
      segStart = i;
    }
  }
  return segments;
}
