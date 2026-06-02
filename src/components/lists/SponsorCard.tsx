import React, { useCallback, useMemo } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import type { Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontSize, fontWeight } from '@/theme/typography';
import { pickText } from '@/utils/formatters';
import type { Sponsor } from '@/types/sponsor';

interface SponsorCardProps {
  sponsor: Sponsor;
}

function SponsorCardBase({ sponsor }: SponsorCardProps) {
  const { theme } = useTheme();
  const { isArabic } = useLanguage();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const openSite = useCallback(() => {
    if (sponsor.website_url) Linking.openURL(sponsor.website_url).catch(() => {});
  }, [sponsor.website_url]);

  return (
    <Pressable
      onPress={openSite}
      disabled={!sponsor.website_url}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.logoWrap}>
        {sponsor.logo_url ? (
          <Image source={sponsor.logo_url} style={styles.logo} contentFit="contain" />
        ) : (
          <Ionicons name="business" size={26} color={theme.primary} />
        )}
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {pickText(sponsor.name, isArabic)}
      </Text>
      {sponsor.website_url ? (
        <Ionicons name="open-outline" size={16} color={theme.textMuted} />
      ) : null}
    </Pressable>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: theme.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: theme.border,
    },
    pressed: { opacity: 0.85 },
    logoWrap: {
      width: 52,
      height: 52,
      borderRadius: radius.md,
      backgroundColor: theme.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    logo: { width: 52, height: 52 },
    name: { flex: 1, fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: theme.text },
  });
}

export const SponsorCard = React.memo(SponsorCardBase);
