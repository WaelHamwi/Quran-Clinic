import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { RemoteSvg } from '@/components/common/RemoteSvg';
import { useLanguage } from '@/context/LanguageContext';
import { pickText } from '@/utils/formatters';
import type { Category } from '@/types/category';
import { categoryCardStyles as s, ICON_ON_TILE, TEXT_TERTIARY_COLOR, colorForId } from './CategoryCard.styles';

interface CategoryCardProps {
  category: Category;
  onPress: (slug: string) => void;
}

function CategoryCardBase({ category, onPress }: CategoryCardProps) {
  const { isArabic } = useLanguage();
  const handlePress = useCallback(() => onPress(category.slug), [onPress, category.slug]);
  const iconIsUrl = !!category.icon && /^https?:\/\//.test(category.icon);
  const iconIsSvg = iconIsUrl && /\.svg($|\?)/i.test(category.icon as string);
  const tile = category.color ?? colorForId(category.id);
  const desc = category.description ? pickText(category.description, isArabic) : null;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [s.categoryCard, pressed && s['categoryCard--pressed']]}
    >
      <Ionicons
        name={isArabic ? 'chevron-back' : 'chevron-forward'}
        size={12}
        color={TEXT_TERTIARY_COLOR}
      />
      <View style={s.categoryCard__right}>
        <View style={s.categoryCard__texts}>
          <Text style={s.categoryCard__name}>
            {pickText(category.name, isArabic)}
          </Text>
          {desc ? (
            <Text style={s.categoryCard__desc} numberOfLines={2}>
              {desc}
            </Text>
          ) : null}
        </View>
        <View style={[s.categoryCard__iconTile, { backgroundColor: tile }]}>
          {iconIsSvg ? (
            <RemoteSvg uri={category.icon as string} width={32} height={32} color={ICON_ON_TILE} />
          ) : iconIsUrl ? (
            <Image
              source={{
                uri: category.icon as string,
                headers: { 'ngrok-skip-browser-warning': 'true' },
              }}
              style={s.categoryCard__iconImage}
              contentFit="contain"
              tintColor={ICON_ON_TILE}
            />
          ) : (
            <Ionicons name="medkit-outline" size={32} color={ICON_ON_TILE} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

function areEqual(prev: CategoryCardProps, next: CategoryCardProps): boolean {
  return (
    prev.category.id === next.category.id &&
    prev.category.icon === next.category.icon &&
    prev.category.color === next.category.color &&
    prev.onPress === next.onPress
  );
}

export const CategoryCard = React.memo(CategoryCardBase, areEqual);
