import React, { useEffect, useMemo, useRef } from 'react';
import { RefreshControl, ScrollView, Text } from 'react-native';
import { palette } from '@/theme/colors';
import { usePlayer } from '@/hooks/usePlayer';
import { useLanguage } from '@/context/LanguageContext';
import { karaokeTextStyles as s } from './KaraokeText.styles';
import type { Segment } from '@/types/recording';

interface Props {
  segments: Segment[];
  refreshing?: boolean;
  onRefresh?: () => void;
}

function KaraokeTextBase({ segments, refreshing, onRefresh }: Props) {
  const { position, textColor, fontSize, isDarkMode } = usePlayer();
  const { isArabic } = useLanguage();
  const scrollRef = useRef<ScrollView>(null);
  const yPositions = useRef<number[]>([]);

  const activeIndex = useMemo(() => {
    for (let i = 0; i < segments.length; i++) {
      if (position >= segments[i].start && position < segments[i].end) return i;
    }
    return -1;
  }, [segments, position]);

  useEffect(() => {
    const y = yPositions.current[activeIndex];
    if (activeIndex >= 0 && y !== undefined) {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 80), animated: true });
    }
  }, [activeIndex]);

  return (
    <ScrollView
      ref={scrollRef}
      style={[s.scroll, isDarkMode && { backgroundColor: palette.brand[700] }]}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing ?? false}
            onRefresh={onRefresh}
            tintColor={palette.brand[500]}
            colors={[palette.brand[500]]}
          />
        ) : undefined
      }
    >
      {segments.map((seg, i) => {
        const text = isArabic ? seg.text_ar : seg.text_en;
        if (!text) return null;
        const active = i === activeIndex;
        return (
          <Text
            key={i}
            onLayout={(e) => { yPositions.current[i] = e.nativeEvent.layout.y; }}
            style={[
              s.segment,
              { color: textColor, fontSize, lineHeight: fontSize * 1.625 },
              active && s['segment--active'],
              isArabic && s['segment--rtl'],
            ]}
          >
            {text}
          </Text>
        );
      })}
    </ScrollView>
  );
}

export const KaraokeText = React.memo(KaraokeTextBase);
