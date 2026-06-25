import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export const ICON_COLOR = palette.brand[500];
export const HANDLE_COLOR = palette.border.primary;
export const CHEVRON_COLOR = palette.text.tertiary;

// Figma node 18284:3426 "Section Card" — a single favorited disease row.
export const favoriteRowStyles = StyleSheet.create({
  row: {
    // flexDirection set inline from `isArabic`.
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.border.secondary,
    borderRadius: 16,
    padding: 12,
    width: '100%',
    overflow: 'hidden',
  },
  'row--pressed': { opacity: 0.85 },
  // Figma 18284:3427 — the row being dragged lifts onto a brand-tinted card.
  'row--active': {
    backgroundColor: palette.brand[25],
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  row__handle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row__content: {
    // flexDirection set inline from `isArabic`. Gap between the icon/text
    // cluster and the drag handle (Figma group 18284:3086 → gap-8).
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  row__inner: {
    // flexDirection set inline from `isArabic`. Gap between text and icon
    // bubble (Figma inner group 18126:2065 → gap-12).
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
  },
  row__texts: {
    gap: 4,
    flexShrink: 1,
  },
  row__title: {
    fontFamily: fontFamily.alexandria,
    fontSize: 14,
    lineHeight: 20,
    color: palette.brand[500],
  },
  row__subtitle: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 12,
    lineHeight: 18,
    color: palette.text.tertiary,
  },
  row__iconBubble: {
    backgroundColor: palette.brand[25],
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row__iconImage: { width: 32, height: 32 },
});
