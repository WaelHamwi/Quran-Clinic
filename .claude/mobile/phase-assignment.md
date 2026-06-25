# PHASE ASSIGNMENT — MOBILE

Status as of 2026-05-19. Legend: ✅ done · 🟡 partial · ⬜ not started.

## PHASE 0 — Project Scan ✅
Existing structure, dependencies, and the shipped Mushaf have been scanned.
Findings are captured in `project.md` (directory map) and `services-design.md`
(verified backend endpoints). No further action.

## PHASE 1 — Core Infrastructure 🟡
- ✅ Expo Router, React Query (`QueryProvider`), `api.ts`, base types, Theme +
  Language contexts already exist.
- ⬜ Install Redux Toolkit + react-redux + redux-persist.
- ⬜ Build `src/store/` — store, typed hooks, root reducer, the 11 slices
  (`store-design.md`). Add `StoreProvider`.
- ⬜ `src/services/apiClient.ts` — axios instance + interceptors.
- ⬜ `src/utils/` — `cacheKeys`, formatters, validators.
- ⬜ Extend the Theme system with spacing/typography tokens for the Figma.
- ⬜ Custom `Header` / `TabBar` / `Screen` layout components.

## PHASE 2 — Authentication & Onboarding ⬜
- Auth slice + flows (Google OAuth, register, login, `me`). Auth stays **bypassed**
  in `_layout.tsx` until the user asks otherwise (CLAUDE.md).
- Onboarding pager (first launch only, auto-transition).
- Sponsor screen (every launch when enabled).
- Medical disclaimer + Terms & Conditions.

## PHASE 3 — Hospital (Ruqyah) Module ⬜
- Categories, Subcategories, Diseases screens.
- Disease detail screen with recordings (NOT in Figma — build per `project.md`).
- General Ruqyah quick-launch.
- Debounced, synonym-tolerant search.
- Favorites (diseases only).

## PHASE 4 — Adhkar & Tahsinat Modules ⬜
- Adhkar tabs (Morning, Evening, Sleep, Waking) with counters, daleel, prev/next.
- Tahsinat tabs (Self, For Others) with repeats, hints, random-order support.

## PHASE 5 — Quran (Mushaf) Module ✅ functionality / 🟡 styling
Functionality is **complete and shipped** (surah list, reader, audio player, verse
highlighting, offline text + audio). Remaining work: **restyle to the Figma only**
(RULE_41). Do not change behaviour, hooks, or service contracts. Do not build the
obsolete 604-page image reader.

## PHASE 6 — Audio & Offline Features ⬜
- `AudioPlayer` + `MiniPlayer` for ruqyah recordings (`expo-audio`, `playerSlice`).
- Download manager with progress/cancel/retry, Wi-Fi-only, tier limits.
- Offline action queue + reconnect processing.
- "My Downloads" screen.

## PHASE 7 — Additional Features ⬜
- Ask Me AI chat (confirm backend endpoint first — not in current `api.php`).
- Courses listing with WhatsApp action.
- Sponsors list.
- Feedback ("Was this useful? Yes/No" + comment).
- Feature visibility (fetch on launch, cache offline, hide disabled).
- Notifications: prayer-time scheduling + wake detection (`notifications.md`).

## PHASE 8 — Settings & Polish ⬜
- "More" screen: settings, downloads, sponsors, courses.
- Theme + language toggles (via `settingsSlice` bridge).
- Notification preferences.
- Mushaf settings (font size, translation).
- Wi-Fi-only downloads toggle, logout, version info.

## EXECUTION NOTES
- Phases 2–8 each follow: types → service → slice → hooks → components → screen →
  wire navigation → verify against the Figma.
- The Mushaf restyle (Phase 5) can run in parallel and independently — it touches
  only styling.
- Building Figma-accurate screens needs the Figma MCP connector or exported
  screenshots; raw URLs are not readable by Claude.
- Confirm request/response shapes against the backend controllers at the start of
  each feature phase, then record them in `src/types/`.
