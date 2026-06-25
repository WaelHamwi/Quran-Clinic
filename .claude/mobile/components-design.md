# COMPONENTS DESIGN

All components are **custom**, built on React Native `StyleSheet` + the Theme system.
No React Native Paper or other component library. Styles come from `StyleSheet.create`
(theme-dependent styles via a `createXStyles(theme)` factory, memoized — matching the
existing `reader.styles.ts` / `mushaf.styles.ts` pattern). List items are `React.memo`.

## EXISTING ✓ (built)
- `src/components/AppSplash.tsx` — splash screen.
- Mushaf-internal components in `app/mushaf/[id].tsx`: `SeekBar`, `VerseRow`
  (already `React.memo`). Restyle to the Figma only; keep behaviour.

## src/components/common/
- **Button** — `title`, `onPress`, `variant` ('primary'|'secondary'|'outline'|'ghost'),
  `loading`, `disabled`, `fullWidth`, `icon`. `React.memo`.
- **Card** — `children`, `onPress?`, `elevation`, `style`. Pressable variant uses
  `useCallback`.
- **Loader** — `size`, `fullScreen`. Themed spinner.
- **EmptyState** — `icon`, `title`, `message`, `actionLabel?`, `onAction?`.
- **ErrorBoundary** — catches render errors, themed fallback + retry.
- **Badge** — small count/lock/status pill (used for locked sessions, download count).
- **IconButton** — circular pressable icon (back, favorite, download, share).
- **ProgressBar** — linear/circular; used by downloads and the audio player.

## src/components/layout/
- **Screen** — safe-area wrapper, optional `KeyboardAvoidingView`, optional scroll,
  themed background. Every screen renders inside it.
- **Header** — back button (`router.back()` — RULE_40), title, right actions
  (favorite/share/download). Custom, not the default Expo Router header.
- **TabBar** — custom bottom tab bar matching the Figma; badge for active downloads.
- **SectionHeader** — titled section divider for Home / More.

## src/components/lists/
List components wrap `FlatList` with the optimizations in `optimization.md`
(`useCallback` `renderItem`/`keyExtractor`, `removeClippedSubviews`,
`maxToRenderPerBatch`, `windowSize`, `getItemLayout`).
- **CategoryGrid / CategoryList** — renders `CategoryCard`.
- **SubcategoryList** — renders `SubcategoryCard`.
- **DiseaseList** — renders `DiseaseCard`; passes `isFavorited` per row.
- **RecordingList** — renders `RecordingCard`.
- **AdhkarList** — renders `AdhkarItemRow`; prev/next navigation.
- **TahsinatList** — renders `TahsinatItemRow`; supports random order.

## Card / row components (all `React.memo`)
- **CategoryCard** — name, icon, background image (`expo-image`). `useCallback` press.
- **SubcategoryCard** — name, disease count.
- **DiseaseCard** — name, short description, favorite icon, recording count.
  Custom `React.memo` comparator on `disease.id` + `isFavorited`.
- **RecordingCard** — session number/title, duration, play button, download button +
  `ProgressBar`; lock badge for sessions 2/3 when the user is free-tier.
- **AdhkarItemRow** — text, repetitions, counter buttons, "daleel" (evidence) button.
- **TahsinatItemRow** — label, text, repetitions, hint.
- **CourseCard** — course info + WhatsApp action.
- **SponsorCard** — sponsor logo + name.

## src/components/forms/
Minimal — the app has few real forms (OAuth login, feedback, notification prefs).
Plain controlled components + small validators; no Formik/Yup unless a complex form
appears later.
- **TextField** — label, value, error, `onChangeText`, themed.
- **Checkbox** — boolean field (terms acceptance, prefs).
- **Toggle** — switch for settings (theme, Wi-Fi-only, notification toggles).
- **SearchBar** — debounced (300 ms via `useDebounce`), Arabic + English, `onSearch`,
  `placeholder`, `autoFocus`.
- **FeedbackControl** — "Was this useful? Yes / No" + optional comment field.

## src/components/players/
- **AudioPlayer** — full player for ruqyah recordings; uses `usePlayer`. Shows
  progress bar, time labels, play/pause, ±skip, speed control.
- **MiniPlayer** — floating bar pinned above the tab bar while audio plays
  (`playerSlice.miniPlayerVisible`); title, play/pause, close.
- **GeneralRuqyahButton** — prominent quick-launch control on Home; uses
  `useGeneralRuqyah`; plays immediately, no navigation.
- **DownloadButton** — per-recording download trigger with progress/cancel/retry;
  uses `useDownloadManager`.

## src/components/quran/ (Mushaf — restyle only)
The Mushaf is built. Treat these as **restyle targets**, not new builds. Do not
introduce the obsolete 604-page viewer.
- Reader header, `VerseRow`, `SeekBar`, reciter selector, download/cached badge —
  all already exist inside `app/mushaf/*` and `app/(tabs)/mushaf.tsx`. Restyle to
  match the Figma; keep all behaviour and props.

## src/components/onboarding/
- **OnboardingPager** — Welcome / Teaser / Description / Explanatory screens;
  auto-transition, no nav buttons; first launch only (`onboardingSlice`).
- **SponsorScreen** — shown at every launch when the admin flag is on; sponsor logo;
  auto-dismiss after the configured duration (default 3 s).

## COMPONENT RULES
- Presentational only — no direct service/Redux calls in dumb components; receive
  data + callbacks via props. Container logic lives in screens/hooks.
- No inline styles/objects/functions in props (RULE_11, RULE_16).
- Theme tokens only — no hard-coded colours (RULE_12).
- Keep files under 450 lines; split when larger.
