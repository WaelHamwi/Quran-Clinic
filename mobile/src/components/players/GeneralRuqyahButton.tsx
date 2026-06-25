import React, { useCallback } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { useGeneralRuqyah } from '@/hooks/useGeneralRuqyah';
import { generalRuqyahBtnStyles as s, ON_BRAND } from './GeneralRuqyahButton.styles';

function GeneralRuqyahButtonBase() {
  const { t, isArabic } = useLanguage();
  const { playGeneralRuqyah, isLoading } = useGeneralRuqyah();
  const onPress = useCallback(() => playGeneralRuqyah(), [playGeneralRuqyah]);
  const textAlign = isArabic ? 'right' : 'left' as const;

  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading}
      style={({ pressed }) => [s.generalRuqyahBtn, pressed && s['generalRuqyahBtn--pressed']]}
    >
      <View style={s.generalRuqyahBtn__playWrap}>
        {isLoading ? (
          <ActivityIndicator color={ON_BRAND} />
        ) : (
          <Ionicons name="play-circle" size={48} color={ON_BRAND} />
        )}
      </View>
      <View style={[s.generalRuqyahBtn__texts, { alignItems: isArabic ? 'flex-end' : 'flex-start' }]}>
        <Text style={[s.generalRuqyahBtn__title, { textAlign }]} numberOfLines={2}>
          {t.hospital.generalRuqyah}
        </Text>
        <Text style={[s.generalRuqyahBtn__subtitle, { textAlign }]} numberOfLines={3}>
          {t.hospital.generalRuqyahDesc}
        </Text>
      </View>
    </Pressable>
  );
}

export const GeneralRuqyahButton = React.memo(GeneralRuqyahButtonBase);
