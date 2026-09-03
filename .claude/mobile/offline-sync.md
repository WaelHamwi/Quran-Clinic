# OFFLINE BEHAVIOUR & SYNC

Builds on the existing offline model documented in `.claude/mobile/CLAUDE.md`
("Offline Mode"): there is **no manual offline toggle** — offline works automatically.

## EXISTING MODEL ✓ (keep)
- **Quran text** — `useSurahs`/`useSurah` try the API first, fall back to SQLite on
  failure; SQLite is refilled on every successful online fetch.
- **Mushaf audio** — user taps the download button on a surah; file saved to
  `{documentDirectory}/audio/surah_{id}_reciter_{id}.mp3`; on play, `audioService`
  checks for the local file and plays it, else streams.

## EXTEND TO NEW FEATURES (same pattern)
- **Adhkar / Tahsinat text** — cache into SQLite on successful fetch; serve from cache
  when offline.
- **Categories / diseases** — React Query cache + (optional) SQLite mirror for offline
  browsing; show a "showing saved data" hint when serving stale offline data.
- **Ruqyah audio** — downloaded recordings saved as `recording_{id}.mp3`; play from
  cache when present.

## DOWNLOAD MANAGER
State lives in `downloadsSlice` (`store-design.md`); device work in `audioService`.

### Status lifecycle
`pending → downloading → completed` | `→ failed` | `→ cancelled`.
Each task tracks `progress`, `totalBytes`, `localPath`, `error`.

### Constraints
- Free users: download the **summarized recording only**. Paid users: both types.
- Wi-Fi-only toggle in settings, **default on** — block downloads on cellular unless
  the user allows it.
- On logout: clear all downloads (`clearAll`).

### Download UI
- Dedicated `DownloadButton` per recording: idle ↓ / progress / cancel / retry.
- "My Downloads" screen in `/more`: list with per-item size, total used / free space,
  remove item, clear all, search within downloads.

## OFFLINE ACTION QUEUE
`offlineQueueSlice` queues actions that need the server while offline:
- Types: `favorite` toggle, `feedback` submit, `playCount` increment.
- Each item: `id`, `type`, `payload`, `timestamp`, `retryCount`.
- `useNetworkStatus` detects reconnect → dispatches `processQueue`.
- Retry up to 3 times; drop and log after that.
- Optimistic UI: the favorite/feedback updates locally immediately; the queue
  reconciles with the server later.

## GRACEFUL DEGRADATION
- **Ask Me** — show "No internet connection"; no offline mode.
- **Search** — search the local cache only; show a "searching saved content" notice.
- **Courses / sponsors** — show cached data, or a "connect to the internet" message.
- **Feedback** — accept input, queue for sync, confirm to the user.

## PERSISTENCE BOUNDARIES
- SQLite (`expo-sqlite`) — large/relational text content (surahs, verses, adhkar).
- File system (`expo-file-system/legacy`) — audio binaries.
- `redux-persist` + `AsyncStorage` — app state (favorites, settings, downloads index,
  queue, feature-flag cache). See `store-design.md`.
- `expo-secure-store` — auth token only.
