import React, { useEffect } from 'react';
import { AppSplash } from '@/components/AppSplash';
import { OnboardingPager } from '@/components/onboarding/OnboardingPager';
import { LoginGate } from '@/components/auth/LoginGate';
import { OtpGate } from '@/components/auth/OtpGate';
import { DisclaimerPopup } from '@/components/common/DisclaimerPopup';
import { MainApp } from '@/components/layout/MainApp';
import { useAppFlow } from '@/hooks/common/useAppFlow';
import { useAuth } from '@/context/AuthContext';

interface AppFlowProps {
  fontsLoaded: boolean;
}

export function AppFlow({ fontsLoaded }: AppFlowProps) {
  const { step, go, finish, hasOnboarded } = useAppFlow();
  const { user, awaitingOtp, signOutEpoch } = useAuth();

  // When a session ends (sign out / delete account), return to the login step. Without
  // this the step machine stays on 'app', and the sign-in/OTP transitions below — all
  // gated on step === 'login' — never fire on a re-signup, so the user can't re-verify
  // OTP and lands in a half-logged-out state. The epoch (not a `user` transition) is the
  // signal because a guest's sign-out never changes `user` — it is always null for them.
  useEffect(() => {
    if (signOutEpoch > 0) go('login');
  }, [signOutEpoch, go]);

  // Google sign-in succeeded → advance. Skip disclaimer if user already accepted it once.
  useEffect(() => {
    if (step === 'login' && user) {
      if (hasOnboarded) go('app');
      else go('disclaimer');
    }
  }, [user, step, hasOnboarded, go]);

  // New user — backend emailed an OTP → show the native OTP screen.
  useEffect(() => {
    if (step === 'login' && awaitingOtp) go('otp');
  }, [awaitingOtp, step, go]);

  // OTP verified successfully → advance.
  useEffect(() => {
    if (step === 'otp' && user) go('disclaimer');
  }, [user, step, go]);

  if (!fontsLoaded) return null;

  switch (step) {
    case 'splash':      return <AppSplash onReady={() => go('onboarding')} />;
    case 'onboarding':  return <OnboardingPager onComplete={() => go('login')} />;
    case 'login':       return <LoginGate onSuccess={() => go('disclaimer')} />;
    case 'otp':         return <OtpGate />;
    case 'disclaimer':
      // Mount MainApp (the expo-router navigator) underneath the disclaimer popup so a
      // navigator is already present the instant auth completes. The OAuth redirect
      // arrives as a `quranicclinic://auth-callback` deep link right after sign-in; with
      // the navigator mounted, +native-intent can resolve it to home instead of the
      // "Unmatched Route" screen.
      return (
        <>
          <MainApp />
          <DisclaimerPopup visible onAccept={finish} />
        </>
      );
    case 'app': return <MainApp />;
  }
}
