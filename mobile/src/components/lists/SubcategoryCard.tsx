import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { RemoteSvg } from '@/components/common/RemoteSvg';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { pickText } from '@/utils/formatters';
import type { Subcategory } from '@/types/category';
import { createStyles } from './SubcategoryCard.styles';

interface SubcategoryCardProps {
  subcategory: Subcategory;
  onPress: (slug: string) => void;
}

function SubcategoryCardBase({ subcategory, onPress }: SubcategoryCardProps) {
  const { isArabic } = useLanguage();
  const { theme } = useTheme();
  const s = useStyles(createStyles);
  const handlePress = useCallback(() => onPress(subcategory.slug), [onPress, subcategory.slug]);
  const iconIsUrl = !!subcategory.icon && /^https?:\/\//.test(subcategory.icon);
  const iconIsSvg = iconIsUrl && /\.svg($|\?)/i.test(subcategory.icon as string);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [s.subcategoryCard, pressed && s['subcategoryCard--pressed']]}
    >
      {iconIsSvg ? (
        <RemoteSvg uri={subcategory.icon as string} width={48} height={48} color={theme.primary} />
      ) : iconIsUrl ? (
        <Image
          source={{
            uri: subcategory.icon as string,
            headers: { 'ngrok-skip-browser-warning': 'true' },
          }}
          style={s.subcategoryCard__iconImage}
          contentFit="contain"
          tintColor={theme.primary}
        />
      ) : (
        <View style={s.subcategoryCard__iconBubble}>
          <Ionicons name="folder-open-outline" size={24} color={theme.primary} />
        </View>
      )}
      <Text style={s.subcategoryCard__name}>
        {pickText(subcategory.name, isArabic)}
      </Text>
    </Pressable>
  );
}

function areEqual(prev: SubcategoryCardProps, next: SubcategoryCardProps): boolean {
  return (
    prev.subcategory.id === next.subcategory.id &&
    prev.subcategory.icon === next.subcategory.icon &&
    prev.onPress === next.onPress
  );
}

export const SubcategoryCard = React.memo(SubcategoryCardBase, areEqual);
