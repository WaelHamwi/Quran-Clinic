import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';
import { radius, spacing } from '@/theme/spacing';

export const aboutUsScreenStyles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: 20,
    alignItems: 'center',
  },

  /* ── Brand logo (same 3-SVG layout as login, scaled to 83×137) ── */
  logoBlock: {
    width: 83,
    height: 137,
    marginBottom: 8,
  },
  logoTop: {
    position: 'absolute',
    top: 0,
    right: '2.63%',
    bottom: '41.54%',
    left: '4.45%',
  },
  logoMid: {
    position: 'absolute',
    top: '66.85%',
    right: '0.84%',
    bottom: '21.42%',
    left: '0.46%',
  },
  logoBottom: {
    position: 'absolute',
    top: '83.47%',
    right: '0.46%',
    bottom: '0.09%',
    left: '1.37%',
  },

  /* ── White content card ──────────────────────────────────────── */
  card: {
    width: '100%',
    backgroundColor: palette.white,
    borderRadius: radius.md,
    paddingVertical: 30,
    paddingHorizontal: 20,
    gap: 16,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },

  /* ── Divider ─────────────────────────────────────────────────── */
  divider: {
    height: 1,
    backgroundColor: palette.border.secondary,
    width: '100%',
  },

  /* ── Section ─────────────────────────────────────────────────── */
  section: {
    gap: 8,
    width: '100%',
  },
  sectionTitle: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: 16,
    lineHeight: 24,
    color: palette.secondaryGreen[600],
    textAlign: 'left',
  },
  sectionTitleRtl: { textAlign: 'right' },
  sectionBody: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.secondary,
    textAlign: 'left',
  },
  sectionBodyRtl: { textAlign: 'right' },

  /* ── Bullet list item ────────────────────────────────────────── */
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletRowLtr: { flexDirection: 'row-reverse' },
  bullet: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.secondary,
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.secondary,
    textAlign: 'right',
  },
  bulletTextLtr: { textAlign: 'left' },
});
