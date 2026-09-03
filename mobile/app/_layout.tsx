import React from 'react';
import { useFonts } from 'expo-font';
import * as ScreenOrientation from 'expo-screen-orientation';
import { FONTS } from '@/theme/fonts';
import { AppProviders } from '@/providers/AppProviders';
import { AppFlow } from '@/components/layout/AppFlow';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { resolveApiBaseUrl } from '@/services/common/api';

function RootLayout() {
  const [fontsLoaded] = useFonts(FONTS);
  const [apiReady, setApiReady] = React.useState(false);

  React.useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
  }, []);

  React.useEffect(() => {
    resolveApiBaseUrl().finally(() => setApiReady(true));
  }, []);

  return (
    <AppProviders>
      <ErrorBoundary>
        <AppFlow fontsLoaded={(fontsLoaded ?? false) && apiReady} />
      </ErrorBoundary>
    </AppProviders>
  );
}

export default RootLayout;
