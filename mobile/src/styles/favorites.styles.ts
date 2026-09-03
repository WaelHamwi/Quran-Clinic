import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';

// Figma 18284:3422 — 20px gap between the "Play all" CTA and the list.
export const createStyles = (_theme: Theme) =>
  StyleSheet.create({
    playAllWrap: { marginBottom: 20 },
  });
