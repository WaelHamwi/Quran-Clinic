import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { RemoteSvg } from '@/components/common/RemoteSvg';
import { useLanguage } from '@/context/LanguageContext';
import { pickText } from '@/utils/formatters';
import type { Disease } from '@/types/disease';
import { diseaseCardStyles as s, ICON_COLOR } from './DiseaseCard.styles';

interface DiseaseCardProps {
  disease: Disease;
  onPress: (slug: string) => void;
}

function DiseaseCardBase({ disease, onPress }: DiseaseCardProps) {
  const { isArabic, t } = useLanguage();
  const handlePress = useCallback(() => onPress(disease.slug), [onPress, disease.slug]);
  const count = disease.recordings_count ?? disease.recordings?.length ?? 0;
  const iconIsUrl = !!disease.icon && /^https?:\/\//.test(disease.icon);
  const iconIsSvg = iconIsUrl && /\.svg($|\?)/i.test(disease.icon as string);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [s.diseaseCard, pressed && s['diseaseCard--pressed']]}
    >
      {iconIsSvg ? (
        <RemoteSvg uri={disease.icon as string} width={48} height={48} color={ICON_COLOR} />
      ) : iconIsUrl ? (
        <Image
          source={{
            uri: disease.icon as string,
            headers: { 'ngrok-skip-browser-warning': 'true' },
          }}
          style={s.diseaseCard__iconImage}
          contentFit="contain"
          tintColor={ICON_COLOR}
        />
      ) : (
        <View style={s.diseaseCard__iconBubble}>
          <Ionicons name="pulse-outline" size={24} color={ICON_COLOR} />
        </View>
      )}
      <Text style={s.diseaseCard__name} numberOfLines={2}>
        {pickText(disease.name, isArabic)}
      </Text>
      <Text style={s.diseaseCard__count}>
        {t.hospital.recordingCount(count)}
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
