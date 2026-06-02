import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import type { Theme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontSize } from '@/theme/typography';

interface LoaderProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'small' | 'large';
}

function LoaderBase({ message, fullScreen = false, size = 'large' }: LoaderProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={fullScreen ? styles.fullScreen : styles.inline}>
      <ActivityIndicator size={size} color={theme.primary} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    fullScreen: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background,
      gap: spacing.md,
    },
    inline: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
    message: { color: theme.textSecondary, fontSize: fontSize.sm },
  });
}

export const Loader = React.memo(LoaderBase);
