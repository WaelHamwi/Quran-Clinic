// Ligature-code helpers for the QUL/Tarteel icon fonts (surahNameIcon,
// quranCommon in theme/typography.ts). These fonts render a decorated
// name/title glyph when the exact ligature code string below is displayed
// with the matching fontFamily — not the literal Arabic name.

export function surahNameLigature(surahId: number): string {
  return `surah${String(surahId).padStart(3, '0')}`; // 1 -> "surah001"
}

export function juzNameLigature(juzNumber: number): string {
  return `j${String(juzNumber).padStart(3, '0')}`; // 1 -> "j001"
}

export function juzNumberLigature(juzNumber: number): string {
  return `juz${String(juzNumber).padStart(3, '0')}`; // 1 -> "juz001"
}
