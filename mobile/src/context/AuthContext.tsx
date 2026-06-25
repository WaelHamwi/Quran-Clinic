import React, { createContext, useContext, useState, useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import { Linking } from "react-native";
import { PRODUCTION_API_URL } from "@/services/api";
import { store } from "@/store/store";
import { setUser as setAuthUser } from "@/store/slices/authSlice";
import { clearAll as clearAllDownloads } from "@/store/slices/downloadsSlice";
import { audioService } from "@/services/audioService";

// SecureStore key holding the in-flight OAuth session token. Persisting it (rather than
// keeping it only in a signIn() closure) lets verifyOtp/resendOtp resolve the pending
// sign-in even if the app is backgrounded while the user reads the email — the standalone
// APK can relaunch the JS context between opening the browser and entering the code.
const OTP_SESSION_KEY = "otp_session_token";

// A guest never signs in, so there is no backend account to edit. Their profile edits
// (name/phone/country/gender) are kept only on-device under this key. This is intentionally
// separate from the "user" key: stuffing a guest into `user` would make AppFlow treat them
// as authenticated and skip the login gate on the next launch.
const GUEST_PROFILE_KEY = "guest_profile";

// The deep link the backend redirects to once Google auth finishes. Only `status` and the
// opaque `session_token` ever ride in the URL — never the bearer token or any profile data.
const RETURN_URL = "quranicclinic://auth-callback";

interface ProfileUpdate {
  name?: string;
  phone?: string | null;
  country?: string | null;
  gender?: "male" | "female" | null;
  // Local file URI of a guest's chosen avatar. Only ever set on the guest path — never sent to
  // the backend (a real account's avatar comes from Google), so migrateGuestProfile ignores it.
  avatar_path?: string | null;
}

interface AuthContextProps {
  user: any;
  // The profile screens read this: the real authenticated user when signed in, otherwise the
  // local guest profile. Never use it for auth decisions — use `user`/`token` for that.
  profile: any;
  // True once past the login gate without a real account (Continue as guest).
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
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any>(null);
  const [guestProfile, setGuestProfile] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [awaitingOtp, setAwaitingOtp] = useState(false);

  // OAuth must always go through production — Google's servers can't reach a local IP
  const OAUTH_BASE_URL = PRODUCTION_API_URL.replace(/\/api$/, "");

  useEffect(() => {
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    store.dispatch(setAuthUser(user ?? null));
  }, [user]);

  const bootstrap = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync("token");
      const storedUser = await SecureStore.getItemAsync("user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        // No real session — restore any locally-saved guest profile so their edits persist
        // across launches.
        const storedGuest = await SecureStore.getItemAsync(GUEST_PROFILE_KEY);
        if (storedGuest) setGuestProfile(JSON.parse(storedGuest));
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

  // Finalize a login. Persist immediately with the user we already have (from the
  // exchange/verify response) so sign-in feels instant — then refresh the full profile in
  // the background. Previously this awaited a blocking /me call before letting the user in,
  // adding a second sequential round-trip to every sign-in.
  const finishLogin = async (authToken: string, authUser: any) => {
    await persistAuth(authUser, authToken);
    setAwaitingOtp(false);
    await SecureStore.deleteItemAsync(OTP_SESSION_KEY);
    // Carry any guest-entered fields into the brand-new account, then refresh the full
    // profile. Chained (not awaited) so sign-in stays instant; the refresh runs after the
    // migration so the GET reflects whatever was just pushed.
    migrateGuestProfile(authToken, authUser).then(() => refreshProfile(authToken));
  };

  // One-time carry-over when a former guest signs in. Google supplies name/email/avatar, but
  // never phone/country/gender — those are the only fields worth migrating, and only where the
  // account is still blank so a returning user's existing data is never clobbered. Runs as a
  // no-op (returns early) for anyone who was never a guest. Always clears the local guest blob
  // afterward, success or not, since they now have a real account.
  const migrateGuestProfile = async (authToken: string, authUser: any) => {
    try {
      const raw = await SecureStore.getItemAsync(GUEST_PROFILE_KEY);
      if (!raw) return;
      const guest = JSON.parse(raw);

      const payload: ProfileUpdate = {};
      if (!authUser?.phone && guest.phone) payload.phone = guest.phone;
      if (!authUser?.country && guest.country) payload.country = guest.country;
      if (!authUser?.gender && guest.gender) payload.gender = guest.gender;

      if (Object.keys(payload).length > 0) {
        await fetch(`${PRODUCTION_API_URL}/me`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });
      }
    } catch {}
    await SecureStore.deleteItemAsync(GUEST_PROFILE_KEY);
    setGuestProfile(null);
  };

  // Pull the complete profile (phone, country, etc.) and quietly update the cached user.
  const refreshProfile = async (authToken: string) => {
    try {
      const meRes = await fetch(`${PRODUCTION_API_URL}/me`, {
        headers: { Authorization: `Bearer ${authToken}`, Accept: "application/json" },
      });
      if (!meRes.ok) return;
      const meData = await meRes.json();
      if (meData?.data) {
        setUser(meData.data);
        await SecureStore.setItemAsync("user", JSON.stringify(meData.data));
      }
    } catch {}
  };

  // Parse the `#status=…&session_token=…` fragment (falls back to a `?` query) the backend
  // appends to the deep link.
  const parseCallback = (url: string): Record<string, string> => {
    const out: Record<string, string> = {};
    const raw = url.split("#")[1] ?? url.split("?")[1] ?? "";
    raw.split("&").forEach((pair) => {
      const [k, v] = pair.split("=");
      if (k) out[decodeURIComponent(k)] = decodeURIComponent(v ?? "");
    });
    return out;
  };

  // Open the OAuth tab and resolve with the deep-link URL the backend redirects to.
  // openAuthSessionAsync captures the redirect directly; a Linking listener is kept as a
  // fallback because on the standalone Android APK the custom-scheme redirect can surface
  // as an OS deep link slightly after the tab reports dismissed.
  const openAndAwaitCallback = (authUrl: string): Promise<string | null> =>
    new Promise((resolve) => {
      let settled = false;
      const done = (url: string | null) => {
        if (settled) return;
        settled = true;
        sub.remove();
        resolve(url);
      };

      const sub = Linking.addEventListener("url", ({ url }) => {
        if (url && url.includes("auth-callback")) done(url);
      });

      WebBrowser.openAuthSessionAsync(authUrl, RETURN_URL)
        .then((res) => {
          if (res.type === "success" && res.url) {
            done(res.url);
          } else {
            // Cancelled/dismissed — give the Linking fallback a brief grace window before
            // declaring it a user cancellation.
            setTimeout(() => done(null), 1200);
          }
        })
        .catch(() => done(null));
    });

  const signIn = async () => {
    setLoading(true);
    setAwaitingOtp(false);

    try {
      const sessionToken = Array.from({ length: 32 }, () =>
        Math.floor(Math.random() * 36).toString(36)
      ).join("");
      await SecureStore.setItemAsync(OTP_SESSION_KEY, sessionToken);

      const authUrl = `${OAUTH_BASE_URL}/auth/google/mobile?session_token=${encodeURIComponent(
        sessionToken
      )}`;

      const callbackUrl = await openAndAwaitCallback(authUrl);
      if (!callbackUrl) {
        // User closed the tab without finishing.
        setLoading(false);
        return;
      }

      const params = parseCallback(callbackUrl);
      // Guard against a stale/forged callback landing on this session.
      if (params.session_token !== sessionToken) {
        setLoading(false);
        throw new Error("session_mismatch");
      }

      if (params.status === "success") {
        // Existing user — trade the session_token for the bearer token in one direct call.
        await exchangeSession(sessionToken);
      } else if (params.status === "verification_required") {
        // New user — show the native OTP screen (AppFlow advances on awaitingOtp).
        setAwaitingOtp(true);
        setLoading(false);
      } else {
        setLoading(false);
        throw new Error("auth_failed");
      }
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const exchangeSession = async (sessionToken: string) => {
    const res = await fetch(`${PRODUCTION_API_URL}/auth/session-exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ session_token: sessionToken }),
    });
    if (!res.ok) throw new Error("auth_failed");
    const data = await res.json();
    if (data.status !== "success" || !data.token) throw new Error("auth_failed");
    await finishLogin(data.token, data.user);
    setLoading(false);
  };

  const verifyOtp = async (otp: string) => {
    const sessionToken = await SecureStore.getItemAsync(OTP_SESSION_KEY);
    if (!sessionToken) throw new Error("no_pending_session");
    setLoading(true);
    try {
      const res = await fetch(`${PRODUCTION_API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ session_token: sessionToken, otp }),
      });

      if (res.status === 429) throw new Error("too_many_requests");

      const data = await res.json();
      if (data.error === "invalid_otp") throw new Error("invalid_otp");
      if (data.error === "session_expired") throw new Error("session_expired");
      if (!data.token) throw new Error("auth_failed");

      await finishLogin(data.token, data.user);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    const sessionToken = await SecureStore.getItemAsync(OTP_SESSION_KEY);
    if (!sessionToken) throw new Error("no_pending_session");
    const res = await fetch(`${PRODUCTION_API_URL}/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ session_token: sessionToken }),
    });
    if (res.status === 429) throw new Error("too_many_requests");
    const data = await res.json();
    if (data.error) throw new Error(data.error);
  };

  // Wipe every downloaded recording from disk and drop the persisted `completed` map so a
  // signed-out (or deleted) account leaves no audio behind for the next user on the device.
  const clearDownloads = async () => {
    try {
      await audioService.clearAllRecordings();
    } catch {}
    store.dispatch(clearAllDownloads());
  };

  // Persist profile edits. The bearer token is always production-issued (OAuth runs
  // through production), so this PUT must hit production too — the same base URL used by
  // refreshProfile and deleteAccount. On success the canonical user from the API replaces
  // the cached copy so phone/country/gender stay in sync everywhere.
  const updateProfile = async (changes: ProfileUpdate) => {
    // Guest — no backend account, so persist the edits on-device only.
    if (!token) {
      const merged = { ...(guestProfile ?? {}), ...changes };
      setGuestProfile(merged);
      await SecureStore.setItemAsync(GUEST_PROFILE_KEY, JSON.stringify(merged));
      return;
    }

    const res = await fetch(`${PRODUCTION_API_URL}/me`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(changes),
    });

    if (res.status === 422) {
      const body = await res.json().catch(() => null);
      const err = new Error("validation_failed") as Error & { errors?: unknown };
      err.errors = body?.errors;
      throw err;
    }
    if (!res.ok) throw new Error("update_failed");

    const data = await res.json();
    const updated = data?.data;
    if (updated) {
      setUser(updated);
      await SecureStore.setItemAsync("user", JSON.stringify(updated));
    }
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
    setAwaitingOtp(false);
    await clearDownloads();
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user");
    await SecureStore.deleteItemAsync(OTP_SESSION_KEY);
    // Navigation is driven by AppFlow: clearing `user` returns the step machine to the
    // login screen. (Previously a router.replace('/login') here pushed the legacy
    // app/login.tsx route, which left a re-signup stuck on a guest-looking screen.)
  };

  const deleteAccount = async () => {
    if (!token) return;
    await fetch(`${PRODUCTION_API_URL}/account`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    setToken(null);
    setUser(null);
    setAwaitingOtp(false);
    await clearDownloads();
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user");
    await SecureStore.deleteItemAsync(OTP_SESSION_KEY);
    // Navigation is driven by AppFlow (see signOut) — clearing `user` returns to login.
  };

  // Real user when authenticated, otherwise the local guest profile (may be null until the
  // guest fills anything in). Display/prefill only — never gate auth on this.
  const profile = user ?? guestProfile;
  const isGuest = !token;

  return (
    <AuthContext.Provider
      value={{ user, profile, isGuest, token, loading, awaitingOtp, signIn, signOut, updateProfile, deleteAccount, verifyOtp, resendOtp, clearAuthOnStart }}
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
