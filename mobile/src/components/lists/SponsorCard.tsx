import React, { useCallback } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { pickText, resolveMediaUrl } from '@/utils/formatters';
import type { Sponsor } from '@/types/sponsor';
import { createStyles } from './SponsorCard.styles';

interface SponsorCardProps {
  sponsor: Sponsor;
}

function SponsorCardBase({ sponsor }: SponsorCardProps) {
  const { t, isArabic } = useLanguage();
  const { theme } = useTheme();
  const s = useStyles(createStyles);

  const openSite = useCallback(() => {
    if (sponsor.website_url) Linking.openURL(sponsor.website_url).catch(() => {});
  }, [sponsor.website_url]);

  return (
    <Pressable
      onPress={openSite}
      disabled={!sponsor.website_url}
      style={({ pressed }) => [s.card, isArabic ? s.cardRtl : s.cardLtr, pressed && s.pressed]}
    >
      {/* Open-link arrow — Figma "arrow2-right" rotated to point outward (NW in RTL). */}
      <View style={s.arrowWrap}>
        <Ionicons
          name="arrow-up"
          size={18}
          color={theme.textMuted}
          style={isArabic ? s.arrowRtl : s.arrowLtr}
        />
      </View>

      <View style={[s.group, isArabic ? null : s.groupLtr]}>
        <View style={[s.texts, isArabic ? s.textsRtl : s.textsLtr]}>
          <Text style={s.name} numberOfLines={1}>
            {pickText(sponsor.name, isArabic)}
          </Text>
          <Text style={s.tier} numberOfLines={1}>
            {t.sponsors.partnerLabel}
          </Text>
        </View>

        <View style={s.logoBox}>
          <Image
            // Falls back to the المشفى القرآني wordmark when a sponsor has no
            // logo — the exact placeholder used in the Figma card (18272:3686).
            source={
              sponsor.logo_url
                ? resolveMediaUrl(sponsor.logo_url)
                : require('../../../assets/sponsor-placeholder.png')
            }
            style={s.logoImg}
            contentFit="contain"
          />
        </View>
      </View>
    </Pressable>
  );
}

export const SponsorCard = React.memo(SponsorCardBase);
