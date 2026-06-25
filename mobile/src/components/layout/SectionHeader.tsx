import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { palette, type Theme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontSize, fontWeight, fontFamily } from '@/theme/typography';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  /** 'centered' = Figma-style centered teal heading. 'row' = title left, action right. */
  align?: 'centered' | 'row';
}

function SectionHeaderBase({ title, actionLabel, onAction, align = 'centered' }: SectionHeaderProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (align === 'centered' && !actionLabel) {
    return (
      <View style={styles.centeredWrap}>
        <Text style={styles.centeredTitle}>{title}</Text>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.sm,
    },
    title: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold,
      color: theme.text,
      fontFamily: fontFamily.alexandriaSemiBold,
    },
    action: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      color: theme.primary,
      fontFamily: fontFamily.alexandriaMedium,
    },
    centeredWrap: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
      alignItems: 'center',
    },
    centeredTitle: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.semibold,
      color: palette.brand[500],
      fontFamily: fontFamily.madani,
    },
  });
}

export const SectionHeader = React.memo(SectionHeaderBase);
