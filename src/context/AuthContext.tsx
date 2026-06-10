import React, { createContext, useContext, useState, useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
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

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    // PKCE authorization code flow — implicit (ResponseType.Token) is blocked by Google policy
    redirectUri: 'https://auth.expo.io/@wael_hamwi/quranic-clinic',
  });

  useEffect(() => {
    loadStoredAuth();
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;
      const codeVerifier = request?.codeVerifier ?? '';
      handleGoogleSignIn(code, codeVerifier);
    } else if (response?.type === "error" || response?.type === "dismiss") {
      setLoading(false);
    }
  }, [response]);

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

  const handleGoogleSignIn = async (code: string, codeVerifier: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/google/callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, code_verifier: codeVerifier }),
      });

      if (res.status === 429) throw new Error("too_many_requests");

      const data = await res.json();

      if (data.status === "verification_required") {
        setPendingEmail(data.email);
      } else if (data.status === "success" && data.user) {
        await persistAuth(data.user, data.token);
      } else {
        throw new Error("auth_failed");
      }
    } finally {
      setLoading(false);
    }
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
      await promptAsync();
    } catch {
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
