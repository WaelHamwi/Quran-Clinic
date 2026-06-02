import React, { createContext, useContext, useState, useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { ResponseType } from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import { API_URL } from "@/services/api";

WebBrowser.maybeCompleteAuthSession();

interface AuthContextProps {
  user: any;
  token: string | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  clearAuthOnStart: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // DEV: bypass auth loading
  const router = useRouter();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    responseType: ResponseType.Token,
  });

  // DEV: auth loading bypassed — re-enable both useEffects when auth is needed
  // useEffect(() => {
  //   loadStoredAuth();
  // }, []);

  // useEffect(() => {
  //   if (response?.type === "success") {
  //     const { access_token } = response.params;
  //     handleGoogleSignIn(access_token);
  //   }
  // }, [response]);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync("token");
      const storedUser = await SecureStore.getItemAsync("user");

      console.log("Loading stored auth - Token:", !!storedToken, "User:", !!storedUser);

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          console.log("User loaded from storage:", parsedUser.email);
          if (Platform.OS !== 'web') {
            router.replace('/(tabs)');
          }
        } catch (e) {
          console.error("Error parsing stored user:", e);
          await SecureStore.deleteItemAsync("token");
          await SecureStore.deleteItemAsync("user");
        }
      } else {
        console.log("No stored auth found - user needs to login");
      }
    } catch (error) {
      console.error("Error loading auth:", error);
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
      console.log("Cleared stored auth data on start");
    } catch (error) {
      console.error("Error clearing auth:", error);
    }
  };

  const handleGoogleSignIn = async (access_token: string) => {
    setLoading(true);
    try {
      console.log("API URL:", API_URL);
      
      const res = await fetch(`${API_URL}/auth/google/callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token }),
      });

      const data = await res.json();

      if (data.user) {
        setUser(data.user);
        await SecureStore.setItemAsync("user", JSON.stringify(data.user));
        if (data.token) {
          setToken(data.token);
          await SecureStore.setItemAsync("token", data.token);
        }
        console.log("User signed in successfully:", data.user.email);
        if (Platform.OS !== 'web') {
          router.replace('/(tabs)');
        }
      } else {
        console.error("No user in response:", data);
        throw new Error("Failed to authenticate with backend");
      }
    } catch (error: any) {
      console.error("Sign in error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async () => {
    try {
      await promptAsync();
    } catch (error: any) {
      console.error("Sign in error:", error.message);
    }
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user");
    console.log("User signed out");
    if (Platform.OS !== 'web') {
      router.replace('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, signIn, signOut, clearAuthOnStart }}
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