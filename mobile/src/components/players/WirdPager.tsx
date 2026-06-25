import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/theme/colors';
import { wirdPagerStyles as s, PAGER_ICON_COLOR, PAGER_ICON_MUTED } from './WirdPager.styles';

interface WirdPagerProps {
  /** Localized wird name, e.g. "الورد الأول". */
  label: string;
  /** Position suffix, e.g. "(1/7)". */
  position: string;
  /** Show a lock glyph before the label when the current wird is locked. */
  locked?: boolean;
  isArabic: boolean;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  /** Opens the full wird list (bottom sheet). */
  onPressLabel: () => void;
}

/**
 * Prev / current-wird / next pager — replaces the tab group when a disease has
 * more than three wird (Figma node 18900:2907). Tapping the centre pill opens
 * the wird list. Arrows are mirrored for RTL so "next" always moves forward.
 */
function WirdPagerBase({
  label,
  position,
  locked = false,
  isArabic,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onPressLabel,
}: WirdPagerProps) {
  return (
    <View style={[s.row, isArabic && s['row--rtl']]}>
      <Pressable onPress={onPrev} disabled={!hasPrev} hitSlop={8} style={s.arrowBtn}>
        <Ionicons
          name={isArabic ? 'chevron-forward' : 'chevron-back'}
          size={20}
          color={hasPrev ? PAGER_ICON_COLOR : PAGER_ICON_MUTED}
        />
      </Pressable>

      <Pressable onPress={onPressLabel} style={s.pill}>
        {locked && (
          <Ionicons name="lock-closed" size={12} color={palette.text.tertiary} />
        )}
        <Text style={s.pillText} numberOfLines={1}>
          {label} {position}
        </Text>
      </Pressable>

      <Pressable onPress={onNext} disabled={!hasNext} hitSlop={8} style={s.arrowBtn}>
        <Ionicons
          name={isArabic ? 'chevron-back' : 'chevron-forward'}
          size={20}
          color={hasNext ? PAGER_ICON_COLOR : PAGER_ICON_MUTED}
        />
      </Pressable>
    </View>
  );
}

export const WirdPager = React.memo(WirdPagerBase);
