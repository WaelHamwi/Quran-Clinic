import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';
import { radius } from '@/theme/spacing';

export const ICON_BRAND = palette.brand[500];
export const CLEAR_COLOR = palette.system.error[500];
export const EMPTY_ICON_COLOR = palette.text.placeholder;

export const notificationInboxStyles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
    flexGrow: 1,
  },

  // ── Notification row ───────────────────────────────────────────
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: palette.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border.secondary,
    padding: 12,
  },
  itemUnread: {
    borderColor: palette.brand[50],
    backgroundColor: palette.brand[25],
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.brand[25],
  },
  itemTexts: {
    flex: 1,
    gap: 2,
    alignItems: 'flex-end',
  },
  itemTitle: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.primary,
    textAlign: 'right',
  },
  itemBody: {
    fontFamily: fontFamily.alexandria,
    fontSize: 12,
    lineHeight: 18,
    color: palette.text.secondary,
    textAlign: 'right',
  },
  itemTime: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 10,
    lineHeight: 16,
    color: palette.text.tertiary,
    textAlign: 'right',
  },

  // ── Clear-all action ───────────────────────────────────────────
  clearBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  clearText: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: 14,
    lineHeight: 20,
    color: palette.system.error[500],
    textAlign: 'center',
  },

  // ── Empty state ────────────────────────────────────────────────
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 16,
    lineHeight: 24,
    color: palette.text.secondary,
    textAlign: 'center',
  },
  emptyDesc: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 13,
    lineHeight: 20,
    color: palette.text.tertiary,
    textAlign: 'center',
  },
});
