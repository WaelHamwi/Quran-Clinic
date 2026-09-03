import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';

export const createStyles = (_theme: Theme) =>
  StyleSheet.create({
    wrap: {
      flex: 1,
    },
  });
