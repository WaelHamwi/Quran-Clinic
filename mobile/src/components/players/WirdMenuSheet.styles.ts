import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';
import { radius } from '@/theme/spacing';

// Modal scrim — component-local, not a design-system token
const MODAL_SCRIM = 'rgba(0,0,0,0.4)';

export const wirdMenuStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: MODAL_SCRIM,
    justifyContent: 'flex-end',
  },
  // Figma node 18975:3626 — bottom sheet, gap 20
  sheet: {
    backgroundColor: palette.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderTopWidth: 1,
    borderColor: palette.border.secondary,
    paddingTop: 12,
    paddingHorizontal: 20,
    maxHeight: '80%',
  },
  handle: {
    alignSelf: 'center',
    width: 60,
    height: 4,
    borderRadius: radius.lg,
    backgroundColor: palette.gray[200],
    marginBottom: 16,
  },
  title: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 16,
    lineHeight: 24,
    color: palette.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  list: {
    gap: 12,
    paddingBottom: 4,
  },
  // Figma node 18976:3742 — section card, padding 12
  row: {
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.border.secondary,
    borderRadius: radius.md,
    padding: 12,
  },
  'row--active': {
    borderColor: palette.brand[500],
    backgroundColor: palette.brand[25],
  },
  labelGroup: {
    alignItems: 'center',
    gap: 12,
  },
  name: {
    fontFamily: fontFamily.alexandria,
    fontSize: 14,
    lineHeight: 20,
    color: palette.brand[500],
  },
  numberBadge: {
    width: 40,
    minHeight: 40,
    borderRadius: radius.md,
    backgroundColor: palette.brand[25],
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  numberText: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 16,
    lineHeight: 24,
    color: palette.brand[500],
    textAlign: 'center',
  },
});
