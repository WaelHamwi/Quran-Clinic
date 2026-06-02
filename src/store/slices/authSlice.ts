import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types/user';
import type { RootState } from '@/store/rootReducer';

export type AuthStatus = 'idle' | 'authenticating' | 'authenticated' | 'error';

interface AuthState {
  user: User | null;
  status: AuthStatus;
  error: string | null;
}

const initialState: AuthState = { user: null, status: 'idle', error: null };

/**
 * Auth / session / subscription. The token itself lives in `expo-secure-store`
 * (tokenManager) — never in persisted Redux state. Auth is bypassed in
 * development, so `user` stays null; selectors degrade gracefully.
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.status = action.payload ? 'authenticated' : 'idle';
      state.error = null;
    },
    setAuthStatus(state, action: PayloadAction<AuthStatus>) {
      state.status = action.payload;
    },
    setAuthError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      if (action.payload) state.status = 'error';
    },
    clearAuth(state) {
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
  },
});

export const { setUser, setAuthStatus, setAuthError, clearAuth } = authSlice.actions;
export default authSlice.reducer;

export const selectAuthUser = (s: RootState): User | null => s.auth.user;
export const selectAuthStatus = (s: RootState): AuthStatus => s.auth.status;
export const selectIsAuthenticated = (s: RootState): boolean => s.auth.user !== null;
export const selectIsPaid = (s: RootState): boolean =>
  !!s.auth.user && (s.auth.user.is_subscribed || s.auth.user.has_active_trial);

/** Session 1 is free for everyone; sessions ≥ 2 require subscription or trial. */
export const selectCanAccessSession = (s: RootState, sessionNumber: number): boolean =>
  sessionNumber <= 1 || selectIsPaid(s);
