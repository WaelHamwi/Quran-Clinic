import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import SponsorFallbackLogo from '@/assets/figma/onb-sponsor-logo.svg';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { FigmaTopBar } from '@/components/layout/FigmaTopBar';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useAppDispatch } from '@/store/hooks';
import { markSponsorShown } from '@/store/slices/onboardingSlice';
import { sponsorService } from '@/services/content/sponsorService';
import { cachedFetch } from '@/services/common/contentCache';
import { cacheKeys } from '@/utils/cacheKeys';
import { pickText, resolveMediaUrl } from '@/utils/formatters';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from './SponsorScreen.styles';

const MIN_DURATION_MS = 1500;

/**
 * Launch gate (FR-2.4): flashes the admin-configured sponsor splash on every
 * launch, matching the Figma sponsor screen, then reveals the app underneath.
 * Visibility respects the admin on/off toggle (FR-2.5) and country targeting.
 */
export function SponsorScreen({ children }: { children: React.ReactNode }) {
  const { t, isArabic } = useLanguage();
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const s = useStyles(createStyles);
  const [overlayVisible, setOverlayVisible] = useState(true);

  const { data, isLoading, isError } = useQuery({
    queryKey: cacheKeys.sponsorScreen,
    queryFn: () => cachedFetch('sponsor_screen', sponsorService.getSponsorScreen),
    staleTime: 0,
    retry: 1,
  });

  // A sponsor either targets all countries, or only users from its list.
  // `target_countries` may be absent on older API responses — default to [].
  // Guests (no known country) can't be filtered, so they always see the
  // sponsor — we never hide it just because the user isn't signed in.
  const sponsor = data?.sponsor ?? null;
  const targetCountries = sponsor?.target_countries ?? [];
  const matchesCountry =
    !!sponsor &&
    (!user?.country ||
      sponsor.target_all_countries ||
      targetCountries.length === 0 ||
      targetCountries.includes(user.country));

  useEffect(() => {
    if (isLoading) return;
    const shouldShow = !isError && !!data?.is_enabled && !!sponsor && matchesCountry;
    if (!shouldShow) {
      dispatch(markSponsorShown());
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: hide the overlay once we know the sponsor shouldn't show
      setOverlayVisible(false);
      return;
    }
    const ms = Math.max(MIN_DURATION_MS, (data?.display_duration_seconds ?? 3) * 1000);
    const id = setTimeout(() => {
      dispatch(markSponsorShown());
      setOverlayVisible(false);
    }, ms);
    return () => clearTimeout(id);
  }, [isLoading, isError, data, sponsor, matchesCountry, dispatch]);

  return (
    <View style={s.flex}>
      {children}
      {overlayVisible && sponsor && matchesCountry ? (
        <View style={s.overlay}>
          <PatternedBackground />
          <FigmaTopBar showBrandLogo />
          <SafeAreaView style={s.safe} edges={['bottom']}>
            <View style={s.body}>
              <Text style={s.label}>{t.sponsors.sponsorIntro}</Text>
              <View style={s.logoWrap}>
                {sponsor.logo_url ? (
                  <Image source={resolveMediaUrl(sponsor.logo_url)} style={s.logoImg} contentFit="contain" />
                ) : (
                  // No admin-uploaded logo → fall back to the bundled sponsor mark.
                  <SponsorFallbackLogo width="100%" height="100%" />
                )}
              </View>
              <Text style={s.nameAr}>{pickText(sponsor.name, isArabic)}</Text>
            </View>
          </SafeAreaView>
        </View>
      ) : null}
    </View>
  );
}
