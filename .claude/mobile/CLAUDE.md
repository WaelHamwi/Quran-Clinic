# Quranic Clinic — Mobile (React Native Expo)

## Stack
- Expo SDK 54 · Expo Router v6 · React Native 0.81
- TypeScript 5.7 (strict mode)
- React Query v5 (`@tanstack/react-query`)
- expo-av ~16 · expo-sqlite ~16 · expo-file-system ~19
- Client/app state: Redux Toolkit + redux-persist (AsyncStorage) · Server state: React Query v5
- UI: custom `StyleSheet` + Theme system (no component library)

---

## Plan Documents

The full mobile build plan lives in `.claude/mobile/`. Read the relevant doc before
working on a feature:

| File | Covers |
|---|---|
| `project.md` | Identity, stack decisions, directory map, business rules, Figma reference |
| `rules.md` | Mobile golden rules |
| `hierarchy-navigation.md` | Content hierarchy + Expo Router routing map |
| `store-design.md` | Redux Toolkit store — 11 slices, persistence, Context bridge |
| `services-design.md` | API service layer + verified backend endpoints |
| `hooks-design.md` | Custom hooks (React Query vs Redux) |
| `components-design.md` | Custom `StyleSheet` UI components |
| `screens-design.md` | Screen-by-screen spec |
| `offline-sync.md` | Offline behaviour + download manager + action queue |
| `notifications.md` | Adhkar reminders + wake detection |
| `optimization.md` | Performance practices |
| `phase-assignment.md` | Phased build roadmap + status |

**Mushaf is already built — restyle to the Figma only, never change its behaviour.**

---

## ⚠ Figma MCP — Connection & Extraction Rules

- Config file: `C:\Users\wael\Desktop\Quran\.vscode\mcp.json`
- SSE endpoint: `http://127.0.0.1:3845/sse`
- **Make exactly ONE connection attempt.** If it succeeds, extract ALL required styles in a single call. Never reconnect or retry in a loop.
- **Extract everything in one pass** — node metadata, colors, spacing, typography, and any variables — to avoid token waste from repeated round-trips.
- If the first connection attempt fails, stop and tell the user; do not loop or retry automatically.

---

⚠ API URL Priority — Local Always First in DEV, No Startup Probe

**Resolution order** (see `src/services/api.ts` + `src/services/apiClient.ts`):
1. `EXPO_PUBLIC_API_URL` in `.env` → hard override, skips everything
2. Release build → always production
3. Dev build → `API_URL` is **always** set to `LOCAL_API_URL` — no reachability probe. The startup probe was removed because it returned false negatives on Android where `localhost` resolves to the device itself, not the host machine.
4. Per-request fallback → if local returns a network error or 404, that single request retries against production (Mashfa). Auth/validation errors are NOT retried.

**`LOCAL_API_URL` auto-detection (native):**
- Android emulator: `localhost`/`127.0.0.1` remapped to `10.0.2.2`
- Physical device: host IP from Expo `hostUri` / `linkingUri`
- Override: set `EXPO_PUBLIC_API_URL_LOCAL=http://192.168.x.x:8000/api` in `.env` when auto-detection is insufficient

**Rules:**
- Never hardcode any URL in a service file. Always read `api.API_URL`.
- Never add a startup probe — removed intentionally.
- Do not uncomment `EXPO_PUBLIC_API_URL` in `.env` permanently — disables local dev.
- `backend/.env` → `APP_URL` must match whatever host the device uses to reach Laravel so that `audio_url` fields in API responses resolve correctly on the device.

---


## ⚠ Directory Rules — Read Before Touching Any File

Expo Router turns **every file inside `app/`** into a route. Only screen components (files with a `default` React component export) belong there.

| What | Correct location | Import alias |
|---|---|---|
| Screen components | `app/(tabs)/`, `app/mushaf/`, etc. | — |
| Hooks | `src/hooks/` | `@/hooks/hookName` |
| Types / interfaces | `src/types/` | `@/types/typeName` |
| Services (API, storage, audio) | `src/services/` | `@/services/name` |
| Context providers | `src/context/` | `@/context/name` |
| TypeScript declarations | project root `mobile/` | — |

**Rule:** If a file has no `export default function Screen()`, it must NOT be in `app/`.  
**Import rule — applies to ALL files in the project (not just `app/`):** always use `@/hooks/...`, `@/types/...`, `@/services/...`, `@/context/...` — never `../`, `../../`, or `./` relative paths for cross-directory imports. The `@` alias maps to `src/` (configured in `tsconfig.json`). This rule is enforced everywhere: inside `src/hooks/`, `src/services/`, `src/types/`, etc.

---

## ⚠ Package API Versions

| Package | Version | Rule |
|---|---|---|
| `expo-file-system` | ~19 | Import from `expo-file-system/legacy` — the top-level API deprecated `getInfoAsync`, `makeDirectoryAsync`, `createDownloadResumable` and will throw at runtime |
| `expo-sqlite` | ~16 | Async API only: `openDatabaseAsync`, `getAllAsync`, `runAsync`, `execAsync`, `withTransactionAsync`. The legacy `.transaction()` callback API is removed. |
| `expo-av` | ~16 | Deprecated in SDK 54, will be removed in SDK 55. Migration target: `expo-audio` + `expo-video`. Do not add new usages. |
| `app.json` plugins | — | Only packages with an Expo config plugin go here. `expo-av` and `expo-file-system` do NOT have config plugins — omit them. |

---

## ⚠ Google Auth — Bypassed for Development

Auth is intentionally disabled in `app/_layout.tsx`:
- `RootLayoutNav` renders directly to `(tabs)` — no login redirect
- `AuthProvider` wrapper is kept; restore the guard inside `RootLayoutNav` when auth is needed
- Do **not** re-enable auth unless the user explicitly asks
- Login screen (`app/login.tsx`) exists but is unreachable while bypass is active

---

## ⚠ Offline Mode

There is **no manual offline toggle**. Offline works automatically:

- **Quran text**: `useSurahs` and `useSurah` always try the API first, then fall back to SQLite if the network call fails. SQLite is populated on every successful online fetch.
- **Audio**: user presses the ↓ Download button on a surah screen → file saved to `{documentDirectory}/audio/surah_{id}_reciter_{id}.mp3`. On play, `audioService.isAudioCached` checks for the local file and plays it; streams from the API otherwise.

---

## Key Files

| File | Purpose |
|---|---|
| `src/context/MushafContext.tsx` | Shared state: `selectedSurahId`, `selectedReciterId` (persisted to AsyncStorage) |
| `src/services/quranService.ts` | All API calls (surahs, reciters, recitations) |
| `src/services/offlineStorage.ts` | expo-sqlite v16 — text caching (surahs + verses) |
| `src/services/audioService.ts` | expo-file-system/legacy — audio download + cache check |
| `src/hooks/useAudio.ts` | expo-av Sound lifecycle (load, play, pause, seek, unload) |
| `app/(tabs)/mushaf.tsx` | Surah list screen with reciter selector |
| `app/mushaf/[id].tsx` | Quran reader + audio player for one surah |
| `app/_layout.tsx` | Root layout — auth bypass is here |
