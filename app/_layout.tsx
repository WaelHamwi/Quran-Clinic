import React from 'react';
import { useFonts } from 'expo-font';
import * as ScreenOrientation from 'expo-screen-orientation';
import { FONTS } from '@/theme/fonts';
import { AppProviders } from '@/providers/AppProviders';
import { AppFlow } from '@/components/layout/AppFlow';
import { resolveApiBaseUrl } from '@/services/api';

export default function RootLayout() {
  const [fontsLoaded] = useFonts(FONTS);
  const [apiReady, setApiReady] = React.useState(false);

  // Lock the whole app to portrait; only the Mushaf reader unlocks to landscape.
  React.useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
  }, []);

  // Pin the API base URL (local in dev, production fallback) before any request.
  React.useEffect(() => {
    resolveApiBaseUrl().finally(() => setApiReady(true));
  }, []);

  return (
    <AppProviders>
      <AppFlow fontsLoaded={(fontsLoaded ?? false) && apiReady} />
    </AppProviders>
  );
}
