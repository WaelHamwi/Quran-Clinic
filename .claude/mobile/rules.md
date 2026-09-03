# MOBILE GOLDEN RULES

Reconciled with the real codebase and the confirmed architecture decisions
(`project.md` → "Architecture Decisions"). Environment rules that are not repeated
here: see `.claude/mobile/CLAUDE.md` (ngrok, directory layout, package API
versions, auth bypass, offline mode) and `.claude/shared-context.md` (API response
envelope, HTTP status codes, rate limiting, file-size limit).

## ARCHITECTURE

- RULE_1 SEPARATE_LOGIC_FROM_UI — hooks/selectors hold logic, components render.
- RULE_2 REACT_QUERY_FOR_SERVER — all API fetching/caching/mutations via React Query.
- RULE_3 REDUX_FOR_APP_STATE — Redux Toolkit owns auth/session, subscription, audio
  player, downloads/offline, feature flags, onboarding/sponsor, favorites, settings,
  notifications, Mushaf reader state, global UI state. See `store-design.md`.
- RULE_4 NO_BUSINESS_STATE_IN_REACT_QUERY — React Query is server cache only; do not
  store app-wide business state in it.
- RULE_5 STATE_SEPARATION — keep three layers distinct: (1) server state = React
  Query, (2) application state = Redux slices, (3) ephemeral UI state = local
  component state or `uiSlice`.
- RULE_6 MODULAR_SLICES — one slice per domain, colocated selectors, typed hooks.
- RULE_7 REDUX_THUNK — use `createAsyncThunk` for async flows that touch multiple
  slices or coordinate with React Query.
- RULE_8 SELECTOR_MEMOIZATION — derived data via `createSelector`; never compute in
  `mapState`/inline.
- RULE_9 REDUX_PERSIST — persist auth, favorites, settings, onboarding, feature-flag
  cache, downloads index, notification prefs, Mushaf reader state via `redux-persist`
  + `AsyncStorage`. The auth **token** stays in `expo-secure-store`, not persisted state.

## UI & STYLING

- RULE_10 CUSTOM_UI_ONLY — build components with `StyleSheet`. No React Native Paper
  or other component library.
- RULE_11 NO_INLINE_STYLES — styles come from `StyleSheet.create`, defined outside
  the component or memoized when theme-dependent.
- RULE_11a SEPARATE_STYLES_FILE — every component with styles MUST have a sibling
  `ComponentName.styles.ts` file. Never put `StyleSheet.create` inside a `.tsx` file.
  Export as `export const myComponentStyles = StyleSheet.create({...})` and import as
  `import { myComponentStyles as s } from './MyComponent.styles'`.
- RULE_11b COLOR_CONSTANTS — in `.styles.ts` files, declare each color as a standalone
  `const BRAND_500 = '#hex'` (SCREAMING_SNAKE_CASE). Never group colors into an object
  (`const FIGMA = {}`, `const F = {}`, etc.).
- RULE_11c LAYOUT_FILES_THIN — files under `app/**/_layout.tsx` must be pure
  re-exports with zero logic, zero styles, and zero JSX. Move all navigation/screen
  config into a named component in `src/components/layout/`, then re-export it:
  `export { MyLayout as default } from '@/components/layout/MyLayout'`.
- RULE_12 THEME_SYSTEM — colours/spacing/typography come from the Theme system
  (`src/theme/`), consumed via `useTheme`. No hard-coded hex in components.
- RULE_13 FIGMA_FIDELITY — layout, colours, spacing, typography match the Figma
  (`project.md` → Figma reference).
- RULE_14 RTL_AND_I18N — Arabic/English supported; respect RTL where the Figma does;
  text comes from `src/i18n/`.

## PERFORMANCE

- RULE_15 MEMOIZE — `useMemo` for derived data, `useCallback` for handlers passed to
  children, `React.memo` for pure list items.
- RULE_16 NO_INLINE_PROPS — no inline arrow functions, objects, or arrays in props.
- RULE_17 OPTIMIZED_LISTS — `FlatList` with `useCallback` `renderItem`/`keyExtractor`,
  `removeClippedSubviews`, `maxToRenderPerBatch`, `windowSize`, `getItemLayout` for
  fixed-height rows.
- RULE_18 DEBOUNCE_SEARCH — `useDebounce` (300 ms) on all search inputs.
- RULE_19 LAZY_MEDIA — `expo-image` with placeholders; load only visible/adjacent
  heavy content; clean up audio resources on unmount.

## CODE QUALITY

- RULE_20 TYPE_SAFETY — strict TypeScript, no `any`, explicit interfaces in `src/types/`.
- RULE_21 IMPORT_ALIAS — ALL cross-directory imports MUST use `@/` alias; NEVER use `../` or `./` for imports outside the current directory. Example: `import { styles } from '@/styles/components/Button.styles'` not `import { styles } from '../../styles/components/Button.styles'`.
- RULE_22 SCREENS_ONLY_IN_APP — only files with `export default function Screen()` go
  in `app/`. Hooks/services/types/components live in `src/`.
- RULE_23 CACHE_KEYS — centralized React Query keys in `src/utils/cacheKeys.ts`.
- RULE_24 CUSTOM_HOOKS — extract reusable logic into hooks (`src/hooks/`).
- RULE_25 FILE_SIZE — honour the 450-line limit (see `shared-context.md`); split
  large files.

## BACKEND INTEGRATION

- RULE_26 BACKEND_HEADERS — every request includes `Accept: application/json` and
  `ngrok-skip-browser-warning: true`.
- RULE_27 RESPONSE_ENVELOPE — backend returns `{ success, data, message, meta, errors }`
  (see `shared-context.md`); services unwrap `data`.
- RULE_28 AUTH_TOKEN — request interceptor adds the bearer token from
  `expo-secure-store`; 401 → clear auth, 403 → subscription-required handling.

## DOMAIN

- RULE_29 HIERARCHY — Category → Subcategory → Disease → Recording.
- RULE_30 FAVORITES_DISEASES_ONLY — favorites store `disease_id` only.
- RULE_31 GENERAL_RUQYAH — quick-launch button plays the `is_general` disease audio
  directly, no intermediate screens.
- RULE_32 RECORDING_TYPES — max two recordings per owner: `summarized` (مختصرة) free;
  `detailed` (مطوّلة) requires subscription or trial. The wird screen switches types ONLY
  via the segmented type tabs (Figma 19214:3234) — no wird numbering, no swapping inside
  the reader area. Single source: `../shared-context.md` → RECORDING TYPES.
- RULE_33 ADHKAR_CATEGORIES — Morning, Evening, Sleep, Waking.
- RULE_34 TAHSINAT_CATEGORIES — Self, For Others; honour `random_order` when set.
- RULE_35 OFFLINE_FIRST — downloaded audio plays from cache; SQLite caches Quran/adhkar
  text; queue offline actions and retry on reconnect (see `offline-sync.md`).
- RULE_36 DOWNLOAD_MANAGER — dedicated per-recording download button, progress,
  cancel, retry, Wi-Fi-only default; free users may download the summarized recording only.
- RULE_37 SPONSOR_SCREEN — show at every launch when the admin flag is on.
- RULE_38 FEATURE_VISIBILITY — fetch flags on launch, cache offline, hide disabled.
- RULE_39 ONBOARDING_ONCE — welcome screens on first launch only, auto-transition.
- RULE_40 BACK_BUTTON — `router.back()` returns to the previous screen, never forces Home.

## FIGMA

- RULE_44 FIGMA_URL — https://www.figma.com/design/Yp5TOhLhIxZZmCRu3N0EfV/%D8%A7%D9%84%D9%85%D8%B4%D9%81%D9%89-%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86%D9%8A?node-id=12317-1780&p=f&t=c77LA8yKwWxlNZkZ-0

- RULE_45 DISEASE_PAGE_NOT_IN_FIGMA — the disease detail page is not prototyped;
  implement per `project.md` (name, description, favorite, recordings, player,
  download, feedback).

- RULE_46 FIGMA_ACCESS_PROTOCOL — When implementing from Figma, follow this exact sequence:

  1. **FIRST** — Verify MCP server is running at `http://127.0.0.1:3845/sse` using config file `C:\Users\wael\Desktop\Quran\.vscode\mcp.json`

  2. **SECOND** — Make exactly ONE attempt to fetch node data via MCP metadata tool with node_id parameter

  3. **THIRD** — If MCP metadata tool rejects the node_id parameter OR connection fails, immediately abort MCP and switch to direct Figma REST API:
     - Endpoint: `https://api.figma.com/v1/files/{FILE_KEY}/nodes?ids={NODE_ID}`
     - Headers: `{ "X-Figma-Token": "YOUR_PERSONAL_ACCESS_TOKEN" }`
     - Extract FILE_KEY and NODE_ID from RULE_44 FIGMA_URL

  4. **FOURTH** — Extract ALL styling in that single REST API call (colors, typography, spacing, layout, fills, effects)

  5. **FIFTH** — Cache extracted styles locally before writing any component code

  6. **NEVER** — Use screenshot tool (`get_screenshot`) as fallback

  7. **NEVER** — Retry failed connections more than once

  8. **NEVER** — Waste tokens on polling, reconnection loops, or repeated metadata tool calls