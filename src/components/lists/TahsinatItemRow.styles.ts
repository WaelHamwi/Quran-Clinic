import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export const tahsinatItemRowStyles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: palette.border.primary,
  },
  cardDone: { borderColor: palette.brand[500] },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: palette.brand[25],
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontFamily: fontFamily.alexandriaBold,
    fontSize: 12,
    lineHeight: 18,
    color: palette.brand[500],
  },
  applicabilityText: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 10,
    lineHeight: 16,
    color: palette.text.tertiary,
  },

  arabic: {
    fontFamily: fontFamily.arabic,
    fontSize: 24,
    lineHeight: 44,
    color: palette.text.primary,
    textAlign: 'right',
    writingDirection: 'rtl',
  },

  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: palette.brand[25],
  },
  counterDone: { backgroundColor: palette.brand[500] },
  counterText: {
    fontFamily: fontFamily.alexandriaBold,
    fontSize: 14,
    lineHeight: 20,
    color: palette.brand[500],
  },
  counterTextDone: { color: palette.text.onBrand },

  hintBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hintLabel: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 14,
    lineHeight: 20,
    color: palette.secondaryGreen[600],
  },
  hintText: {
    fontFamily: fontFamily.alexandria,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.secondary,
    backgroundColor: palette.brand[25],
    padding: 12,
    borderRadius: 8,
  },
});
