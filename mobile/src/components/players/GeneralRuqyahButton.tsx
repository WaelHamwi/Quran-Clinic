import React, { useCallback } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { useGeneralRuqyah } from '@/hooks/player/useGeneralRuqyah';
import { hitSlop } from '@/theme/spacing';
import { createStyles } from './GeneralRuqyahButton.styles';

type ControlProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
};

function Control({ icon, label, onPress, disabled, active }: ControlProps) {
  const { theme } = useTheme();
  const s = useStyles(createStyles);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, selected: !!active }}
      style={({ pressed }) => [
        s.generalRuqyah__ctlBtn,
        active && s['generalRuqyah__ctlBtn--active'],
        disabled && s['generalRuqyah__ctlBtn--disabled'],
        pressed && s['generalRuqyah__ctlBtn--pressed'],
      ]}
    >
      <Ionicons
        name={icon}
        size={22}
        color={disabled ? theme.iconMuted : active ? theme.textOnBrand : theme.primary}
      />
    </Pressable>
  );
}

function GeneralRuqyahButtonBase() {
  const { t, isArabic } = useLanguage();
  const { theme } = useTheme();
  const s = useStyles(createStyles);
  const {
    playGeneralRuqyah,
    stopGeneralRuqyah,
    playNext,
    playPrevious,
    toggleRepeat,
    repeatOne,
    hasPrevious,
    hasNext,
    isGeneralMode,
    isLoading,
  } = useGeneralRuqyah();
  const onPress = useCallback(
    () => (isGeneralMode ? stopGeneralRuqyah() : playGeneralRuqyah()),
    [isGeneralMode, stopGeneralRuqyah, playGeneralRuqyah],
  );
  const textAlign = isArabic ? 'right' : 'left' as const;

  return (
    <View style={s.generalRuqyah}>
      <Pressable
        onPress={onPress}
        disabled={isLoading}
        style={({ pressed }) => [s.generalRuqyahBtn, pressed && s['generalRuqyahBtn--pressed']]}
      >
        <View style={s.generalRuqyahBtn__playWrap}>
          {isLoading ? (
            <ActivityIndicator color={theme.textOnBrand} />
          ) : (
            <Ionicons
              name={isGeneralMode ? 'stop-circle' : 'play-circle'}
              size={48}
              color={theme.textOnBrand}
            />
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

      {isGeneralMode && (
        <View style={[s.generalRuqyah__controls, isArabic && s['generalRuqyah__controls--rtl']]}>
          <Control
            icon={isArabic ? 'play-skip-forward' : 'play-skip-back'}
            label={t.player.previous}
            onPress={playPrevious}
            disabled={!hasPrevious}
          />
          <Control
            icon="repeat"
            label={t.player.repeat}
            onPress={toggleRepeat}
            active={repeatOne}
          />
          <Control
            icon={isArabic ? 'play-skip-back' : 'play-skip-forward'}
            label={t.player.next}
            onPress={playNext}
            disabled={!hasNext}
          />
        </View>
      )}
    </View>
  );
}

export const GeneralRuqyahButton = React.memo(GeneralRuqyahButtonBase);
