import type { FontScale } from '@/utils/mushafReader';

// The QCF4 page layouts (assets/data/qcf4-pages.json) and the 47 Hafs page
// fonts + QBSML banner (assets/fonts/qcf4/, mapped in qcf4FontAssets.ts) ship
// bundled in the app — sourced from the pinned npm/gh builds of
// MohamadHajjRabee/quran-qcf4. Nothing is downloaded at runtime.

export const QCF4_HEADER_FONT = 'QCF4_QBSML';

export const QCF4_TOTAL_PAGES = 604;
export const QCF4_MUSHAF_LINES = 15;

// How wide a page's widest line is, in em — so a line set at (usable width /
// this) fills the measure exactly. It is NOT one number for the whole Mushaf:
// summing the fonts' own glyph advances over all 604 pages gives 15.75–17.44em
// for ordinary pages and 13.24em for the two framed opening pages, so each
// page carries its own measure in assets/data/qcf4-page-measures.json (see
// qcf4PageMeasures). A single global figure is what left every line short of
// the page — text set for 19.5em when the line was really 16.25em rendered at
// 83% of the width, with the remainder showing as margins down both sides.
//
// Used only when a page has no entry: the widest measured anywhere, so a
// missing entry can set a line too small but never wide enough to spill.
export const QCF4_FALLBACK_MEASURE_EM = 17.45;

// A line's words are laid out as several Text nodes, each rounded up to whole
// pixels, so a line renders a hair wider than its glyph advances predict.
// Nothing re-fits a line after the fact, so the width cap is held just under
// the measure and the slack handed to justification, which spreads it across
// the line's word gaps — invisible at this size, and it keeps an over-wide
// line from spilling off the page.
export const QCF4_MEASURE_SAFETY = 0.97;

// A line's rendered size is also capped by the pixel height its flex slot was
// given, so the text of a scaled-down page shrinks with the page instead of
// overflowing the slot it has to sit in — the vertical half of the width cap
// above. Same ratio as the classic reader's verseArabic (24pt / 44 lineHeight)
// — Quranic diacritics need roughly this much headroom above the glyph body.
export const QCF4_LINE_HEIGHT_RATIO = 1.8;

// The surah-header/bismillah line uses the QCF4_QBSML font, a completely
// different glyph shape from regular Hafs ayat text — one glyph draws an
// entire ornamental name-banner, whose ink extends further below the
// baseline than QCF4_LINE_HEIGHT_RATIO (tuned for ayat diacritic headroom)
// accounts for. Reusing that ratio let the banner be sized just tall enough
// to get clipped along its bottom edge; this larger, dedicated ratio caps
// its font-size more conservatively so the whole glyph fits its slot.
export const QCF4_HEADER_LINE_HEIGHT_RATIO = 2.6;

// Reader's text-size pick, offered in the vertical/continuous mode only (the
// horizontal pager fills the frame, so its size is dictated by the frame).
// Applied on two axes at once so the pick is reflected 1:1: on width via the
// page's measure in MadaniPage, and on height by cutting the page to match
// (qcf4ContinuousPageHeight), since the slot height is what caps each line.
//
// 1 is the print scale — a line then fills the page's full measure, the
// largest a fixed-line page can be set at a given width, so the picks only
// step *down* from there. Below 1 the glyphs really are smaller and more of
// the Mushaf fits on screen; each line is still justified to the measure, so
// the width it gives up becomes word spacing rather than margins down both
// sides. The steps stay close to 1 to keep that spacing from opening up.
export const QCF4_FONT_SCALE_MULTIPLIERS: Record<FontScale, number> = {
  sm: 0.7,
  md: 0.8,
  lg: 0.9,
  xl: 1,
};

// Surah-header and bismillah lines render larger glyphs — giving them a
// same-size slot as a regular line squeezes that larger text vertically,
// forcing it to be sized back down (the surah name banner ends up tiny or
// clipped). Weighting their slot share keeps the boosted glyphs from being
// fought by their own container, and the extra weight on surah_header makes
// the title stand out as its own distinct band rather than reading like just
// another verse line.
export const QCF4_LINE_HEIGHT_WEIGHTS: Partial<Record<string, number>> = {
  surah_header: 2.2,
  bismillah: 1.4,
};

// MadaniPage.styles' paddingHorizontal, both sides — a page's measure (the
// width its lines are set to) is its box width less this.
export const QCF4_PAGE_H_PADDING = 8;

// Page chrome the lines never get: MadaniPage's top padding plus the footer
// band carrying the page number. Taken off a page's height before it is shared
// out between line slots, so a line's height cap reflects the space it will
// really be laid out in. MadaniPage.styles lays both out from these same two
// numbers — a footer that measured taller than budgeted would squeeze the last
// line, one that measured shorter would leave a strip of dead page under it.
export const QCF4_PAGE_TOP_PADDING = 4;
export const QCF4_PAGE_FOOTER_HEIGHT = 24;
export const QCF4_PAGE_CHROME_HEIGHT = QCF4_PAGE_TOP_PADDING + QCF4_PAGE_FOOTER_HEIGHT;


// The rule drawn under each page in continuous mode (MadaniVerticalPager.styles'
// pageItem border) — part of an item's height, so the pager's offsets count it.
export const QCF4_PAGE_DIVIDER_HEIGHT = 1;

/** Size a line is set at on a page whose widest line is `measureEm` wide,
 *  before its slot height caps it (MadaniPage) — the size at which that line
 *  spans the page edge to edge, scaled by the reader's pick. */
export function qcf4LineFontSize(pageWidth: number, textScale: number, measureEm: number): number {
  return (((pageWidth - QCF4_PAGE_H_PADDING) * QCF4_MEASURE_SAFETY) / measureEm) * textScale;
}

/** Height a continuous-mode page of `pageWeight` slots needs to hold its lines
 *  at `textScale` — the whole point being that it holds nothing else. Cutting
 *  every page to one uniform height instead would hand the 8-line opening
 *  pages half again the height their lines use (the gaps show), and squeeze
 *  the surah-dense closing pages into a third less than they need (the text
 *  shrinks) — see qcf4PageWeights. */
export function qcf4ContinuousPageHeight(
  pageWidth: number,
  textScale: number,
  pageWeight: number,
  measureEm: number
): number {
  return (
    qcf4LineFontSize(pageWidth, textScale, measureEm) * QCF4_LINE_HEIGHT_RATIO * pageWeight +
    QCF4_PAGE_CHROME_HEIGHT
  );
}
