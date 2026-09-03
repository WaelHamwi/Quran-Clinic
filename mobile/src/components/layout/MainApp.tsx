import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { SponsorScreen } from '@/components/onboarding/SponsorScreen';
import { Toast } from '@/components/common/Toast';
import { DrivingModeOverlay } from '@/components/common/DrivingModeOverlay';
import { GlobalPlayerOverlay } from '@/components/players/GlobalPlayerOverlay';
import { useLanguage } from '@/context/LanguageContext';
import { useNetworkStatus } from '@/hooks/common/useNetworkStatus';
import { useOfflineQueue } from '@/hooks/common/useOfflineQueue';
import { useFeatures } from '@/hooks/common/useFeatures';
import { useNotifications } from '@/hooks/common/useNotifications';
import { useDrivingMode } from '@/hooks/player/useDrivingMode';
import { useFavoritesSync } from '@/hooks/content/useFavoritesSync';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectPlayerLoadError, setLoadError } from '@/store/slices/playerSlice';
import { showToast } from '@/store/slices/uiSlice';

/** Main navigator — only mounted once the first-run flow is complete. */
export function MainApp() {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  useNetworkStatus();
  useOfflineQueue();
  useFeatures();
  useNotifications();
  useFavoritesSync();
  const { isDriving, onContinueAnyway, onStop } = useDrivingMode();

  const playerLoadError = useAppSelector(selectPlayerLoadError);
  useEffect(() => {
    if (!playerLoadError) return;
    dispatch(showToast({ message: t.player.loadError, type: 'error' }));
    dispatch(setLoadError(false));
  }, [playerLoadError, dispatch, t]);

  return (
    <SponsorScreen>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth-callback" />
          <Stack.Screen name="hospital" />
          <Stack.Screen name="adhkar" />
          <Stack.Screen name="adhkar/[slug]" />
          <Stack.Screen name="tahsinat" />
          <Stack.Screen name="mushaf/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="hospital/subcategories/[slug]" />
          <Stack.Screen name="hospital/diseases/[slug]" />
          <Stack.Screen name="hospital/disease/[slug]" />
          <Stack.Screen name="hospital/recordings/[slug]" />
          <Stack.Screen
            name="hospital/disease/subscription"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="course/[id]"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="edit-profile" />
          <Stack.Screen name="about-us" />
          <Stack.Screen name="contact-us" />
          <Stack.Screen name="report-bug" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="notification-inbox" />
        </Stack>
        <GlobalPlayerOverlay />
        <DrivingModeOverlay
          visible={isDriving}
          onContinueAnyway={onContinueAnyway}
          onStop={onStop}
        />
        <Toast />
      </View>
    </SponsorScreen>
  );
}
