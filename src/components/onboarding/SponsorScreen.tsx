import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch } from '@/store/hooks';
import { markSponsorShown } from '@/store/slices/onboardingSlice';
import { sponsorService } from '@/services/sponsorService';
import { cacheKeys } from '@/utils/cacheKeys';
import { pickText } from '@/utils/formatters';
import type { Theme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontSize, fontWeight } from '@/theme/typography';

const MIN_DURATION_MS = 1500;

/**
 * Launch gate: shows the admin-configured sponsor screen once per session,
 * then renders the app. Children mount underneath so the app preloads.
 */
export function SponsorScreen({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const { t, isArabic } = useLanguage();
  const dispatch = useAppDispatch();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [overlayVisible, setOverlayVisible] = useState(true);

  const { data, isLoading, isError } = useQuery({
    queryKey: cacheKeys.sponsorScreen,
    queryFn: sponsorService.getSponsorScreen,
    staleTime: 0,
    retry: 1,
  });

  useEffect(() => {
    if (isLoading) return;
    const shouldShow = !isError && !!data?.is_enabled && !!data?.sponsor;
    if (!shouldShow) {
      dispatch(markSponsorShown());
      setOverlayVisible(false);
      return;
    }
    const ms = Math.max(MIN_DURATION_MS, (data?.display_duration_seconds ?? 3) * 1000);
    const id = setTimeout(() => {
      dispatch(markSponsorShown());
      setOverlayVisible(false);
    }, ms);
    return () => clearTimeout(id);
  }, [isLoading, isError, data, dispatch]);

  return (
    <View style={styles.flex}>
      {children}
      {overlayVisible ? (
        <View style={styles.overlay}>
          {data?.sponsor?.logo_url ? (
            <Image
              source={data.sponsor.logo_url}
              style={styles.logo}
              contentFit="contain"
            />
          ) : null}
          {data?.sponsor ? (
            <>
              <Text style={styles.label}>{t.sponsors.sponsoredBy}</Text>
              <Text style={styles.name}>{pickText(data.sponsor.name, isArabic)}</Text>
            </>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    flex: { flex: 1 },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.background,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.md,
      padding: spacing.xl,
    },
    logo: { width: 200, height: 160 },
    label: { fontSize: fontSize.sm, color: theme.textMuted },
    name: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      color: theme.text,
      textAlign: 'center',
    },
  });
}
