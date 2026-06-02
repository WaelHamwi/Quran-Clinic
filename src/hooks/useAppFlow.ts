import { useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { completeOnboarding, selectHasCompletedOnboarding } from '@/store/slices/onboardingSlice';

export type FlowStep = 'splash' | 'onboarding' | 'sponsor' | 'login' | 'disclaimer' | 'app';

/** Manages the first-run step machine and the onboarding Redux action.
 *  DEV: always starts from 'splash' so the full flow runs on every reload.
 *  PROD: starts from 'app' once the user has completed onboarding. */
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

  return { step, go, finish };
}
