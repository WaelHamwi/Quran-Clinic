import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '@/context/LanguageContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createReaderStyles } from '@/styles/reader.styles';
import { AUTO_SCROLL_SPEEDS, type AutoScrollSpeed } from '@/hooks/mushaf/useAutoScroll';
import { toEastern } from '@/utils/mushafReader';

type Props = {
  speed: AutoScrollSpeed;
  setSpeed: (s: AutoScrollSpeed) => void;
};

/** Inline 1–5 speed picker shown under the toolbar while auto-scroll runs, so
 *  the pace can be corrected without stopping and restarting it. */
export function AutoScrollSpeedRow({ speed, setSpeed }: Props) {
  const { t, isArabic } = useLanguage();
  const styles = useStyles(createReaderStyles);

  return (
    <View style={[styles.autoScrollRow, isArabic && styles.rowRtl]}>
      <Text style={styles.autoScrollRowLabel}>{t.reader.autoScrollSpeed}</Text>
      {AUTO_SCROLL_SPEEDS.map((level) => {
        const active = speed === level;
        return (
          <TouchableOpacity
            key={level}
            style={[styles.autoScrollChip, active && styles.autoScrollChipActive]}
            onPress={() => setSpeed(level)}
          >
            <Text style={[styles.autoScrollChipText, active && styles.autoScrollChipTextActive]}>
              {isArabic ? toEastern(level) : String(level)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
