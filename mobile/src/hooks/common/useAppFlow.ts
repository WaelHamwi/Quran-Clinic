import { useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { completeOnboarding, selectHasCompletedOnboarding } from '@/store/slices/onboardingSlice';

export type FlowStep = 'splash' | 'onboarding' | 'login' | 'otp' | 'disclaimer' | 'app';

/** Manages the first-run step machine and the onboarding Redux action.
 *
 *  The Welcome → Teaser → Description → Explanatory onboarding (and the rest of
 *  the first-run chain) runs ONLY on first launch in production — i.e. until the
 *  user has completed it once (FR-2.1, FR-2.3). `hasCompletedOnboarding` is
 *  persisted (redux-persist), so once completed, later production launches start
 *  at 'app'.
 *
 *  DEV: always starts from 'splash' so the full flow is visible on every reload
 *  (otherwise it's skipped forever once the persisted flag is set). To re-test
 *  the production gating, clear app data or dispatch `resetOnboarding`.
 *
 *  Note: the sponsor screen is NOT part of this first-run machine. It is an
 *  every-launch launch gate (FR-2.4) rendered by `SponsorScreen` around the
 *  app, driven by the admin-controlled `/sponsor-screen` config (FR-2.5). */
export function useAppFlow() {
  const hasOnboarded = useAppSelector(selectHasCompletedOnboarding);
  const dispatch = useAppDispatch();

  const [step, setStep] = useState<FlowStep>(() =>
    __DEV__ || !hasOnboarded ? 'splash' : 'app',
  );

  const go = useCallback((next: FlowStep) => setStep(next), []);

  const finish = useCallback(() => {
    dispatch(completeOnboarding());
    setStep('app');
  }, [dispatch]);

  return { step, go, finish, hasOnboarded };
}
