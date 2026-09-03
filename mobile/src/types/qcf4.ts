export type Qcf4WordType = 'word' | 'end' | 'surah_header' | 'bismillah' | 'quarter';

export interface Qcf4Word {
  /** The glyph character — only renders correctly with the QCF4 font named in `font`. */
  char: string;
  font: string;
  type: Qcf4WordType;
  /** Absent on surah_header/bismillah words (they aren't recited/highlighted). */
  verse_key: string;
}

export interface Qcf4Line {
  line: number;
  words: Qcf4Word[];
}

export interface Qcf4PageSurah {
  id: number;
  name: string;
  name_arabic: string;
  verse_start: number;
  verse_end: number;
}

export interface Qcf4Page {
  page: number;
  font: string;
  surahs: Qcf4PageSurah[];
  lines: Qcf4Line[];
}
