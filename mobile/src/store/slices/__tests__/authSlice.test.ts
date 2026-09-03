import reducer, {
  setUser,
  setAuthStatus,
  setAuthError,
  clearAuth,
  selectIsAuthenticated,
  selectIsPaid,
  selectCanAccessSession,
} from '@/store/slices/authSlice';
import type { User } from '@/types/user';
import type { RootState } from '@/store/rootReducer';

// The API always returns these entitlement booleans; default them to false so a plain
// user() is an unambiguously free account.
const user = (overrides: Partial<User> = {}): User =>
  ({
    id: 1,
    name: 'Wael',
    email: 'w@example.com',
    is_subscribed: false,
    has_active_trial: false,
    ...overrides,
  }) as User;

const stateWith = (authUser: User | null): RootState =>
  ({ auth: { user: authUser, status: authUser ? 'authenticated' : 'idle', error: null } }) as RootState;

describe('authSlice reducer', () => {
  it('starts idle with no user', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state).toEqual({ user: null, status: 'idle', error: null });
  });

  it('setUser stores the user and marks authenticated', () => {
    const state = reducer(undefined, setUser(user()));
    expect(state.user).not.toBeNull();
    expect(state.status).toBe('authenticated');
  });

  it('setUser(null) returns to idle', () => {
    const authed = reducer(undefined, setUser(user()));
    const state = reducer(authed, setUser(null));
    expect(state.user).toBeNull();
    expect(state.status).toBe('idle');
  });

  it('setAuthError records the error and flips status to error', () => {
    const state = reducer(undefined, setAuthError('boom'));
    expect(state).toMatchObject({ error: 'boom', status: 'error' });
  });

  it('setAuthStatus updates only the status', () => {
    const state = reducer(undefined, setAuthStatus('authenticating'));
    expect(state.status).toBe('authenticating');
  });

  it('clearAuth wipes the session', () => {
    const authed = reducer(undefined, setUser(user()));
    expect(reducer(authed, clearAuth())).toEqual({ user: null, status: 'idle', error: null });
  });
});

describe('subscription selectors', () => {
  it('a guest is neither authenticated nor paid', () => {
    expect(selectIsAuthenticated(stateWith(null))).toBe(false);
    expect(selectIsPaid(stateWith(null))).toBe(false);
  });

  it('a subscribed user is paid', () => {
    expect(selectIsPaid(stateWith(user({ is_subscribed: true })))).toBe(true);
  });

  it('a trialing user is paid', () => {
    expect(selectIsPaid(stateWith(user({ has_active_trial: true })))).toBe(true);
  });

  it('a free signed-in user is not paid', () => {
    expect(
      selectIsPaid(stateWith(user({ is_subscribed: false, has_active_trial: false }))),
    ).toBe(false);
  });
});

describe('selectCanAccessSession (the gate)', () => {
  it('session 1 is free for everyone, including guests', () => {
    expect(selectCanAccessSession(stateWith(null), 1)).toBe(true);
  });

  it('session 2+ is blocked for a free user', () => {
    expect(selectCanAccessSession(stateWith(user()), 2)).toBe(false);
  });

  it('session 2+ is allowed for a paid user', () => {
    expect(selectCanAccessSession(stateWith(user({ is_subscribed: true })), 5)).toBe(true);
  });
});
