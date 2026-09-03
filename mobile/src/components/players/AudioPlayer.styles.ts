import { StyleSheet } from 'react-native';
import { palette, type Theme } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

// iOS UISwitch system colors — platform defaults, not design-system tokens.
// palette.accents.green = #34c759 (Apple system green).
export const SWITCH_ON_COLOR = palette.accents.green;
// iOS labels/tertiary at 30% — platform default for the off-state track.
export const SWITCH_OFF_COLOR = 'rgba(60,60,67,0.3)';

// Figma slider track fill — matches iOS UISlider default, documented opacity tint.
const TRACK_BG = 'rgba(120,120,120,0.2)';
// Modal scrim — component-local opacity tint, not a design-system token.
const MODAL_SCRIM = 'rgba(0,0,0,0.4)';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.card,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      borderTopWidth: 1,
      borderTopColor: theme.cardBorder,
    },
    header: {
      paddingTop: spacing.lg,
      paddingBottom: spacing.sm,
      alignItems: 'center',
    },
    dragHandle: {
      width: 60,
      height: 4,
      borderRadius: radius.lg,
      backgroundColor: theme.cardBorder,
    },
    sliderSection: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    sliderTouch: {
      paddingVertical: spacing.sm,
    },
    track: {
      height: 6,
      borderRadius: 3,
      backgroundColor: TRACK_BG,
      overflow: 'hidden',
    },
    fill: {
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.primary,
    },
    timeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.sm,
    },
    time: {
      fontFamily: fontFamily.alexandria,
      fontSize: 12,
      lineHeight: 16,
      color: theme.textMuted,
    },
    controlsSection: {
      paddingHorizontal: 20,
      paddingBottom: spacing.md,
      gap: spacing.xl,
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    playBtn: {
      width: 104,
      height: 60,
      borderRadius: radius.pill,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionRow: {
      flexDirection: 'row',
      gap: spacing.md,
      height: 44,
    },
    actionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: theme.brandSubtle,
      borderRadius: radius.md,
      overflow: 'hidden',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    actionLabel: {
      fontFamily: fontFamily.alexandria,
      fontSize: 12,
      lineHeight: 18,
      color: theme.primary,
    },
    // Download progress, drawn along the button's bottom edge. The button's own
    // overflow:hidden clips it to the rounded corners.
    downloadProgressTrack: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: 3,
      backgroundColor: theme.border,
    },
    // Arabic reads right to left, so the bar has to fill from that edge too.
    downloadProgressTrackRtl: { alignItems: 'flex-end' },
    downloadProgressFill: { height: 3, backgroundColor: theme.primary },

    // ── Playback settings sheet ──────────────────────────────────────────────
    modalBackdrop: {
      flex: 1,
      backgroundColor: MODAL_SCRIM,
      justifyContent: 'flex-end',
    },
    settingsSheet: {
      backgroundColor: theme.card,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      paddingHorizontal: 20,
      paddingBottom: spacing.xxl,
      paddingTop: spacing.md,
      gap: spacing.lg,
      alignItems: 'stretch',
    },
    sheetHandle: {
      width: 60,
      height: 4,
      borderRadius: radius.lg,
      backgroundColor: theme.cardBorder,
      marginBottom: spacing.xs,
    },
    sheetTitle: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: 16,
      lineHeight: 24,
      color: theme.text,
      textAlign: 'center',
    },
    sheetSectionLabel: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: 13,
      lineHeight: 20,
      color: theme.textMuted,
      alignSelf: 'flex-start',
    },
    // Horizontal scroll content — the swatch "slider" flips through many colours.
    colorRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.lg,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xs,
    },
    colorSwatch: {
      width: 52,
      alignItems: 'center',
      gap: 6,
    },
    colorCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 2,
      // Faint outline so white / pale swatches stay visible on the light sheet.
      borderColor: theme.cardBorder,
    },
    colorCircleActive: {
      borderColor: theme.primary,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 4,
    },
    colorLabel: {
      fontFamily: fontFamily.alexandria,
      fontSize: 10,
      lineHeight: 14,
      color: theme.textMuted,
      textAlign: 'center',
    },
    colorLabelActive: {
      color: theme.primary,
      fontFamily: fontFamily.alexandriaMedium,
    },
    closeBtn: {
      alignSelf: 'center',
      backgroundColor: theme.brandSubtle,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: 48,
      alignItems: 'center',
    },
    closeBtnText: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: 14,
      lineHeight: 20,
      color: theme.primary,
    },

    // ── Settings sections ────────────────────────────────────────────────────
    settingsDivider: {
      height: 1,
      backgroundColor: theme.divider,
    },
    settingsToggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    settingsToggleLabel: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: 14,
      lineHeight: 20,
      color: theme.text,
    },
    settingsSectionWrap: {
      gap: spacing.xs,
    },
    settingsSectionTitle: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: 14,
      lineHeight: 20,
      color: theme.text,
      textAlign: 'right',
    },

    // ── Speed chips (Mushaf-style, light sheet) ──────────────────────────────
    // ── Font size chips (each shows the glyph at its actual size) ─────────────
    fontRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    fontChip: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
      borderRadius: radius.pill,
      backgroundColor: theme.brandSubtle,
    },
    fontChipActive: {
      backgroundColor: theme.primary,
    },
    fontChipText: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: 13,
      lineHeight: 18,
      color: theme.primary,
    },
    fontChipTextActive: {
      color: theme.textOnBrand,
    },
  });
