import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export const optionPickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: palette.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: palette.border.secondary,
  },
  handleWrap: { alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
  handle: {
    width: 60,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.border.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.border.tertiary,
  },
  title: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: 16,
    lineHeight: 24,
    color: palette.text.primary,
  },
  closeBtn: { padding: 4 },
  list: { paddingHorizontal: 12, paddingTop: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 4,
  },
  rowActive: { backgroundColor: palette.brand[25] },
  rowLabel: {
    fontFamily: fontFamily.alexandria,
    fontSize: 15,
    lineHeight: 22,
    color: palette.text.secondary,
  },
  rowLabelActive: {
    fontFamily: fontFamily.alexandriaMedium,
    color: palette.brand[500],
  },
});
