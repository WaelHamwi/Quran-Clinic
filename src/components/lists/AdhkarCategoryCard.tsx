import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { RemoteSvg } from '@/components/common/RemoteSvg';
import { useLanguage } from '@/context/LanguageContext';
import { pickText } from '@/utils/formatters';
import type { AdhkarCategory } from '@/types/adhkar';
import {
  adhkarCategoryCardStyles as s,
  SLUG_META,
  ARROW_COLOR,
  ICON_ON_TILE,
  TILE_DEFAULT,
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
  const iconIsUrl = !!category.icon && /^https?:\/\//.test(category.icon);
  const iconIsSvg = iconIsUrl && /\.svg($|\?)/i.test(category.icon as string);
  const showTile = iconIsUrl || !!meta;

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
        {showTile ? (
          <View style={[s.iconTile, { backgroundColor: meta?.tileColor ?? TILE_DEFAULT }]}>
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
              <Ionicons name={meta!.icon as any} size={32} color={ICON_ON_TILE} />
            )}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

function areEqual(prev: AdhkarCategoryCardProps, next: AdhkarCategoryCardProps): boolean {
  return (
    prev.category.id === next.category.id &&
    prev.category.icon === next.category.icon &&
    prev.onPress === next.onPress
  );
}

export const AdhkarCategoryCard = React.memo(AdhkarCategoryCardBase, areEqual);
