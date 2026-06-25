import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AdhkarTime } from '@/types/adhkar';
import type { RootState } from '@/store/rootReducer';

export type ToastType = 'success' | 'error' | 'info';
export type TahsinatTab = 'self' | 'others';

interface ActiveToast {
  message: string;
  type: ToastType;
}

interface UiState {
  networkOnline: boolean;
  activeToast: ActiveToast | null;
  activeModal: string | null;
  adhkarTab: AdhkarTime;
  tahsinatTab: TahsinatTab;
}

const initialState: UiState = {
  networkOnline: true,
  activeToast: null,
  activeModal: null,
  adhkarTab: 'morning',
  tahsinatTab: 'self',
};

/** Global ephemeral UI state. Not persisted. */
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setNetworkOnline(state, action: PayloadAction<boolean>) {
      state.networkOnline = action.payload;
    },
    showToast(state, action: PayloadAction<ActiveToast>) {
      state.activeToast = action.payload;
    },
    dismissToast(state) {
      state.activeToast = null;
    },
    setModal(state, action: PayloadAction<string | null>) {
      state.activeModal = action.payload;
    },
    setAdhkarTab(state, action: PayloadAction<AdhkarTime>) {
      state.adhkarTab = action.payload;
    },
    setTahsinatTab(state, action: PayloadAction<TahsinatTab>) {
      state.tahsinatTab = action.payload;
    },
  },
});

export const {
  setNetworkOnline,
  showToast,
  dismissToast,
  setModal,
  setAdhkarTab,
  setTahsinatTab,
} = uiSlice.actions;
export default uiSlice.reducer;

export const selectNetworkOnline = (s: RootState): boolean => s.ui.networkOnline;
export const selectActiveToast = (s: RootState): ActiveToast | null => s.ui.activeToast;
export const selectActiveModal = (s: RootState): string | null => s.ui.activeModal;
export const selectAdhkarTab = (s: RootState): AdhkarTime => s.ui.adhkarTab;
export const selectTahsinatTab = (s: RootState): TahsinatTab => s.ui.tahsinatTab;
