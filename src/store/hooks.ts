import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { AppDispatch } from '@/store/store';
import type { RootState } from '@/store/rootReducer';

/** Typed Redux hooks — use these everywhere instead of the raw react-redux hooks. */
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
