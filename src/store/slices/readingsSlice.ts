import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import type { Surah } from '@/types/surah';
import type { RootState } from '@/store/rootReducer';

interface ReadingsState {
  items: Record<number, Surah>;
}

const initialState: ReadingsState = { items: {} };

const readingsSlice = createSlice({
  name: 'readings',
  initialState,
  reducers: {
    toggleReading(state, action: PayloadAction<Surah>) {
      const id = action.payload.id;
      if (state.items[id]) delete state.items[id];
      else state.items[id] = action.payload;
    },
    clearReadings(state) {
      state.items = {};
    },
  },
});

export const { toggleReading, clearReadings } = readingsSlice.actions;
export default readingsSlice.reducer;

export const selectReadingItems = (s: RootState): Record<number, Surah> => s.readings.items;

export const selectReadSurahs = createSelector(
  selectReadingItems,
  (items): Surah[] => Object.values(items).sort((a, b) => a.id - b.id),
);

export const selectReadingIds = createSelector(
  selectReadingItems,
  (items): number[] => Object.keys(items).map(Number),
);

export const selectIsRead = (s: RootState, surahId: number): boolean =>
  surahId in s.readings.items;
