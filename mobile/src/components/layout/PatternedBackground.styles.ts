import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';

export const createStyles = (_theme: Theme) =>
  StyleSheet.create({
    pattern: { width: '100%', height: '100%', opacity: 0.03 },
  });
