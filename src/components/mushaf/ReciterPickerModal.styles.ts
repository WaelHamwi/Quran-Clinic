import { Dimensions, StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

const { height: wh } = Dimensions.get('window');

export const PLACEHOLDER_COLOR = palette.text.placeholder;

export const reciterPickerStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: palette.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
  },
  handle: {
    width: 60,
    height: 4,
    borderRadius: 4,
    backgroundColor: palette.border.secondary,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border.secondary,
  },
  title: {
    fontSize: 18,
    lineHeight: 28,
    fontFamily: fontFamily.alexandriaSemiBold,
    color: palette.text.primary,
  },
  closeBtn: { padding: 6 },
  closeBtnText: { fontSize: 18, color: palette.text.tertiary, lineHeight: 22 },

  searchWrap: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border.secondary,
  },
  searchInput: {
    height: 40,
    backgroundColor: palette.white,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.border.primary,
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: fontFamily.alexandriaLight,
    color: palette.text.primary,
  },

  list: { maxHeight: Math.round(wh * 0.45) },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border.secondary,
  },
  rowActive: { backgroundColor: palette.brand[25] },
  rowContent: { flex: 1 },
  rowName: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.alexandriaMedium,
    color: palette.text.primary,
  },
  rowNameActive: {
    color: palette.brand[500],
    fontFamily: fontFamily.alexandriaBold,
  },
  rowNameAr: {
    fontSize: 12,
    lineHeight: 18,
    color: palette.text.tertiary,
    fontFamily: fontFamily.alexandria,
    marginTop: 2,
  },
  check: { fontSize: 18, color: palette.brand[500], marginLeft: 10 },
  noneName: {
    fontSize: 14,
    color: palette.text.tertiary,
    fontFamily: fontFamily.alexandria,
    fontStyle: 'italic',
  },
});
