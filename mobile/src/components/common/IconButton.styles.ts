import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { radius } from '@/theme/spacing';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    button: {
      width: 40,
      height: 40,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filled: { backgroundColor: theme.surface },
    pressed: { opacity: 0.6 },
    disabled: { opacity: 0.4 },
  });
