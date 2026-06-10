import React, { createContext, useContext, useState, useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import { API_URL } from "@/services/api";

WebBrowser.maybeCompleteAuthSession();

interface AuthContextProps {
  user: any;
  token: string | null;
  loading: boolean;
  pendingEmail: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  resendOtp: () => Promise<void>;
  clearAuthOnStart: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const router = useRouter();

  const BASE_URL = API_URL.replace(/\/api$/, '');

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync("token");
      const storedUser = await SecureStore.getItemAsync("user");
      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        if (Platform.OS !== "web") {
          router.replace("/(tabs)");
        }
      }
    } catch {
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("user");
    } finally {
      setLoading(false);
    }
  };

  const clearAuthOnStart = async () => {
    try {
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("user");
      setUser(null);
      setToken(null);
    } catch {}
  };

  const persistAuth = async (authUser: any, authToken: string) => {
    setUser(authUser);
    setToken(authToken);
    await SecureStore.setItemAsync("user", JSON.stringify(authUser));
    await SecureStore.setItemAsync("token", authToken);
  };

  const signIn = async () => {
    setLoading(true);
    try {
      const returnTo = Linking.createURL('/auth-callback');
      const authUrl  = `${BASE_URL}/auth/google/mobile?returnTo=${encodeURIComponent(returnTo)}`;
      const result   = await WebBrowser.openAuthSessionAsync(authUrl, returnTo);

      if (result.type === 'success') {
        const { queryParams } = Linking.parse(result.url);
        const status = queryParams?.status as string;

        if (status === 'success') {
          const user = JSON.parse(queryParams?.user as string);
          await persistAuth(user, queryParams?.token as string);
        } else if (status === 'verification_required') {
          setPendingEmail(queryParams?.email as string);
        }
      }
    } catch {
      // cancelled or dismissed — no-op
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (otp: string) => {
    if (!pendingEmail) throw new Error("no_pending_email");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, otp }),
      });

      if (res.status === 429) throw new Error("too_many_requests");

      const data = await res.json();
      if (data.error === "invalid_otp") throw new Error("invalid_otp");
      if (!data.user) throw new Error("auth_failed");

      setPendingEmail(null);
      await persistAuth(data.user, data.token);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!pendingEmail) throw new Error("no_pending_email");
    const res = await fetch(`${API_URL}/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: pendingEmail }),
    });
    if (res.status === 429) throw new Error("too_many_requests");
    const data = await res.json();
    if (data.error) throw new Error(data.error);
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
    setPendingEmail(null);
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user");
    if (Platform.OS !== "web") {
      router.replace("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, pendingEmail, signIn, signOut, verifyOtp, resendOtp, clearAuthOnStart }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
