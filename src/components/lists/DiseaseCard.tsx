import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [s.diseaseCard, pressed && s['diseaseCard--pressed']]}
    >
      <View style={s.diseaseCard__iconBubble}>
        <Ionicons name="pulse-outline" size={24} color={ICON_COLOR} />
      </View>
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
    prev.onPress === next.onPress
  );
}

export const DiseaseCard = React.memo(DiseaseCardBase, areEqual);
