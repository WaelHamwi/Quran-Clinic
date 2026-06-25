# SERVICES DESIGN

Services are the only layer that talks to the backend or device storage. Hooks call
services; components never call services directly. Response envelope is
`{ success, data, message, meta, errors }` — services return the unwrapped `data`.

## BACKEND ENDPOINTS (verified from `backend/routes/api.php`)
Base path `/api`. Public unless marked 🔒 (requires `auth:sanctum`).

| Method | Endpoint | Used by |
|---|---|---|
| POST | `/auth/google/callback` | authService |
| POST | `/register` · `/login` | authService |
| GET | `/surahs` · `/surahs/{id}` | quranService ✓ |
| GET | `/surahs/{surahId}/recitations` | quranService ✓ |
| GET | `/verses/search` | quranService |
| GET | `/reciters` · `/reciters/{id}` | quranService ✓ |
| GET | `/recitations/{id}/audio` · `/recitations/{id}/download` | quranService ✓ |
| GET | `/categories` · `/categories/{slug}` | ruqyahService |
| GET | `/subcategories/{slug}` | ruqyahService |
| GET | `/diseases` · `/diseases/search` · `/diseases/{slug}` | ruqyahService |
| GET | `/general-ruqyah` | ruqyahService |
| GET | `/recordings` · `/recordings/{id}/stream` | ruqyahService |
| POST | `/recordings/{id}/play` | ruqyahService |
| GET | `/adhkar/categories` · `/adhkar/categories/{slug}/items` | adhkarService |
| GET | `/adhkar/today` · `/adhkar/waking` | adhkarService |
| GET | `/tahsinat/categories` · `/tahsinat/categories/{slug}/items` | tahsinatService |
| GET | `/courses` | courseService |
| GET | `/sponsors` · `/sponsor-screen` | sponsorService |
| GET | `/features` | featureService |
| 🔒 GET | `/me` · POST `/logout` | authService |
| 🔒 GET | `/favorites` · POST `/favorites/toggle` | favoriteService |
| 🔒 POST | `/feedback` | feedbackService |
| 🔒 GET/POST | `/notifications/preferences` · POST `/notifications/token` | notificationService |

Request/response field shapes must be confirmed against the backend controllers
and API Resources during Phase 1, then captured in `src/types/`.

## HTTP CLIENT
- `src/services/api.ts` — ✓ exists: exports `API_URL` and `API_HEADERS`
  (`Accept: application/json` + `ngrok-skip-browser-warning: true`).
- `src/services/apiClient.ts` — ＋ new: an `axios` instance for all new services.
  - `baseURL = API_URL`, default headers from `API_HEADERS`.
  - Request interceptor: attach `Authorization: Bearer <token>` from `expo-secure-store`.
  - Response interceptor: unwrap `data`; on 401 → dispatch `clearAuth`; on 403 →
    surface a subscription-required error; on network error → let offline fallbacks run.
- `quranService.ts` (✓ existing) uses native `fetch` and **stays as-is** to avoid
  touching the Mushaf. Optionally migrate it to `apiClient` later, behaviour-preserving.

## SERVICE MODULES

### authService.ts ＋
`loginWithGoogle(idToken)` · `register(payload)` · `login(payload)` · `getMe()` ·
`logout()`. Token persisted via `src/lib/tokenManager.ts` (secure-store).

### quranService.ts ✓ (exists — do not change contract)
`getSurahs(page,perPage)` · `getSurah(id)` · `getReciters(page,perPage)` ·
`getReciter(id)` · `getSurahRecitations(surahId)`.

### ruqyahService.ts ＋
`getCategories()` · `getCategory(slug)` (includes subcategories) ·
`getSubcategory(slug)` (includes diseases) · `getDiseases(params)` ·
`searchDiseases(query)` · `getDisease(slug)` · `getGeneralRuqyah()` ·
`getRecordings(diseaseId)` · `getRecordingStreamUrl(id)` · `incrementPlayCount(id)`.

### adhkarService.ts ＋
`getAdhkarCategories()` · `getAdhkarItems(slug)` · `getTodayAdhkar()` ·
`getWakingAdhkar()`.

### tahsinatService.ts ＋
`getTahsinatCategories()` · `getTahsinatItems(slug)`.

### courseService.ts ＋
`getCourses()`.

### sponsorService.ts ＋
`getSponsors()` · `getSponsorScreen()` (config: enabled, sponsor, durationMs).

### featureService.ts ＋
`getFeatures()` → flag map; result cached into `featuresSlice` / persist.

### favoriteService.ts ＋
`getFavorites()` · `toggleFavorite(diseaseId)`.

### feedbackService.ts ＋
`submitFeedback({ diseaseId, recordingId?, useful, comment? })`.

### notificationService.ts ＋ (API portion)
`getPreferences()` · `savePreferences(payload)` · `registerPushToken(token)`.
Device-side scheduling/wake-detection is covered in `notifications.md`.

## STORAGE & DEVICE SERVICES

### offlineStorage.ts ✓ (exists — extend, don't break)
`expo-sqlite` ~16 async API. Currently caches surahs, verses, recitations.
Extend with adhkar/tahsinat text caching and downloaded-audio index as needed.

### audioService.ts ✓ (exists — extend, don't break)
`expo-file-system/legacy`. Currently: download + cache-check for Mushaf recitations
keyed by `surah_{id}_reciter_{id}.mp3`. Extend for ruqyah recordings keyed by
`recording_{id}.mp3`: `downloadAudio`, `isAudioCached`, `getLocalPath`,
`deleteAudio`, `cancelDownload`, `getStorageUsage`, `clearAllDownloads`.

### googleAuth.ts ✓ (exists)
Google OAuth helper — currently unused while auth is bypassed.

## SERVICE RULES
- Services are pure async functions — no React, no Redux imports.
- Hooks own caching policy (React Query) and dispatch results into Redux.
- Every service request carries the two backend headers (RULE_26).
- Offline fallbacks (SQLite, cached audio) live in the hook layer, not the service —
  matching the existing `useSurah`/`mushaf/[id]` pattern.
