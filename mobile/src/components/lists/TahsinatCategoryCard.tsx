import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { RemoteSvg } from '@/components/common/RemoteSvg';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { pickText } from '@/utils/formatters';
import type { TahsinatCategory } from '@/types/tahsinat';
import { createStyles } from './TahsinatCategoryCard.styles';

interface TahsinatCategoryCardProps {
  category: TahsinatCategory;
  onPress: (slug: string) => void;
}

function TahsinatCategoryCardBase({ category, onPress }: TahsinatCategoryCardProps) {
  const { isArabic } = useLanguage();
  const { theme } = useTheme();
  const s = useStyles(createStyles);
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
        color={theme.textMuted}
      />
      <View style={s.right}>
        <View style={s.texts}>
          <Text style={s.title}>{pickText(category.name, isArabic)}</Text>
        </View>
        <View style={[s.iconTile, { backgroundColor: theme.primary }]}>
          {iconIsSvg ? (
            <RemoteSvg uri={category.icon as string} width={32} height={32} color={theme.textOnBrand} />
          ) : iconIsUrl ? (
            <Image
              source={{
                uri: category.icon as string,
                headers: { 'ngrok-skip-browser-warning': 'true' },
              }}
              style={s.iconImage}
              contentFit="contain"
              tintColor={theme.textOnBrand}
            />
          ) : (
            <Ionicons name="shield-checkmark-outline" size={32} color={theme.textOnBrand} />
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
