import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectActiveToast, dismissToast } from '@/store/slices/uiSlice';
import type { Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontSize } from '@/theme/typography';

const TOAST_DURATION_MS = 2600;

/** Global toast renderer — mounted once in the root layout. */
export function Toast() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const toast = useAppSelector(selectActiveToast);
  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => dispatch(dismissToast()), TOAST_DURATION_MS);
    return () => clearTimeout(id);
  }, [toast, dispatch]);

  if (!toast) return null;

  const bg =
    toast.type === 'error'
      ? theme.error
      : toast.type === 'success'
        ? theme.primary
        : theme.text;

  return (
    <View style={[styles.wrap, { bottom: insets.bottom + 72 }]} pointerEvents="none">
      <View style={[styles.toast, { backgroundColor: bg }]}>
        <Text style={styles.text}>{toast.message}</Text>
      </View>
    </View>
  );
}

function createStyles(_theme: Theme) {
  return StyleSheet.create({
    wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
    toast: {
      maxWidth: '88%',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: radius.pill,
    },
    text: { color: '#fff', fontSize: fontSize.sm, textAlign: 'center' },
  });
}
