import React, { memo, useState } from 'react';
import { Text, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import { useStyles } from '@/hooks/common/useStyles';
import type { Qcf4Line, Qcf4Word } from '@/types/qcf4';
import { createStyles } from './MadaniPageLine.styles';

type Props = {
  line: Qcf4Line;
  fontSize: number;
  /** Width of this page's widest line in em — the measure a flush line is set
   *  to, so `fontSize * measureEm` is what filling the page looks like here. */
  measureEm: number;
  slotStyle: StyleProp<ViewStyle>;
  /** verse_key ("2:255") of the verse currently being recited — every word
   *  belonging to it is styled active. Undefined/null renders unhighlighted. */
  highlightVerseKey?: string | null;
};

// Share of the measure-filling width (fontSize × the font's calibration) that
// marks a line the print sets flush to both margins. Below it the line is one
// the Mushaf itself centres — a surah's closing line, or any line of
// al-Fatihah — and spreading it edge to edge would tear its words apart.
const FLUSH_LINE_SHARE = 0.9;

// An ayah's end medallion is set tight against the word it closes, so it rides
// in that word's box — justification must never open a gap between them.
// Grouping is limited to words sharing a verse (hence a highlight state) and a
// font, so a group stays one Text node with one family.
function groupWords(words: Qcf4Word[]): Qcf4Word[][] {
  const groups: Qcf4Word[][] = [];
  for (const word of words) {
    const prev = groups[groups.length - 1];
    const head = prev?.[0];
    if (word.type === 'end' && head && head.verse_key === word.verse_key && head.font === word.font) {
      prev.push(word);
    } else {
      groups.push([word]);
    }
  }
  return groups;
}

// QCF glyph codes live in the Unicode Private Use Area (bidi class L), so a
// naturally RTL line renders LTR unless the word order is reversed in JS.
function MadaniPageLineInner({ line, fontSize, measureEm, slotStyle, highlightVerseKey }: Props) {
  const styles = useStyles(createStyles);

  const isSurahHeader = line.words[0]?.type === 'surah_header';
  const groups = groupWords(line.words).reverse();

  // Measured once per size, off the centred pass: spreading the line widens it
  // to the whole slot, so reading that width back would report every line as
  // flush and there would be nothing left to decide.
  const [measured, setMeasured] = useState<{ fontSize: number; width: number } | null>(null);
  const naturalWidth = measured?.fontSize === fontSize ? measured.width : null;
  const onLineLayout = (e: LayoutChangeEvent) => {
    if (naturalWidth != null) return;
    const width = e.nativeEvent.layout.width;
    if (width > 0) setMeasured({ fontSize, width });
  };

  // A flush line's words are spread edge to edge, so it fills the full measure
  // at any font size the way a printed page's justified line does: whatever the
  // size leaves over becomes word spacing instead of dead margins either side.
  // A one-glyph line (surah banner, bismillah) has no gap to spread into.
  const justified =
    groups.length > 1 && naturalWidth != null && naturalWidth >= fontSize * measureEm * FLUSH_LINE_SHARE;

  return (
    <View style={[styles.slot, slotStyle]}>
      <View
        style={[styles.line, justified ? styles.lineJustified : styles.lineCentered]}
        onLayout={onLineLayout}
      >
        {groups.map((group, i) => {
          const head = group[0];
          const active = highlightVerseKey != null && head.verse_key === highlightVerseKey;
          return (
            <Text
              key={`${head.verse_key ?? head.type}-${i}`}
              // fontFamily must sit on the Text that actually renders the glyphs:
              // Android silently falls back to the system font otherwise, which
              // has no glyphs for these Private-Use-Area codepoints and draws
              // them as tofu boxes (facebook/react-native#20398, #24697).
              style={[
                styles.text,
                { fontSize, fontFamily: head.font },
                isSurahHeader && styles.surahHeaderText,
                // The QBSML banner glyph's ink extends closer to (and sometimes past)
                // the font's own ascent/descent metrics than regular ayat text, so
                // includeFontPadding:false (set on styles.text, for tight ayat line
                // spacing) clips its bottom edge here — this restores headroom and
                // gives the line box explicit extra height to contain it.
                isSurahHeader && { includeFontPadding: true, lineHeight: fontSize * 1.35 },
                active && styles.wordActive,
              ]}
              numberOfLines={1}
              allowFontScaling={false}
            >
              {group
                .slice()
                .reverse()
                .map((word) => word.char)
                .join('')}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

export const MadaniPageLine = memo(MadaniPageLineInner);
