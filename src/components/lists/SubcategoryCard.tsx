import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { pickText } from '@/utils/formatters';
import type { Subcategory } from '@/types/category';
import { subcategoryCardStyles as s, ICON_BRAND_COLOR } from './SubcategoryCard.styles';

interface SubcategoryCardProps {
  subcategory: Subcategory;
  onPress: (slug: string) => void;
}

function SubcategoryCardBase({ subcategory, onPress }: SubcategoryCardProps) {
  const { isArabic } = useLanguage();
  const handlePress = useCallback(() => onPress(subcategory.slug), [onPress, subcategory.slug]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [s.subcategoryCard, pressed && s['subcategoryCard--pressed']]}
    >
      <View style={s.subcategoryCard__iconBubble}>
        <Ionicons name="folder-open-outline" size={24} color={ICON_BRAND_COLOR} />
      </View>
      <Text style={s.subcategoryCard__name}>
        {pickText(subcategory.name, isArabic)}
      </Text>
    </Pressable>
  );
}

export const SubcategoryCard = React.memo(SubcategoryCardBase);
