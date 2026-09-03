import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';

/** Figma sponsor splash (node 18511:2993) — centered logo + name. */
export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.background,
    },
    safe: { flex: 1 },
    body: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 100,
      gap: 30,
    },
    label: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: theme.text,
      textAlign: 'center',
    },
    logoWrap: {
      width: 228,
      height: 228,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoImg: { width: '100%', height: '100%' },
    nameAr: {
      fontFamily: fontFamily.madani,
      fontSize: fontSize.xl,
      lineHeight: lineHeight.xl,
      color: theme.text,
      textAlign: 'center',
    },
  });
