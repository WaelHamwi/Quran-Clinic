import { PRODUCTION_API_URL } from "@/services/common/api";
import { secureStorageService } from "@/services/auth/secureStorageService";

interface ProfileUpdate {
  name?: string;
  phone?: string | null;
  country?: string | null;
  gender?: "male" | "female" | null;
  avatar_path?: string | null;
}

export const profileService = {
  async migrateGuestProfile(authToken: string, authUser: any): Promise<void> {
    try {
      const raw = await secureStorageService.getGuestProfile();
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

    await secureStorageService.deleteGuestProfile();
  },

  async refreshProfile(authToken: string): Promise<any | null> {
    try {
      const meRes = await fetch(`${PRODUCTION_API_URL}/me`, {
        headers: { Authorization: `Bearer ${authToken}`, Accept: "application/json" },
      });
      if (!meRes.ok) return null;

      const meData = await meRes.json();
      if (meData?.data) {
        await secureStorageService.setUser(meData.data);
        return meData.data;
      }
    } catch {}
    return null;
  },

  async updateProfile(token: string, changes: ProfileUpdate): Promise<any | null> {
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
      await secureStorageService.setUser(updated);
      return updated;
    }
    return null;
  },
};
