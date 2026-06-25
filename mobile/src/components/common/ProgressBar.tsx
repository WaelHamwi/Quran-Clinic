import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import type { Theme } from '@/theme/colors';
import { radius } from '@/theme/spacing';

interface ProgressBarProps {
  /** 0..1 */
  progress: number;
  height?: number;
  color?: string;
}

function ProgressBarBase({ progress, height = 6, color }: ProgressBarProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View style={[styles.track, { height }]}>
      <View
        style={[
          styles.fill,
          { width: `${clamped * 100}%`, backgroundColor: color ?? theme.primary },
        ]}
      />
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    track: {
      width: '100%',
      backgroundColor: theme.border,
      borderRadius: radius.pill,
      overflow: 'hidden',
    },
    fill: { height: '100%', borderRadius: radius.pill },
  });
}

export const ProgressBar = React.memo(ProgressBarBase);
