import React from 'react';
import { useFonts } from 'expo-font';
import { FONTS } from '@/theme/fonts';
import { AppProviders } from '@/providers/AppProviders';
import { AppFlow } from '@/components/layout/AppFlow';
import { resolveApiBaseUrl } from '@/services/api';

export default function RootLayout() {
  const [fontsLoaded] = useFonts(FONTS);
  const [apiReady, setApiReady] = React.useState(false);

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
