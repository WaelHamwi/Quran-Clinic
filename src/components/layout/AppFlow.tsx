import React from 'react';
import { AppSplash } from '@/components/AppSplash';
import { OnboardingPager } from '@/components/onboarding/OnboardingPager';
import { OnboardingSponsor } from '@/components/onboarding/OnboardingSponsor';
import { LoginGate } from '@/components/auth/LoginGate';
import { DisclaimerPopup } from '@/components/common/DisclaimerPopup';
import { MainApp } from '@/components/layout/MainApp';
import { useAppFlow } from '@/hooks/useAppFlow';

interface AppFlowProps {
  fontsLoaded: boolean;
}

/** Renders the correct gate for the current flow step.
 *  Returns null until fonts are ready — keeps the native splash on screen
 *  so Arabic characters (ة, ي …) always render with the Alexandria font. */
export function AppFlow({ fontsLoaded }: AppFlowProps) {
  const { step, go, finish } = useAppFlow();

  if (!fontsLoaded) return null;

  switch (step) {
    case 'splash':      return <AppSplash onReady={() => go('onboarding')} />;
    case 'onboarding':  return <OnboardingPager onComplete={() => go('sponsor')} />;
    case 'sponsor':     return <OnboardingSponsor onDone={() => go('login')} />;
    case 'login':       return <LoginGate onSuccess={() => go('disclaimer')} />;
    case 'disclaimer':
      return (
        <>
          <LoginGate onSuccess={() => {}} />
          <DisclaimerPopup visible onAccept={finish} />
        </>
      );
    case 'app': return <MainApp />;
  }
}
