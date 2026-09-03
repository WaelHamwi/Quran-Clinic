import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "token";
const USER_KEY = "user";
const GUEST_PROFILE_KEY = "guest_profile";
const OTP_SESSION_KEY = "otp_session_token";

export const secureStorageService = {
  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },

  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async deleteToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  async getUser(): Promise<string | null> {
    return SecureStore.getItemAsync(USER_KEY);
  },

  async setUser(user: any): Promise<void> {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },

  async deleteUser(): Promise<void> {
    await SecureStore.deleteItemAsync(USER_KEY);
  },

  async getGuestProfile(): Promise<string | null> {
    return SecureStore.getItemAsync(GUEST_PROFILE_KEY);
  },

  async setGuestProfile(profile: any): Promise<void> {
    await SecureStore.setItemAsync(GUEST_PROFILE_KEY, JSON.stringify(profile));
  },

  async deleteGuestProfile(): Promise<void> {
    await SecureStore.deleteItemAsync(GUEST_PROFILE_KEY);
  },

  async getOtpSessionToken(): Promise<string | null> {
    return SecureStore.getItemAsync(OTP_SESSION_KEY);
  },

  async setOtpSessionToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(OTP_SESSION_KEY, token);
  },

  async deleteOtpSessionToken(): Promise<void> {
    await SecureStore.deleteItemAsync(OTP_SESSION_KEY);
  },

  async clearAll(): Promise<void> {
    await Promise.all([
      this.deleteToken(),
      this.deleteUser(),
      this.deleteGuestProfile(),
      this.deleteOtpSessionToken(),
    ]);
  },
};
