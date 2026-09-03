import React, { memo } from 'react';
import { ActivityIndicator, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/context/LanguageContext';
import { useStyles } from '@/hooks/common/useStyles';
import { useQcfFonts } from '@/hooks/mushaf/useQcfFonts';
import { qcf4PageMeasures, qcf4PageQueryOptions } from '@/services/mushaf/qcf4Pages';
import {
  QCF4_HEADER_LINE_HEIGHT_RATIO,
  QCF4_LINE_HEIGHT_RATIO,
  QCF4_LINE_HEIGHT_WEIGHTS,
  QCF4_PAGE_CHROME_HEIGHT,
  qcf4LineFontSize,
} from '@/constants/qcf4';
import { palette } from '@/theme/colors';
import { toEastern } from '@/utils/mushafReader';
import type { Qcf4Line, Qcf4Page } from '@/types/qcf4';
import { MadaniPageLine } from './MadaniPageLine';
import { createStyles } from './MadaniPage.styles';

type Props = {
  page: number;
  width: number;
  height: number;
  highlightVerseKey?: string | null;
  /** 1 sets a line at the full measure — the print scale the horizontal pager
   *  always renders at; below it is a smaller size picked in the continuous
   *  pager, whose pages are cut to match (qcf4ContinuousPageHeight). */
  textScale: number;
  /** Fired on a tap anywhere on the page's text surface. Must keep a stable
   *  identity — this component is memoized. */
  onPress?: () => void;
};

function lineHeightWeight(line: Qcf4Line): number {
  return QCF4_LINE_HEIGHT_WEIGHTS[line.words[0]?.type ?? ''] ?? 1;
}

// Width-based sizing multiplier — same intent as the height weights above,
// but for the horizontal axis (surah_header/bismillah render fewer, larger
// glyphs than a full ayah line, which is why they need to be bigger even
// when width alone would size them the same as any other line).
const WIDTH_SIZE_MULTIPLIERS: Partial<Record<string, number>> = { surah_header: 1.5, bismillah: 1.15 };
function widthSizeMultiplier(line: Qcf4Line): number {
  return WIDTH_SIZE_MULTIPLIERS[line.words[0]?.type ?? ''] ?? 1;
}

// surah_header/bismillah render via the QCF4_QBSML font — a different glyph
// shape from regular ayat text (see QCF4_HEADER_LINE_HEIGHT_RATIO) — so they
// need their own, larger height ratio instead of the ayat-tuned default.
const HEADER_LINE_TYPES = new Set(['surah_header', 'bismillah']);
function lineHeightRatio(line: Qcf4Line): number {
  return HEADER_LINE_TYPES.has(line.words[0]?.type ?? '') ? QCF4_HEADER_LINE_HEIGHT_RATIO : QCF4_LINE_HEIGHT_RATIO;
}

function MadaniPageInner({ page, width, height, highlightVerseKey, textScale, onPress }: Props) {
  const { t, isArabic } = useLanguage();
  const styles = useStyles(createStyles);
  const fonts = useQcfFonts(page);
  const { data, isPending, isError, refetch } = useQuery<Qcf4Page>(qcf4PageQueryOptions(page));

  const handleRetry = () => {
    if (isError) void refetch();
    if (fonts.error) fonts.retry();
  };

  if (isError || fonts.error) {
    return (
      <View style={[styles.centered, { width, height }]}>
        <Text style={styles.errorText}>{t.madani.pageLoadError}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.75}>
          <Text style={styles.retryBtnText}>{t.madani.retry}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isPending || !data || !fonts.loaded) {
    return (
      <View style={[styles.centered, { width, height }]}>
        <ActivityIndicator size="small" color={palette.mushaf.titleBorderGold} />
      </View>
    );
  }

  // Two independent caps per line: how big it can be before it no longer
  // fits the page's width, and how big it can be before it no longer fits
  // the vertical slot its weight was allocated. The smaller of the two is
  // the rendered size — nothing downstream re-fits a line, so exceeding
  // either cap would spill the text past the page rather than shrink it.
  const measureEm = qcf4PageMeasures()[page - 1];
  const baseWidthFontSize = qcf4LineFontSize(width, textScale, measureEm);
  const totalWeight = data.lines.reduce((sum, line) => sum + lineHeightWeight(line), 0);
  // The slots share the height left after the page number's band, not the
  // page's whole height — overstating it would size a line for room it doesn't
  // get and let the tallest lines run into the footer.
  const unitHeight = Math.max(0, height - QCF4_PAGE_CHROME_HEIGHT) / totalWeight;

  return (
    // Pressable, not a Touchable wrapper: it keeps the page's own layout box and
    // draws no feedback, and the pager's ScrollView still wins the gesture as
    // soon as the touch turns into a swipe, so page-flipping is untouched.
    <Pressable style={[styles.page, { width, height }]} onPress={onPress}>
      <View style={styles.linesFull}>
        {data.lines.map((line) => {
          const weight = lineHeightWeight(line);
          const widthBound = baseWidthFontSize * widthSizeMultiplier(line);
          const heightBound = (unitHeight * weight) / lineHeightRatio(line);
          const lineFontSize = Math.min(widthBound, heightBound);
          const slotStyle = { flex: weight };
          return (
            <MadaniPageLine
              key={line.line}
              line={line}
              fontSize={lineFontSize}
              measureEm={measureEm}
              slotStyle={slotStyle}
              highlightVerseKey={highlightVerseKey}
            />
          );
        })}
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          ﴾ {isArabic ? toEastern(page) : page} ﴿
        </Text>
      </View>
    </Pressable>
  );
}

export const MadaniPage = memo(MadaniPageInner);
