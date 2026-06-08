import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { RemoteSvg } from '@/components/common/RemoteSvg';
import { useLanguage } from '@/context/LanguageContext';
import { pickText } from '@/utils/formatters';
import type { TahsinatCategory } from '@/types/tahsinat';
import {
  tahsinatCategoryCardStyles as s,
  ARROW_COLOR,
  ICON_ON_TILE,
  TILE_COLOR,
} from './TahsinatCategoryCard.styles';

interface TahsinatCategoryCardProps {
  category: TahsinatCategory;
  onPress: (slug: string) => void;
}

function TahsinatCategoryCardBase({ category, onPress }: TahsinatCategoryCardProps) {
  const { isArabic } = useLanguage();
  const handlePress = useCallback(() => onPress(category.slug), [onPress, category.slug]);
  const iconIsUrl = !!category.icon && /^https?:\/\//.test(category.icon);
  const iconIsSvg = iconIsUrl && /\.svg($|\?)/i.test(category.icon as string);

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
        </View>
        <View style={[s.iconTile, { backgroundColor: TILE_COLOR }]}>
          {iconIsSvg ? (
            <RemoteSvg uri={category.icon as string} width={32} height={32} color={ICON_ON_TILE} />
          ) : iconIsUrl ? (
            <Image
              source={{
                uri: category.icon as string,
                headers: { 'ngrok-skip-browser-warning': 'true' },
              }}
              style={s.iconImage}
              contentFit="contain"
              tintColor={ICON_ON_TILE}
            />
          ) : (
            <Ionicons name="shield-checkmark-outline" size={32} color={ICON_ON_TILE} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

function areEqual(
  prev: TahsinatCategoryCardProps,
  next: TahsinatCategoryCardProps,
): boolean {
  return (
    prev.category.id === next.category.id &&
    prev.category.icon === next.category.icon &&
    prev.onPress === next.onPress
  );
}

export const TahsinatCategoryCard = React.memo(TahsinatCategoryCardBase, areEqual);
