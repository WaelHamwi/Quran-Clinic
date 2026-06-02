import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { pickText } from '@/utils/formatters';
import type { AdhkarCategory } from '@/types/adhkar';
import {
  adhkarCategoryCardStyles as s,
  SLUG_META,
  ARROW_COLOR,
  ICON_ON_TILE,
} from './AdhkarCategoryCard.styles';

interface AdhkarCategoryCardProps {
  category: AdhkarCategory;
  onPress: (slug: string) => void;
}

function AdhkarCategoryCardBase({ category, onPress }: AdhkarCategoryCardProps) {
  const { isArabic, t } = useLanguage();
  const handlePress = useCallback(() => onPress(category.slug), [onPress, category.slug]);
  const meta = SLUG_META[category.slug];
  const subtitle = meta ? t.adhkar[meta.subtitleKey] : '';

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [s.card, pressed && s['card--pressed']]}
    >
      <Ionicons
        name={isArabic ? 'chevron-back' : 'chevron-forward'}
        size={12}
        color={ARROW_COLOR}
      />
      <View style={s.right}>
        <View style={s.texts}>
          <Text style={s.title}>{pickText(category.name, isArabic)}</Text>
          {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
        </View>
        {meta ? (
          <View style={[s.iconTile, { backgroundColor: meta.tileColor }]}>
            <Ionicons name={meta.icon as any} size={32} color={ICON_ON_TILE} />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

function areEqual(prev: AdhkarCategoryCardProps, next: AdhkarCategoryCardProps): boolean {
  return prev.category.id === next.category.id && prev.onPress === next.onPress;
}

export const AdhkarCategoryCard = React.memo(AdhkarCategoryCardBase, areEqual);
