import React, { useCallback } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/theme/colors';
import { useLanguage } from '@/context/LanguageContext';
import type { Surah } from '@/types/surah';
import { surahItemStyles as s } from './SurahItem.styles';

type Props = {
  item: Surah;
  onPress: (id: number) => void;
  isRead?: boolean;
  onToggleRead?: (surah: Surah) => void;
};

function SurahItemBase({ item, onPress, isRead, onToggleRead }: Props) {
  const { t, language } = useLanguage();
  const handlePress = useCallback(() => onPress(item.id), [onPress, item.id]);
  const handleToggleRead = useCallback(
    (e: any) => { e.stopPropagation(); onToggleRead?.(item); },
    [onToggleRead, item],
  );
  const typeLabel = item.type === 'meccan' ? t.mushaf.meccan : t.mushaf.medinan;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [s.row, pressed && s.pressed]}
    >
      {/* Left: bookmark toggle (optional) + chevron arrow + verse count pill */}
      <View style={s.leftGroup}>
        {onToggleRead !== undefined && (
          <TouchableOpacity onPress={handleToggleRead} hitSlop={8} style={s.bookmarkBtn}>
            <Ionicons
              name={isRead ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={isRead ? palette.brand[500] : palette.border.primary}
            />
          </TouchableOpacity>
        )}
        <Text style={s.arrowText}>‹</Text>
        <View style={s.versePill}>
          <Text style={s.verseCount}>{item.total_verses} {t.mushaf.verses}</Text>
        </View>
      </View>

      {/* Right: Arabic surah name + type label */}
      <View style={s.rightGroup}>
        <Text style={s.nameAr}>
          {language === 'ar' ? item.name.ar : (item.name.en ?? item.name.ar)}
        </Text>
        <Text style={s.meta}>{typeLabel}</Text>
      </View>
    </Pressable>
  );
}

function areEqual(prev: Props, next: Props): boolean {
  return (
    prev.item.id === next.item.id &&
    prev.onPress === next.onPress &&
    prev.isRead === next.isRead &&
    prev.onToggleRead === next.onToggleRead
  );
}

export const SurahItem = React.memo(SurahItemBase, areEqual);
