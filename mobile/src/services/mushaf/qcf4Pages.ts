import {
  QCF4_FALLBACK_MEASURE_EM,
  QCF4_LINE_HEIGHT_WEIGHTS,
  QCF4_MUSHAF_LINES,
  QCF4_TOTAL_PAGES,
} from '@/constants/qcf4';
import type { Qcf4Page } from '@/types/qcf4';

// All 604 page layouts ship bundled in the app (~10MB), so the Madina Mushaf
// renders offline from first launch. The map is required lazily and cached in
// module scope so its parse cost is paid only once, when the reader first opens.
let pages: Record<string, Qcf4Page> | null = null;

function allPages(): Record<string, Qcf4Page> {
  if (!pages) pages = require('@/assets/data/qcf4-pages.json') as Record<string, Qcf4Page>;
  return pages;
}

// Forces the one-time ~6 MB parse now (idempotent — cached in module scope).
// Called off the critical path (Mushaf list idle) so the first reader open
// doesn't pay the whole materialization synchronously before its first page
// can render.
export function warmQcf4Pages(): void {
  try {
    allPages();
  } catch {
    // best-effort warm-up; a real open will surface any genuine failure
  }
}

// Slot weight of every page, indexed by page - 1. Pages are NOT uniform: the
// two framed opening pages carry 8 lines where the rest carry 15, and the
// surah-dense closing pages spend several banner+bismillah pairs — 98 pages in
// all differ from a plain 15. The continuous pager cuts each page to its own
// weight so no page is handed height its lines don't need (which is what shows
// as gaps) or squeezed into less than they do (which shrinks the text).
let weights: number[] | null = null;

export function qcf4PageWeights(): number[] {
  if (weights) return weights;
  const all = allPages();
  weights = Array.from({ length: QCF4_TOTAL_PAGES }, (_, i) => {
    const page = all[String(i + 1)];
    if (!page) return QCF4_MUSHAF_LINES;
    return page.lines.reduce((sum, line) => sum + (QCF4_LINE_HEIGHT_WEIGHTS[line.words[0]?.type ?? ''] ?? 1), 0);
  });
  return weights;
}

// Width of each page's widest line in em, indexed by page - 1, measured from
// the fonts' own glyph advances (assets/data/qcf4-page-measures.json, ~4KB).
// A page's text is sized so that line spans the screen exactly, which is what
// keeps a line from rendering short of the page with margins down both sides;
// pages genuinely differ (13.24em framed openings vs 15.75–17.44em elsewhere),
// so no single figure can fill the width everywhere.
let measures: number[] | null = null;

export function qcf4PageMeasures(): number[] {
  if (!measures) {
    const raw = require('@/assets/data/qcf4-page-measures.json') as number[];
    measures = Array.from({ length: QCF4_TOTAL_PAGES }, (_, i) =>
      raw[i] > 0 ? raw[i] : QCF4_FALLBACK_MEASURE_EM
    );
  }
  return measures;
}

export async function getQcf4Page(page: number): Promise<Qcf4Page> {
  const data = allPages()[String(page)];
  if (!data) throw new Error(`QCF4 page ${page} not bundled`);
  return data;
}

export function qcf4PageQueryOptions(page: number) {
  return {
    queryKey: ['qcf4Page', page] as const,
    queryFn: () => getQcf4Page(page),
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000,
    networkMode: 'offlineFirst' as const,
    retry: 1,
  };
}
