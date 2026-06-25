import React from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { QueryClientProvider, queryClient } from '@/providers/QueryProvider';
import { StoreProvider } from '@/providers/StoreProvider';
import { PlayerProvider } from '@/context/PlayerContext';
import { MushafProvider } from '@/context/MushafContext';

/** Wraps the full context/provider tree so RootLayout stays minimal. */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <StoreProvider>
              <PlayerProvider>
                <MushafProvider>
                  {children}
                </MushafProvider>
              </PlayerProvider>
            </StoreProvider>
          </QueryClientProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
