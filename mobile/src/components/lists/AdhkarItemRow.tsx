import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '@/context/LanguageContext';
import { fontFamily } from '@/theme/typography';
import { pickText } from '@/utils/formatters';
import type { AdhkarItem } from '@/types/adhkar';

/** AdhkarItemRow — Figma "Morning" Section Card (18524:2887).
 *  Variable defs lifted verbatim:
 *   - Background:    Background/bg-primary #ffffff
 *   - Border:        Border/border-primary #d5d7da (active row uses brand-500)
 *   - Accents/Green: #34c759 (daleel link / done state)
 *   - text-primary:  #181d27 (Arabic verse)
 *   - text-secondary #414651 (body fallback)
 *   - text-tertiary: #535862 (repetitions hint)
 *   - 2xs/Regular:   Alexandria Light 10/16
 *   - sm/Medium:     Alexandria Regular 14/20
 *   - sm/Semibold:   Alexandria Medium 14/20
 *   - Corner Radius/infinite 999 (pills) */
const FIGMA = {
  bgPrimary: '#ffffff',
  borderPrimary: '#d5d7da',
  brand500: '#135452',
  brand25: '#ebfafa',
  accentGreen: '#34c759',
  textPrimary: '#181d27',
  textSecondary: '#414651',
  textTertiary: '#535862',
  onBrand: '#ffffff',
} as const;

interface AdhkarItemRowProps {
  item: AdhkarItem;
  index: number;
  count: number;
  onCount: (id: number, repetitions: number) => void;
}

function AdhkarItemRowBase({ item, index, count, onCount }: AdhkarItemRowProps) {
  // ─── Logic preserved verbatim ────────────────────────────────────────────────
  const { isArabic, t } = useLanguage();
  const [showDaleel, setShowDaleel] = useState(false);

  const done = count >= item.repetitions;
  const handleCount = useCallback(
    () => onCount(item.id, item.repetitions),
    [onCount, item.id, item.repetitions],
  );
  const toggleDaleel = useCallback(() => setShowDaleel((v) => !v), []);

  const daleel = pickText(item.daleel, isArabic);

  // ─── Figma hierarchy ────────────────────────────────────────────────────────
  return (
    <View style={[styles.card, done && styles.cardDone]}>
      <View style={styles.headerRow}>
        <View style={styles.indexBadge}>
          <Text style={styles.indexText}>{index + 1}</Text>
        </View>
        <Text style={styles.repeats}>{t.adhkar.repetitions(item.repetitions)}</Text>
      </View>

      <Text style={styles.arabic}>{item.text.ar}</Text>

      <View style={styles.actions}>
        <Pressable onPress={handleCount} style={[styles.counter, done && styles.counterDone]}>
          <Text style={[styles.counterText, done && styles.counterTextDone]}>
            {count} / {item.repetitions}
          </Text>
        </Pressable>

        {daleel ? (
          <Pressable onPress={toggleDaleel} style={styles.daleelBtn}>
            <Text style={styles.daleelLabel}>{t.adhkar.daleel}</Text>
          </Pressable>
        ) : null}
      </View>

      {showDaleel && daleel ? <Text style={styles.daleelText}>{daleel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: FIGMA.bgPrimary,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: FIGMA.borderPrimary,
  },
  cardDone: { borderColor: FIGMA.brand500 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  indexBadge: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: FIGMA.brand25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontFamily: fontFamily.alexandriaBold,
    fontSize: 14,
    lineHeight: 20,
    color: FIGMA.brand500,
  },
  repeats: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 10,
    lineHeight: 16,
    color: FIGMA.textTertiary,
  },
  arabic: {
    fontFamily: fontFamily.arabic,
    fontSize: 24,
    lineHeight: 44,
    color: FIGMA.textPrimary,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: FIGMA.brand25,
  },
  counterDone: { backgroundColor: FIGMA.brand500 },
  counterText: {
    fontFamily: fontFamily.alexandriaBold,
    fontSize: 14,
    lineHeight: 20,
    color: FIGMA.brand500,
  },
  counterTextDone: { color: FIGMA.onBrand },
  daleelBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  daleelLabel: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 14,
    lineHeight: 20,
    color: FIGMA.accentGreen,
  },
  daleelText: {
    fontFamily: fontFamily.alexandria,
    fontSize: 14,
    lineHeight: 20,
    color: FIGMA.textSecondary,
    backgroundColor: FIGMA.brand25,
    padding: 12,
    borderRadius: 8,
  },
});

function areEqual(prev: AdhkarItemRowProps, next: AdhkarItemRowProps): boolean {
  return (
    prev.item.id === next.item.id &&
    prev.index === next.index &&
    prev.count === next.count &&
    prev.onCount === next.onCount
  );
}

export const AdhkarItemRow = React.memo(AdhkarItemRowBase, areEqual);
