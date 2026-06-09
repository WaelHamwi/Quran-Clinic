import React, { useEffect, useMemo, useRef } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { palette } from '@/theme/colors';
import { usePlayer } from '@/hooks/usePlayer';
import { useLanguage } from '@/context/LanguageContext';
import { karaokeTextStyles as s } from './KaraokeText.styles';
import type { Translatable } from '@/types/translatable';

interface Props {
  text: Translatable;
  refreshing?: boolean;
  onRefresh?: () => void;
}

function VerseTextBase({ text, refreshing, onRefresh }: Props) {
  const { position, duration, textColor, fontSize, isDarkMode } = usePlayer();
  const { isArabic } = useLanguage();
  const scrollRef = useRef<ScrollView>(null);
  const yPositions = useRef<number[]>([]);

  const raw = (isArabic ? text.ar : (text.en ?? text.ar)) ?? '';

  const verses = useMemo(
    () => raw.split(/\(\d+\)/).map((v) => v.trim()).filter(Boolean),
    [raw],
  );

  const activeIndex = useMemo(() => {
    if (duration <= 0 || verses.length === 0) return -1;
    const verseDuration = duration / verses.length;
    const idx = Math.floor(position / verseDuration);
    return Math.min(idx, verses.length - 1);
  }, [position, duration, verses.length]);

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
                { color: textColor, fontSize, lineHeight: fontSize * 1.625 },
                active && s['segment--active'],
                isArabic && s['segment--rtl'],
              ]}
            >
              {verse}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

export const VerseText = React.memo(VerseTextBase);
