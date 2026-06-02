import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { FeatureFlagMap } from '@/types/feature';
import type { RootState } from '@/store/rootReducer';

export type FeaturesStatus = 'idle' | 'loading' | 'ready' | 'error';

interface FeaturesState {
  flags: FeatureFlagMap;
  fetchedAt: number | null;
  status: FeaturesStatus;
}

const initialState: FeaturesState = { flags: {}, fetchedAt: null, status: 'idle' };

/** Admin feature-visibility flags. Fetched on launch, persisted for offline use. */
const featuresSlice = createSlice({
  name: 'features',
  initialState,
  reducers: {
    setFlags(state, action: PayloadAction<FeatureFlagMap>) {
      state.flags = action.payload;
      state.fetchedAt = Date.now();
      state.status = 'ready';
    },
    setFeaturesStatus(state, action: PayloadAction<FeaturesStatus>) {
      state.status = action.payload;
    },
  },
});

export const { setFlags, setFeaturesStatus } = featuresSlice.actions;
export default featuresSlice.reducer;

export const selectFeatureFlags = (s: RootState): FeatureFlagMap => s.features.flags;
/** Unknown keys default to visible — a missing flag must not hide a feature. */
export const selectIsFeatureVisible = (s: RootState, key: string): boolean =>
  s.features.flags[key] !== false;
