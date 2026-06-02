import React from 'react';
import { useFonts } from 'expo-font';
import { FONTS } from '@/theme/fonts';
import { AppProviders } from '@/providers/AppProviders';
import { AppFlow } from '@/components/layout/AppFlow';

export default function RootLayout() {
  const [fontsLoaded] = useFonts(FONTS);

  return (
    <AppProviders>
      <AppFlow fontsLoaded={fontsLoaded ?? false} />
    </AppProviders>
  );
}
