import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store/rootReducer';

interface DrivingModeState {
  isDriving: boolean;
  wasPausedByDriving: boolean;
}

const initialState: DrivingModeState = {
  isDriving: false,
  wasPausedByDriving: false,
};

const drivingModeSlice = createSlice({
  name: 'drivingMode',
  initialState,
  reducers: {
    enterDriving(state, action: PayloadAction<boolean>) {
      state.isDriving = true;
      state.wasPausedByDriving = action.payload;
    },
    exitDriving() {
      return initialState;
    },
  },
});

export const { enterDriving, exitDriving } = drivingModeSlice.actions;
export default drivingModeSlice.reducer;

export const selectIsDriving = (s: RootState): boolean => s.drivingMode.isDriving;
export const selectWasPausedByDriving = (s: RootState): boolean =>
  s.drivingMode.wasPausedByDriving;
