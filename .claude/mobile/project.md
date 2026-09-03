# QURANIC CLINIC — MOBILE (React Native Expo)

> Plan document. Cross-component rules live in `.claude/shared-context.md`.
> Mobile environment rules (ngrok, `app/` vs `src/` layout, package API versions,
> auth bypass, offline mode, existing Mushaf key files) live in
> `.claude/mobile/CLAUDE.md` — **read it before touching any file**.

## PROJECT IDENTITY
- Name: Quranic Clinic (Al-Mashfa Al-Qurani)
- Path: `C:\Users\wael\Desktop\Quran\mobile`
- Stack: React Native 0.81.5 · Expo SDK 54 · Expo Router v6 · TypeScript 5.7 (strict)
- Server state: TanStack React Query v5
- Client / app state: Redux Toolkit + redux-persist
- UI: Custom components on React Native `StyleSheet` + in-house Theme system — **no component library**
- Navigation: Expo Router v6 (file-based)
- Storage: `expo-sqlite` ~16 (offline text cache) · `expo-file-system` ~19 legacy (audio files) · `AsyncStorage` (key-value persistence) · `expo-secure-store` (auth token)
- Audio: existing Mushaf uses `expo-av`; new audio uses `expo-audio` (see CLAUDE.md package rules)
- Test runtime: Expo Go on physical Android devices, backend tunnelled via ngrok

## ⚠ ARCHITECTURE DECISIONS (supersede the original draft)
The original draft plan named Redux + React Native Paper + MMKV + Formik. Confirmed:

1. **STATE** — Redux Toolkit is the **primary client/app-state layer**. React Query
   handles **server state only** (fetching, caching, mutations, pagination,
   background refetch). Do not push app-wide business state into React Query.
   See `store-design.md`.
2. **UI** — Custom `StyleSheet` components + the existing Theme system.
   React Native Paper is **not** used. See `components-design.md`.
3. **PERSISTENCE** — `redux-persist` backed by `AsyncStorage`.
   `react-native-mmkv` is **not** used — it cannot run in Expo Go (the test runtime).
4. **FORMS** — Few real forms exist (OAuth login, feedback, notification prefs).
   Use controlled components + small validators. Formik/Yup optional, only if a
   genuinely complex form appears; they are not installed.
5. **MUSHAF** — already built and shipped. **Do not change its behaviour.**
   Only restyle it to the Figma. See "Existing Mushaf" below and `screens-design.md`.

## FIGMA DESIGN REFERENCE (single source for visual design)
Figma: https://www.figma.com/design/Yp5TOhLhIxZZmCRu3N0EfV/%D8%A7%D9%84%D9%85%D8%B4%D9%81%D9%89-%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86%D9%8A?node-id=12317-1780&p=f&t=c77LA8yKwWxlNZkZ-0

- Every screen's layout, colours, spacing, and typography must match the Figma.
- **Disease detail page (3rd level) is NOT prototyped in the Figma.** Implement it as:
  disease name + full description, favorite button, recordings list (1st / 2nd / 3rd
  session), audio player, per-recording download button, feedback section
  ("Was this useful? Yes / No" + optional comment). Recordings belong to the
  **disease** level — not the subcategory.
- To build screens accurately, Claude needs either the Figma MCP connector enabled
  or exported screenshots/specs per screen. Plain URLs are not readable by Claude.

## CONTENT HIERARCHY (from SRS)
`Category → Subcategory → Disease → Recording (1st / 2nd / 3rd session)`
A Category may also hold Diseases directly (no Subcategory).
Any level (Category, Subcategory, or Disease) can be TERMINAL by holding recordings directly.
A terminal node has no children — the CMS enforces this constraint.
When navigating, check `has_direct_recordings` on the current node: if true, redirect
immediately to the Ruqyah recordings page and skip the next drill-down level.
Full routing and terminal-redirect rules in `hierarchy-navigation.md`.

## BUSINESS RULES (from SRS)
- **General Ruqyah** — quick-launch button plays the `is_general` disease audio
  immediately, with no intermediate screens.
- **Favorites** — DISEASES only. Not adhkar, not Quran, not courses. Store `disease_id`.
- **Recording access** — each disease/subcategory/category has at most TWO recordings:
  `type=summarized` (مختصرة) free for everyone; `type=detailed` (مطوّلة) requires an active
  subscription or trial. The record screen switches types ONLY via the segmented type tabs
  (Figma 19214:3234) — no wird numbering and no swapping inside the reader area.
  Single source: `.claude/shared-context.md` → RECORDING TYPES.
- **Search** — tolerant of synonyms/aliases, supports Arabic and English.
- **Adhkar** — categories: Morning, Evening, Sleep, Waking.
- **Tahsinat** — categories: Self-fortification, Fortification for others.
- **Quran (Mushaf)** — see "Existing Mushaf" — already implemented, restyle only.
- **Offline** — downloaded ruqyah audio plays from cache; no silent auto-cache;
  a dedicated download button per recording.
- **Sponsor screen** — shown at every app launch when enabled by an admin flag.
- **Feature visibility** — admin flags fetched on launch decide which features show.
- **Onboarding** — welcome screens appear on first launch only, auto-transition.

## EXISTING MUSHAF — ALREADY BUILT (do not corrupt)
The original draft described a 604-page WebP image reader. **That is not what was
built.** The shipped Mushaf is **surah + audio-recitation** based:

- `app/(tabs)/mushaf.tsx` — surah list with a reciter selector.
- `app/mushaf/[id].tsx` — one surah: verse list (Arabic, EN toggle), audio player
  with seek bar, per-verse highlight synced to recitation timing, prev/next surah,
  per-reciter download button.
- State via `MushafContext` (`selectedSurahId`, `selectedReciterId`).
- Services: `quranService`, `offlineStorage` (SQLite text cache), `audioService`.
- Hooks: `useSurahs`, `useSurah`, `useReciters`, `useAudio`, `useVerseTiming`.

**Scope of allowed Mushaf work: restyle to the Figma only.** Keep all functionality,
hook APIs, and service contracts identical. Any state migration to Redux must be
behaviour-preserving (see `store-design.md` → "Existing Context bridge").

## DIRECTORY STRUCTURE — current (✓) and target (＋)
```
mobile/
├── app/                          # Expo Router — screen components ONLY
│   ├── (tabs)/
│   │   ├── _layout.tsx           ✓ tab navigator (Home, Mushaf today)
│   │   ├── index.tsx             ✓ Home
│   │   ├── mushaf.tsx            ✓ Surah list
│   │   ├── hospital.tsx          ＋ Categories / Ruqyah
│   │   ├── adhkar.tsx            ＋ Adhkar tabs
│   │   ├── tahsinat.tsx          ＋ Tahsinat tabs
│   │   ├── favorites.tsx         ＋ Favorited diseases
│   │   └── more.tsx              ＋ Settings / downloads / sponsors / courses
│   ├── mushaf/[id].tsx           ✓ Quran reader
│   ├── hospital/                 ＋ subcategories/[slug], diseases/[slug], disease/[slug]
│   ├── ask-me.tsx                ＋ AI chat
│   ├── _layout.tsx               ✓ root layout (auth bypass lives here)
│   └── login.tsx                 ✓ login (unreachable while auth bypassed)
├── src/
│   ├── auth/                     ✓ AuthProvider
│   ├── components/               ✓ AppSplash — ＋ common/ forms/ lists/ players/ quran/ layout/ onboarding/
│   ├── context/                  ✓ Auth, Language, Mushaf, Theme (bridged to Redux — see store-design.md)
│   ├── hooks/                    ✓ useAudio, useReciters, useSurah, useSurahs, useVerseTiming — ＋ feature hooks
│   ├── i18n/                     ✓ ar.ts, en.ts
│   ├── lib/                      ✓ tokenManager
│   ├── navigation/               ✓ navigation.styles
│   ├── providers/                ✓ QueryProvider, config — ＋ StoreProvider
│   ├── services/                 ✓ api, audioService, googleAuth, offlineStorage, quranService — ＋ feature services
│   ├── store/                    ＋ store.ts, hooks.ts, slices/
│   ├── styles/                   ✓ home, mushaf, reader — ＋ per-screen styles
│   ├── theme/                    ✓ colors — ＋ spacing, typography tokens
│   ├── types/                    ✓ recitation, reciter, surah, translatable, verse — ＋ feature types
│   └── utils/                    ＋ cacheKeys, formatters, validators
└── assets/                       ✓ app icons (no 604-page mushaf images — not used)
```

## CORE ARCHITECTURE RULES (summary — full list in `rules.md`)
- Separate logic from UI: hooks/selectors hold logic, components render.
- Server state → React Query. App/client/UI state → Redux Toolkit slices.
- Memoize: `useMemo`, `useCallback`, `React.memo`, `createSelector`.
- Optimized `FlatList` for every list. No inline styles/objects/functions in props.
- Strict TypeScript — no `any`. Cross-directory imports use the `@/` alias.
- Every backend request sends `Accept: application/json` + `ngrok-skip-browser-warning: true`.

## READY SIGNAL
Mobile plan loaded. Stack reconciled to the real codebase. Mushaf = restyle only.
Build roadmap and status in `phase-assignment.md`.
