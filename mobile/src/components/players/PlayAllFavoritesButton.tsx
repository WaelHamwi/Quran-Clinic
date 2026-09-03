import React, { useCallback } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { usePlayFavorites } from '@/hooks/player/usePlayFavorites';
import { createStyles } from './PlayAllFavoritesButton.styles';

/** Favorites-screen CTA (Figma 18284:3424): plays every favorited disease's
 *  ruqyah one by one through the shared player queue. */
function PlayAllFavoritesButtonBase() {
  const { t, isArabic } = useLanguage();
  const { theme } = useTheme();
  const s = useStyles(createStyles);
  const { playFavorites, isLoading } = usePlayFavorites();
  const onPress = useCallback(() => playFavorites(), [playFavorites]);

  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading}
      style={({ pressed }) => [
        s.playAllBtn,
        { flexDirection: isArabic ? 'row-reverse' : 'row' },
        pressed && s['playAllBtn--pressed'],
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={theme.textOnBrand} size="small" />
      ) : (
        <Ionicons name="play" size={16} color={theme.textOnBrand} />
      )}
      <Text style={s.playAllBtn__label} numberOfLines={1}>
        {t.favorites.playAll}
      </Text>
    </Pressable>
  );
}

export const PlayAllFavoritesButton = React.memo(PlayAllFavoritesButtonBase);
