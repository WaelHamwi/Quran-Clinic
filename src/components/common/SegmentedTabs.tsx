import React, { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { fontFamily } from '@/theme/typography';

/** SegmentedTabs — Figma "Section Card Variant5/Variant6" pill toggle
 *  (17980:993, 18022:770). Section card pill values:
 *   - inactive pill: bg #ffffff (Background/bg-primary),
 *                    border #d5d7da (Border/border-primary), pill 999, px-12 py-6
 *   - active pill:   bg #135452 (Brand/Primary/500), no border, text #ffffff
 *   - label:         Alexandria Medium 14/20 (Text sm/Medium) */
const FIGMA = {
  brand500: '#135452',
  bgPrimary: '#ffffff',
  borderPrimary: '#d5d7da',
  textSecondary: '#414651',
  onBrand: '#ffffff',
} as const;

export interface SegmentTab {
  key: string;
  label: string;
}

interface SegmentedTabsProps {
  tabs: SegmentTab[];
  activeKey: string;
  onChange: (key: string) => void;
}

interface SegmentProps {
  tab: SegmentTab;
  active: boolean;
  onChange: (key: string) => void;
}

function Segment({ tab, active, onChange }: SegmentProps) {
  const handlePress = useCallback(() => onChange(tab.key), [onChange, tab.key]);
  return (
    <Pressable onPress={handlePress} style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
    </Pressable>
  );
}

function SegmentedTabsBase({ tabs, activeKey, onChange }: SegmentedTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {tabs.map((tab) => (
        <Segment
          key={tab.key}
          tab={tab}
          active={tab.key === activeKey}
          onChange={onChange}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: FIGMA.bgPrimary,
    borderWidth: 1,
    borderColor: FIGMA.borderPrimary,
  },
  pillActive: { backgroundColor: FIGMA.brand500, borderColor: FIGMA.brand500 },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.alexandriaMedium,
    color: FIGMA.textSecondary,
  },
  labelActive: { color: FIGMA.onBrand, fontFamily: fontFamily.alexandriaSemiBold },
});

export const SegmentedTabs = React.memo(SegmentedTabsBase);
