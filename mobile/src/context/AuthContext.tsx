import React, { createContext, useContext, useState, useEffect } from "react";
import { store } from "@/store/store";
import { setUser as setAuthUser } from "@/store/slices/authSlice";
import { authService } from "@/services/auth/authService";
import { profileService } from "@/services/auth/profileService";
import { accountService } from "@/services/auth/accountService";
import { secureStorageService } from "@/services/auth/secureStorageService";

// TYPES
interface ProfileUpdate {
  name?: string;
  phone?: string | null;
  country?: string | null;
  gender?: "male" | "female" | null;
  avatar_path?: string | null;
}

interface AuthContextProps {
  user: any;
  profile: any;
  isGuest: boolean;
  token: string | null;
  loading: boolean;
  awaitingOtp: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (changes: ProfileUpdate) => Promise<void>;
  deleteAccount: () => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  resendOtp: () => Promise<void>;
  clearAuthOnStart: () => Promise<void>;
  signOutEpoch: number;
}

// CONTEXT
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// PROVIDER
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // STATE
  const [user, setUser] = useState<any>(null);
  const [guestProfile, setGuestProfile] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [signOutEpoch, setSignOutEpoch] = useState(0);

  // EFFECTS
  useEffect(() => {
    bootstrap();
  }, []);

  useEffect(() => {
    store.dispatch(setAuthUser(user ?? null));
  }, [user]);

  // BOOTSTRAP
  const bootstrap = async () => {
    try {
      const storedToken = await secureStorageService.getToken();
      const storedUser = await secureStorageService.getUser();
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        const storedGuest = await secureStorageService.getGuestProfile();
        if (storedGuest) setGuestProfile(JSON.parse(storedGuest));
      }
    } catch {
      await secureStorageService.clearAll();
    } finally {
      setLoading(false);
    }
  };

  const clearAuthOnStart = async () => {
    await secureStorageService.deleteToken();
    await secureStorageService.deleteUser();
    setUser(null);
    setToken(null);
  };

  // AUTH HANDLERS
  const signIn = async () => {
    setLoading(true);
    setAwaitingOtp(false);

    try {
      const result = await authService.signIn();

      if (result.status === "cancelled") {
        setLoading(false);
        return;
      }

      if (result.status === "success" && result.sessionToken) {
        const { token: authToken, user: authUser } = await authService.exchangeSession(
          result.sessionToken
        );
        setUser(authUser);
        setToken(authToken);
        setAwaitingOtp(false);
        await authService.finishLogin(authToken, authUser);
        setLoading(false);
      } else if (result.status === "verification_required") {
        setAwaitingOtp(true);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const verifyOtp = async (otp: string) => {
    setLoading(true);
    try {
      const { token: authToken, user: authUser } = await authService.verifyOtp(otp);
      setUser(authUser);
      setToken(authToken);
      setAwaitingOtp(false);
      await authService.finishLogin(authToken, authUser);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    await authService.resendOtp();
  };

  // Confirmation (downloads warning, bilingual strings) is the caller's job —
  // this only performs the sign-out. Downloads are cleared for a real session
  // because gated audio must not outlive the account that was entitled to it.
  const signOut = async () => {
    const hadSession = !!token;
    setToken(null);
    setUser(null);
    setAwaitingOtp(false);
    if (hadSession) await accountService.clearDownloads();
    await accountService.clearAuth();
    setSignOutEpoch((e) => e + 1);
  };

  // No confirmation here — the More screen's modal is the single confirm step.
  const deleteAccount = async () => {
    if (!token) return;
    await accountService.deleteAccount(token);
    setToken(null);
    setUser(null);
    setAwaitingOtp(false);
    await accountService.clearDownloads();
    await accountService.clearAuth();
    setSignOutEpoch((e) => e + 1);
  };

  const updateProfile = async (changes: ProfileUpdate) => {
    if (!token) {
      const merged = { ...(guestProfile ?? {}), ...changes };
      setGuestProfile(merged);
      await secureStorageService.setGuestProfile(merged);
      return;
    }

    const updated = await profileService.updateProfile(token, changes);
    if (updated) {
      setUser(updated);
    }
  };

  // CONTEXT VALUE
  const profile = user ?? guestProfile;
  const isGuest = !token;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isGuest,
        token,
        loading,
        awaitingOtp,
        signIn,
        signOut,
        updateProfile,
        deleteAccount,
        verifyOtp,
        resendOtp,
        clearAuthOnStart,
        signOutEpoch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// HOOK
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
