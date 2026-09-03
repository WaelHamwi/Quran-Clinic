import {
  QCF4_FONT_SCALE_MULTIPLIERS,
  QCF4_LINE_HEIGHT_RATIO,
  QCF4_MEASURE_SAFETY,
  QCF4_MUSHAF_LINES,
  QCF4_PAGE_CHROME_HEIGHT,
  QCF4_PAGE_H_PADDING,
  qcf4ContinuousPageHeight,
  qcf4LineFontSize,
} from '@/constants/qcf4';

const PAGE_WIDTH = 400;

// The real shapes the Mushaf contains, measured from the bundled fonts and
// page data: the framed 8-line openings, an ordinary page, and a surah-dense
// closing page — each with its own widest-line measure in em.
const OPENING = { weight: 9.2, measureEm: 13.244 };
const ORDINARY = { weight: QCF4_MUSHAF_LINES, measureEm: 16.23 };
const CLOSING = { weight: 19.8, measureEm: 15.78 };
const SHAPES = [OPENING, ORDINARY, CLOSING];

// What MadaniPage does with the height it is handed: share the text area out
// between the line slots, then cap each line at the size its own slot allows.
function heightCapPerLine(pageHeight: number, pageWeight: number) {
  return (pageHeight - QCF4_PAGE_CHROME_HEIGHT) / pageWeight / QCF4_LINE_HEIGHT_RATIO;
}

describe('qcf4 page layout', () => {
  it('sets a line so its widest line spans the page, whatever that page measures', () => {
    for (const { measureEm } of SHAPES) {
      const renderedWidth = qcf4LineFontSize(PAGE_WIDTH, 1, measureEm) * measureEm;
      // Filling the page's usable width, bar the sliver held back so a line
      // rounded up to whole pixels can't spill (justification takes it up).
      expect(renderedWidth).toBeCloseTo((PAGE_WIDTH - QCF4_PAGE_H_PADDING) * QCF4_MEASURE_SAFETY, 6);
    }
  });

  it('cuts every page to exactly the height its own lines need, at every size', () => {
    for (const scale of Object.values(QCF4_FONT_SCALE_MULTIPLIERS)) {
      for (const { weight, measureEm } of SHAPES) {
        const height = qcf4ContinuousPageHeight(PAGE_WIDTH, scale, weight, measureEm);
        // The slot allows precisely the size the measure allows: no line is
        // capped below the size that was picked, and no height is left over
        // to show as gaps — whatever the page's line composition.
        expect(heightCapPerLine(height, weight)).toBeCloseTo(qcf4LineFontSize(PAGE_WIDTH, scale, measureEm), 6);
      }
    }
  });

  it('gives a page with more lines more height', () => {
    const heights = SHAPES.map(({ weight, measureEm }) =>
      qcf4ContinuousPageHeight(PAGE_WIDTH, 1, weight, measureEm)
    );

    expect(heights[0]).toBeLessThan(heights[1]);
    expect(heights[1]).toBeLessThan(heights[2]);
  });

  it('brings more of the Mushaf on screen as the size steps down', () => {
    const { sm, md, lg, xl } = QCF4_FONT_SCALE_MULTIPLIERS;
    const heights = [sm, md, lg, xl].map((scale) =>
      qcf4ContinuousPageHeight(PAGE_WIDTH, scale, ORDINARY.weight, ORDINARY.measureEm)
    );

    expect(heights).toEqual([...heights].sort((a, b) => a - b));
    expect(qcf4LineFontSize(PAGE_WIDTH, sm, ORDINARY.measureEm)).toBeLessThan(
      qcf4LineFontSize(PAGE_WIDTH, xl, ORDINARY.measureEm)
    );
  });

  it('never sets a line wider than the page can hold', () => {
    // xl is the print scale — the largest a fixed-line page can be set at a
    // given width, so no pick may ask for more than the measure.
    expect(Math.max(...Object.values(QCF4_FONT_SCALE_MULTIPLIERS))).toBe(1);
  });
});
