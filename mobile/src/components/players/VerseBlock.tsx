import React, { useEffect, useMemo, useRef } from 'react';
import { Text, View } from 'react-native';
import { usePlayer } from '@/hooks/player/usePlayer';
import { useReadingSurface } from '@/hooks/player/useReadingSurface';
import { useLanguage } from '@/context/LanguageContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles, lineHeightRatio } from './WirdReader.styles';
import type { Translatable } from '@/types/translatable';

interface Props {
  text: Translatable;
  /** Only the session being played tracks the position and reports scroll targets. */
  live: boolean;
  onActiveRowY?: (y: number) => void;
}

function VerseBlockBase({ text, live, onActiveRowY }: Props) {
  const { position, duration } = usePlayer();
  const { textColor, fontSize } = useReadingSurface();
  const { isArabic } = useLanguage();
  const s = useStyles(createStyles);
  const yPositions = useRef<number[]>([]);

  const raw = (isArabic ? text.ar : (text.en ?? text.ar)) ?? '';

  const verses = useMemo(
    () => raw.split(/\(\d+\)/).map((v) => v.trim()).filter(Boolean),
    [raw],
  );

  const activeIndex = useMemo(() => {
    if (!live || duration <= 0 || verses.length === 0) return -1;
    const verseDuration = duration / verses.length;
    const idx = Math.floor(position / verseDuration);
    return Math.min(idx, verses.length - 1);
  }, [position, duration, verses.length, live]);

  useEffect(() => {
    const y = yPositions.current[activeIndex];
    if (activeIndex >= 0 && y !== undefined) onActiveRowY?.(y);
  }, [activeIndex, onActiveRowY]);

  return (
    <View style={s.sessionBlock}>
      {verses.map((verse, i) => {
        const active = i === activeIndex;
        return (
          <View
            key={i}
            style={[s.segmentWrap, active && s['segmentWrap--active']]}
            onLayout={(e) => { yPositions.current[i] = e.nativeEvent.layout.y; }}
          >
            <Text
              style={[
                s.segment,
                { color: textColor, fontSize, lineHeight: fontSize * lineHeightRatio(isArabic) },
                isArabic && s['segment--rtl'],
                active && (isArabic ? s['segment--rtlActive'] : s['segment--active']),
              ]}
            >
              {verse}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export const VerseBlock = React.memo(VerseBlockBase);
