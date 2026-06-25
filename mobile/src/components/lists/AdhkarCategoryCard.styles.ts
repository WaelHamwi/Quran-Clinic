import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export const ARROW_COLOR = palette.text.tertiary;
export const ICON_ON_TILE = palette.white;
// Fallback tile color for categories whose slug isn't one of the known four.
export const TILE_DEFAULT = palette.brand[500];

// Icon tile bg colors — Figma 18063:1291–1293.
// These shades are specific to adhkar category icon bubbles; not in the global palette.
const TILE_MORNING = '#1ea525';
const TILE_EVENING = '#9a38f0';

type SubtitleKey = 'morningDesc' | 'eveningDesc' | 'sleepDesc' | 'wakingDesc';

interface SlugMeta {
  tileColor: string;
  icon: string;
  subtitleKey: SubtitleKey;
}

export const SLUG_META: Record<string, SlugMeta> = {
  morning: { tileColor: TILE_MORNING,                    icon: 'sunny-outline',  subtitleKey: 'morningDesc' },
  evening: { tileColor: TILE_EVENING,                    icon: 'moon-outline',   subtitleKey: 'eveningDesc' },
  sleep:   { tileColor: palette.system.warning[500],     icon: 'bed-outline',    subtitleKey: 'sleepDesc'   },
  waking:  { tileColor: palette.brand[500],              icon: 'alarm-outline',  subtitleKey: 'wakingDesc'  },
};

export const adhkarCategoryCardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border.secondary,
    padding: 12,
    gap: 12,
    overflow: 'hidden',
  },
  'card--pressed': { opacity: 0.85 },
  right: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'flex-end',
  },
  texts: {
    flex: 1,
    gap: 4,
    alignItems: 'flex-end',
  },
  title: {
    fontFamily: fontFamily.alexandria,
    fontSize: 14,
    lineHeight: 20,
    color: palette.brand[500],
    textAlign: 'right',
  },
  subtitle: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 12,
    lineHeight: 18,
    color: palette.text.tertiary,
    textAlign: 'right',
  },
  iconTile: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: {
    width: 32,
    height: 32,
  },
});
