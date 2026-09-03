import * as WebBrowser from "expo-web-browser";
import * as Crypto from "expo-crypto";
import { Linking } from "react-native";
import { PRODUCTION_API_URL } from "@/services/common/api";
import { secureStorageService } from "@/services/auth/secureStorageService";
import { profileService } from "./profileService";

const RETURN_URL = "quranicclinic://auth-callback";

const parseCallback = (url: string): Record<string, string> => {
  const out: Record<string, string> = {};
  const raw = url.split("#")[1] ?? url.split("?")[1] ?? "";
  raw.split("&").forEach((pair) => {
    const [k, v] = pair.split("=");
    if (k) out[decodeURIComponent(k)] = decodeURIComponent(v ?? "");
  });
  return out;
};

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
          setTimeout(() => done(null), 1200);
        }
      })
      .catch(() => done(null));
  });

const OAUTH_BASE_URL = PRODUCTION_API_URL.replace(/\/api$/, "");

export const authService = {
  async signIn(): Promise<{
    status: "success" | "verification_required" | "cancelled";
    sessionToken?: string;
  }> {
    try {
      const sessionToken = Crypto.randomUUID();
      await secureStorageService.setOtpSessionToken(sessionToken);

      const authUrl = `${OAUTH_BASE_URL}/auth/google/mobile?session_token=${encodeURIComponent(
        sessionToken
      )}`;

      const callbackUrl = await openAndAwaitCallback(authUrl);
      if (!callbackUrl) {
        return { status: "cancelled" };
      }

      const params = parseCallback(callbackUrl);
      if (params.session_token !== sessionToken) {
        throw new Error("session_mismatch");
      }

      if (params.status === "success") {
        return { status: "success", sessionToken };
      } else if (params.status === "verification_required") {
        return { status: "verification_required", sessionToken };
      } else {
        throw new Error("auth_failed");
      }
    } catch (err) {
      throw err;
    }
  },

  async exchangeSession(sessionToken: string): Promise<{
    token: string;
    user: any;
  }> {
    const res = await fetch(`${PRODUCTION_API_URL}/auth/session-exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ session_token: sessionToken }),
    });
    if (!res.ok) throw new Error("auth_failed");

    const data = await res.json();
    if (data.status !== "success" || !data.token) throw new Error("auth_failed");

    return { token: data.token, user: data.user };
  },

  async verifyOtp(otp: string): Promise<{
    token: string;
    user: any;
  }> {
    const sessionToken = await secureStorageService.getOtpSessionToken();
    if (!sessionToken) throw new Error("no_pending_session");

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

    return { token: data.token, user: data.user };
  },

  async resendOtp(): Promise<void> {
    const sessionToken = await secureStorageService.getOtpSessionToken();
    if (!sessionToken) throw new Error("no_pending_session");

    const res = await fetch(`${PRODUCTION_API_URL}/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ session_token: sessionToken }),
    });

    if (res.status === 429) throw new Error("too_many_requests");

    const data = await res.json();
    if (data.error) throw new Error(data.error);
  },

  async finishLogin(authToken: string, authUser: any): Promise<void> {
    await secureStorageService.setToken(authToken);
    await secureStorageService.setUser(authUser);
    await secureStorageService.deleteOtpSessionToken();
    await profileService.migrateGuestProfile(authToken, authUser);
    profileService.refreshProfile(authToken).catch(() => {});
  },
};
