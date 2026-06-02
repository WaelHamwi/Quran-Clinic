import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store/rootReducer';

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  sponsorShownThisSession: boolean;
  currentStep: number;
}

const initialState: OnboardingState = {
  hasCompletedOnboarding: false,
  sponsorShownThisSession: false,
  currentStep: 0,
};

/** Onboarding + sponsor flow. Only `hasCompletedOnboarding` is persisted. */
const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    completeOnboarding(state) {
      state.hasCompletedOnboarding = true;
      state.currentStep = 0;
    },
    setStep(state, action: PayloadAction<number>) {
      state.currentStep = action.payload;
    },
    markSponsorShown(state) {
      state.sponsorShownThisSession = true;
    },
    resetSession(state) {
      state.sponsorShownThisSession = false;
      state.currentStep = 0;
    },
    resetOnboarding(state) {
      state.hasCompletedOnboarding = false;
      state.sponsorShownThisSession = false;
      state.currentStep = 0;
    },
  },
});

export const { completeOnboarding, setStep, markSponsorShown, resetSession, resetOnboarding } =
  onboardingSlice.actions;
export default onboardingSlice.reducer;

export const selectHasCompletedOnboarding = (s: RootState): boolean =>
  s.onboarding.hasCompletedOnboarding;
export const selectSponsorShown = (s: RootState): boolean =>
  s.onboarding.sponsorShownThisSession;
export const selectOnboardingStep = (s: RootState): number => s.onboarding.currentStep;
