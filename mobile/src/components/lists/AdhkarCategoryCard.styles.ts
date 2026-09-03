import { StyleSheet } from 'react-native';
import { palette, type Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';

type SubtitleKey =
  | 'morningDesc'
  | 'eveningDesc'
  | 'sleepDesc'
  | 'wakingDesc'
  | 'tahsinSelfDesc'
  | 'tahsinOthersDesc';

interface SlugMeta {
  tileColor: string;
  icon: string;
  subtitleKey: SubtitleKey;
}

const TAHSIN_SELF: SlugMeta = {
  tileColor: palette.tile.blue,
  icon: 'shield-checkmark-outline',
  subtitleKey: 'tahsinSelfDesc',
};

const TAHSIN_OTHERS: SlugMeta = {
  tileColor: palette.tile.rose,
  icon: 'people-outline',
  subtitleKey: 'tahsinOthersDesc',
};

// Icon tile bg colors — Figma 18063:1291–1293 (decorative tints from the palette).
export const SLUG_META: Record<string, SlugMeta> = {
  morning: { tileColor: palette.tile.green,           icon: 'sunny-outline',  subtitleKey: 'morningDesc' },
  evening: { tileColor: palette.tile.purple,          icon: 'moon-outline',   subtitleKey: 'eveningDesc' },
  sleep:   { tileColor: palette.system.warning[500],  icon: 'bed-outline',    subtitleKey: 'sleepDesc'   },
  waking:  { tileColor: palette.brand[500],           icon: 'alarm-outline',  subtitleKey: 'wakingDesc'  },
  'tahsin-self':   TAHSIN_SELF,
  'tahsin-others': TAHSIN_OTHERS,
  // The two tahsin categories were added from the CMS, which derived their slug
  // from the Arabic name — alias those onto the same meta.
  'تحصين النفس': TAHSIN_SELF,
  'تحصين الغير': TAHSIN_OTHERS,
};

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.card,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      padding: spacing.md,
      gap: spacing.md,
      overflow: 'hidden',
    },
    'card--pressed': { opacity: 0.85 },
    right: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      justifyContent: 'flex-end',
    },
    texts: {
      flex: 1,
      gap: spacing.xs,
      alignItems: 'flex-end',
    },
    title: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.primary,
      textAlign: 'right',
    },
    subtitle: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.textMuted,
      textAlign: 'right',
    },
    iconTile: {
      padding: spacing.md,
      borderRadius: radius.sm + radius.xs, // 12 — matches Figma tile
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconImage: {
      width: 32,
      height: 32,
    },
  });
