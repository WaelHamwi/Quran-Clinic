import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { RemoteSvg } from '@/components/common/RemoteSvg';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { pickText } from '@/utils/formatters';
import type { Disease } from '@/types/disease';
import { createStyles } from './DiseaseCard.styles';

interface DiseaseCardProps {
  disease: Disease;
  onPress: (slug: string) => void;
}

function DiseaseCardBase({ disease, onPress }: DiseaseCardProps) {
  const { isArabic } = useLanguage();
  const { theme } = useTheme();
  const s = useStyles(createStyles);
  const handlePress = useCallback(() => onPress(disease.slug), [onPress, disease.slug]);
  const iconIsUrl = !!disease.icon && /^https?:\/\//.test(disease.icon);
  const iconIsSvg = iconIsUrl && /\.svg($|\?)/i.test(disease.icon as string);
  // See FavoriteRow — remount on url change so a recycled cell never keeps the
  // previous disease's image.
  const iconKey = disease.icon ?? 'no-icon';

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [s.diseaseCard, pressed && s['diseaseCard--pressed']]}
    >
      {iconIsSvg ? (
        <RemoteSvg
          key={iconKey}
          uri={disease.icon as string}
          width={48}
          height={48}
          color={theme.primary}
        />
      ) : iconIsUrl ? (
        <Image
          key={iconKey}
          recyclingKey={iconKey}
          source={{
            uri: disease.icon as string,
            headers: { 'ngrok-skip-browser-warning': 'true' },
          }}
          style={s.diseaseCard__iconImage}
          contentFit="contain"
          tintColor={theme.primary}
        />
      ) : (
        <View style={s.diseaseCard__iconBubble}>
          <Ionicons name="pulse-outline" size={24} color={theme.primary} />
        </View>
      )}
      <Text style={s.diseaseCard__name} numberOfLines={2}>
        {pickText(disease.name, isArabic)}
      </Text>
    </Pressable>
  );
}

function areEqual(prev: DiseaseCardProps, next: DiseaseCardProps): boolean {
  return (
    prev.disease.id === next.disease.id &&
    prev.disease.icon === next.disease.icon &&
    prev.onPress === next.onPress
  );
}

export const DiseaseCard = React.memo(DiseaseCardBase, areEqual);
