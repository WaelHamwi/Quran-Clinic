// mobile/src/lib/tokenManager.ts
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// These keys MUST match the keys AuthContext writes to in expo-secure-store.
// AuthContext is the single writer of the session (see context/AuthContext.tsx —
// persistAuth/signOut), and apiClient reads the bearer token back through
// TokenManager.getToken() to set the Authorization header. A mismatch here means
// every auth-gated request goes out unauthenticated (401/403 in production).
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const TokenManager = {
  async getToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },
  
  async setToken(token: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  },
  
  async getUser(): Promise<any | null> {
    if (Platform.OS === 'web') {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    }
    const user = await SecureStore.getItemAsync(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  
  async setUser(user: any): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    }
  },
  
  async clear(): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    }
  },
};