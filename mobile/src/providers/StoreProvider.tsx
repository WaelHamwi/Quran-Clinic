import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store/store';
import { DownloadResumer } from '@/components/layout/DownloadResumer';

/**
 * Wraps the app with the Redux store + redux-persist gate.
 * Mounted inside `QueryClientProvider` (see `app/_layout.tsx`).
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <DownloadResumer />
        {children}
      </PersistGate>
    </Provider>
  );
}
