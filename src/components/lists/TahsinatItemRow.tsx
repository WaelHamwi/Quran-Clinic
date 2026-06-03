import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import type { Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontSize, fontWeight, fontFamily } from '@/theme/typography';
import { pickText } from '@/utils/formatters';
import type { TahsinatItem } from '@/types/tahsinat';

interface TahsinatItemRowProps {
  item: TahsinatItem;
  count: number;
  onCount: (id: number, repetitions: number) => void;
}

function TahsinatItemRowBase({ item, count, onCount }: TahsinatItemRowProps) {
  const { theme } = useTheme();
  const { isArabic, t } = useLanguage();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [showHint, setShowHint] = useState(false);

  const done = count >= item.repetitions;
  const handleCount = useCallback(
    () => onCount(item.id, item.repetitions),
    [onCount, item.id, item.repetitions],
  );
  const toggleHint = useCallback(() => setShowHint((v) => !v), []);

  const label = pickText(item.label, isArabic);
  const text = pickText(item.text, true);
  const hint = pickText(item.hint, isArabic);
  const applicabilityLabel = {
    self: t.tahsinat.self,
    others: t.tahsinat.forOthers,
    both: t.tahsinat.both,
  }[item.applicability];

  return (
    <View style={[styles.card, done && styles.cardDone]}>
      <View style={styles.header}>
        {label ? <Text style={styles.label}>{label}</Text> : <View />}
        {applicabilityLabel ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{applicabilityLabel}</Text>
          </View>
        ) : null}
      </View>

      {item.image_url ? (
        <Image
          source={{
            uri: item.image_url,
            // ngrok free tier blocks requests without this header (see CLAUDE.md).
            headers: { 'ngrok-skip-browser-warning': 'true' },
          }}
          style={styles.image}
          contentFit="contain"
        />
      ) : null}

      {text ? <Text style={styles.arabic}>{text}</Text> : null}

      <View style={styles.actions}>
        <Pressable onPress={handleCount} style={[styles.counter, done && styles.counterDone]}>
          <Ionicons
            name={done ? 'checkmark-circle' : 'add-circle-outline'}
            size={18}
            color={done ? '#fff' : theme.primary}
          />
          <Text style={[styles.counterText, done && styles.counterTextDone]}>
            {count} / {item.repetitions}
          </Text>
        </Pressable>

        {hint ? (
          <Pressable onPress={toggleHint} style={styles.hintBtn}>
            <Ionicons name="information-circle-outline" size={16} color={theme.accent} />
            <Text style={styles.hintLabel}>{t.tahsinat.hint}</Text>
          </Pressable>
        ) : null}
      </View>

      {showHint && hint ? <Text style={styles.hintText}>{hint}</Text> : null}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: theme.border,
    },
    cardDone: { borderColor: theme.primary },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    label: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: theme.primary, flexShrink: 1 },
    badge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.pill,
      backgroundColor: theme.primaryLight,
    },
    badgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: theme.primaryDark },
    image: { width: '100%', height: 200, borderRadius: radius.md },
    arabic: {
      fontFamily: fontFamily.arabic,
      fontSize: 22,
      lineHeight: 40,
      color: theme.text,
      textAlign: 'right',
      writingDirection: 'rtl',
    },
    actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    counter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: theme.primaryLight,
    },
    counterDone: { backgroundColor: theme.primary },
    counterText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: theme.primaryDark },
    counterTextDone: { color: '#fff' },
    hintBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    hintLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: theme.accent },
    hintText: {
      fontSize: fontSize.sm,
      color: theme.textSecondary,
      lineHeight: 22,
      backgroundColor: theme.background,
      padding: spacing.md,
      borderRadius: radius.md,
    },
  });
}

function areEqual(prev: TahsinatItemRowProps, next: TahsinatItemRowProps): boolean {
  return (
    prev.item.id === next.item.id &&
    prev.count === next.count &&
    prev.onCount === next.onCount
  );
}

export const TahsinatItemRow = React.memo(TahsinatItemRowBase, areEqual);
