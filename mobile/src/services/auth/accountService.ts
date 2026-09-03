import { PRODUCTION_API_URL } from "@/services/common/api";
import { store } from "@/store/store";
import {
  clearAll as clearAllDownloads,
  selectStorageUsed,
  selectCompletedDownloads,
  selectOtherDownloads,
} from "@/store/slices/downloadsSlice";
import { clearHistory as clearRecordingHistory } from "@/store/slices/recordingHistorySlice";
import { audioService } from "@/services/player/audioService";
import { secureStorageService } from "@/services/auth/secureStorageService";

export const accountService = {
  getDownloadStats(): { count: number; size: number } {
    const state = store.getState();
    const downloads = selectCompletedDownloads(state);
    const otherDownloads = selectOtherDownloads(state);
    const count = Object.keys(downloads).length + Object.keys(otherDownloads).length;
    const size = selectStorageUsed(state);
    return { count, size };
  },

  async clearDownloads(): Promise<void> {
    try {
      await audioService.clearAllRecordings();
    } catch {}
    store.dispatch(clearAllDownloads());
    store.dispatch(clearRecordingHistory());
  },

  async clearAuth(): Promise<void> {
    await secureStorageService.clearAll();
  },

  async deleteAccount(token: string): Promise<void> {
    try {
      await fetch(`${PRODUCTION_API_URL}/account`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
    } catch {}
  },
};
