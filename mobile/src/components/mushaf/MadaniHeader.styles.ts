import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { palette } from '@/theme/colors';
import { radius } from '@/theme/spacing';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';

// The Madani reader shares the classic reader's fixed parchment/ornament
// surface — palette.mushaf/bg.overlay refs are the same documented exception
// as reader.styles.ts (deliberately constant across light/dark).
export const createStyles = (_theme: Theme) =>
  StyleSheet.create({
    header: {
      backgroundColor: palette.bg.overlay,
      borderBottomWidth: 1,
      borderBottomColor: palette.border.tertiary,
      paddingHorizontal: 16,
      // Slimmer than the classic reader's header — Madani carries an extra
      // title row (surah name + page/juz) on top of the icon toolbar, so it
      // needs to give back vertical space elsewhere for the 15-line page
      // grid below it.
      paddingVertical: 6,
    },
    // Landscape: the 15-line page grid is fighting a much shorter viewport
    // (screen height becomes the short axis), so every dp the header can
    // give back matters — merged with title+subtitle collapsing onto one
    // line (see the screen component) this is the header's landscape floor.
    headerCompact: {
      paddingVertical: 2,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    rowRtl: {
      flexDirection: 'row-reverse',
    },
    // toolbar.navRow (shared with the classic reader) has no justifyContent,
    // so its icons cluster at the row's flex-start edge — visually the
    // right side once rowRtl reverses the direction for Arabic. Scoped here
    // (not on the shared style) so the classic reader's own toolbar layout
    // is untouched.
    toolbarCenter: {
      justifyContent: 'center',
    },
    navBtn: {
      width: 36,
      height: 36,
      borderRadius: radius.pill,
      justifyContent: 'center',
      alignItems: 'center',
    },
    center: {
      flex: 1,
      alignItems: 'center',
    },
    title: {
      color: palette.text.secondary,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      fontFamily: fontFamily.alexandria,
      textAlign: 'center',
    },
    sub: {
      color: palette.text.tertiary,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      fontFamily: fontFamily.alexandriaLight,
    },
  });
