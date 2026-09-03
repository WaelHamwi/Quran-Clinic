import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Text, View } from 'react-native';
import { usePlayer } from '@/hooks/player/usePlayer';
import { useReadingSurface } from '@/hooks/player/useReadingSurface';
import { useLanguage } from '@/context/LanguageContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles, lineHeightRatio } from './WirdReader.styles';
import type { Segment } from '@/types/recording';

interface Props {
  segments: Segment[];
  /** Only the session being played tracks the position and reports scroll targets. */
  live: boolean;
  onActiveRowY?: (y: number) => void;
}

type SegmentRowProps = {
  text: string;
  index: number;
  active: boolean;
  textColor: string;
  fontSize: number;
  isArabic: boolean;
  styles: ReturnType<typeof createStyles>;
  onLayoutY: (index: number, y: number) => void;
};

// The parent re-renders ~4×/sec while audio plays (position updates); memoized
// rows keep that to the two segments whose `active` flag actually flipped.
const SegmentRow = React.memo(function SegmentRow({
  text,
  index,
  active,
  textColor,
  fontSize,
  isArabic,
  styles: s,
  onLayoutY,
}: SegmentRowProps) {
  return (
    <View
      style={[s.segmentWrap, active && s['segmentWrap--active']]}
      onLayout={(e) => onLayoutY(index, e.nativeEvent.layout.y)}
    >
      <Text
        style={[
          s.segment,
          { color: textColor, fontSize, lineHeight: fontSize * lineHeightRatio(isArabic) },
          isArabic && s['segment--rtl'],
          active && (isArabic ? s['segment--rtlActive'] : s['segment--active']),
        ]}
      >
        {text}
      </Text>
    </View>
  );
});

function KaraokeBlockBase({ segments, live, onActiveRowY }: Props) {
  const { position } = usePlayer();
  const { textColor, fontSize } = useReadingSurface();
  const { isArabic } = useLanguage();
  const s = useStyles(createStyles);
  const yPositions = useRef<number[]>([]);

  const handleLayoutY = useCallback((index: number, y: number) => {
    yPositions.current[index] = y;
  }, []);

  const activeIndex = useMemo(() => {
    if (!live) return -1;
    // Segment start/end are authored in SECONDS (Filament repeater); the player
    // position is milliseconds — compare in the same unit or the highlight
    // races through the whole text within the first second of playback.
    const positionSec = position / 1000;
    for (let i = 0; i < segments.length; i++) {
      if (positionSec >= segments[i].start && positionSec < segments[i].end) return i;
    }
    return -1;
  }, [segments, position, live]);

  useEffect(() => {
    const y = yPositions.current[activeIndex];
    if (activeIndex >= 0 && y !== undefined) onActiveRowY?.(y);
  }, [activeIndex, onActiveRowY]);

  return (
    <View style={s.sessionBlock}>
      {segments.map((seg, i) => {
        const text = isArabic ? seg.text_ar : seg.text_en;
        if (!text) return null;
        return (
          <SegmentRow
            key={i}
            text={text}
            index={i}
            active={i === activeIndex}
            textColor={textColor}
            fontSize={fontSize}
            isArabic={isArabic}
            styles={s}
            onLayoutY={handleLayoutY}
          />
        );
      })}
    </View>
  );
}

export const KaraokeBlock = React.memo(KaraokeBlockBase);
