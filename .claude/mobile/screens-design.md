# SCREENS DESIGN

Each screen is a container: it calls hooks, wires Redux, and composes presentational
components. Every screen renders inside `<Screen>` (`components/layout`). Layouts,
colours, and spacing come from the Figma (`project.md`).

## ✓ BUILT — RESTYLE ONLY

### app/(tabs)/index.tsx — Home
Built. Restyle to the Figma. Target content: General Ruqyah quick-launch button,
categories entry, Mushaf entry, sponsor banner. Confirm exact composition from the
Figma before changing structure.

### app/(tabs)/mushaf.tsx — Surah list
Built. Surah list + reciter selector + bookmark/search affordances. **Restyle only** —
keep functionality, hooks, and `MushafContext` usage intact.

### app/mushaf/[id].tsx — Quran reader
Built. Verse list (AR + EN toggle), audio player with seek bar, per-verse highlight
synced to recitation timing, prev/next surah, per-reciter download. **Restyle only.**

### app/login.tsx — Login
Built; unreachable while auth is bypassed. Restyle when auth is re-enabled.

## ＋ TO BUILD

### app/(tabs)/hospital.tsx — Hospital / Ruqyah
Category grid/list + debounced `SearchBar` (disease search). Tapping a category →
`/hospital/subcategories/[slug]`. Hooks: `useCategories`, `useDiseaseSearch`.

### app/hospital/subcategories/[slug].tsx
Subcategory list for a category, with disease counts. Hook: `useCategory(slug)`.

### app/hospital/diseases/[slug].tsx
Disease list for a subcategory: name, short description, recording count, favorite
icon. Hooks: `useSubcategory(slug)`, `useFavorites`.

### app/hospital/disease/[slug].tsx — Disease detail (NOT IN FIGMA — implement per spec)
Disease name + full description, favorite button, recordings list (1st free; 2nd & 3rd
locked for free users), `AudioPlayer`, per-recording `DownloadButton`, share, feedback
section. Hooks: `useDisease`, `useRecordings`, `useFavorites`, `usePlayer`,
`useDownloadManager`.

### app/(tabs)/adhkar.tsx — Adhkar
Tab view: Morning, Evening, Sleep, Waking. Items with repeat counters, daleel button,
prev/next navigation. Lazy-load each tab on selection. Hook: `useAdhkar`.

### app/(tabs)/tahsinat.tsx — Tahsinat
Tab view: Self, For Others. Items with label, text, repetitions, hint; random-order
support; repeat counter. Hook: `useTahsinat`.

### app/(tabs)/favorites.tsx — Favorites
List of favorited diseases; tap to open detail (or play per Figma); swipe to remove;
sync-status indicator. Hook: `useFavorites`.

### app/(tabs)/more.tsx — More
My Downloads (list, storage usage, remove, clear all), sponsors list, courses
(WhatsApp button), notification preferences, theme toggle, language toggle, Mushaf
settings, Wi-Fi-only downloads toggle, logout, version info, Ask Me entry. Hooks:
`useDownloadManager`, `useSponsors`, `useCourses`, `useNotificationPreferences`,
`useSettings`.

### app/ask-me.tsx — Ask Me (AI chat)
Conversational interface that routes users to app sections or gives written guidance.
Graceful offline degradation ("No internet connection"). Backend AI endpoint TBD —
confirm before building (not in the current `api.php`).

## ONBOARDING & SPONSOR (overlays, not tabs)
- Onboarding pager — first launch only, auto-transition (`onboardingSlice`).
- Sponsor screen — every launch when enabled by admin; auto-dismiss after duration.
Both rendered from the root layout before `(tabs)`.

## SCREEN RULES
- Use `Header` with a working back button (`router.back()` — RULE_40).
- Loading → `Loader`; empty → `EmptyState`; error → `ErrorBoundary` / error view.
- Screens hold container logic; visual pieces are presentational components.
- Respect feature-visibility flags — hide a screen's entry point if its flag is off.
