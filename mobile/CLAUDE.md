# Mobile — Claude Rules

## API URL Priority Rule

**Local backend always has priority in dev. Production (Mashfa) is the fallback — never the default.**

The resolution order, implemented in `src/services/api.ts` and `src/services/apiClient.ts`:

1. **Hard override** — if `EXPO_PUBLIC_API_URL` is set in `.env`, that URL is used everywhere, no other logic runs.
2. **Release build** — always production; no local logic.
3. **Dev build** — `API_URL` is always set to `LOCAL_API_URL` at startup. There is **no reachability probe** — probing was removed because it produced false negatives (e.g. `localhost` on Android refers to the device, not the host machine).
4. **Per-request fallback** — if a request to local fails with a network error or 404, `apiClient.ts` retries it once against production. Auth errors (401/403) and validation errors (422) are **never** retried — they are real failures.

### `LOCAL_API_URL` resolution (native)

- **Android emulator**: `localhost`/`127.0.0.1` → remapped to `10.0.2.2` (AVD's alias for the host machine's loopback)
- **Physical device**: host IP derived from Expo dev-server `hostUri` or `linkingUri`
- **Explicit override**: set `EXPO_PUBLIC_API_URL_LOCAL` to a non-localhost URL (e.g. `http://192.168.1.x:8000/api`) if auto-detection fails on physical device

### Rules for Claude

- **Never hardcode** any URL in a service or hook file. All requests go through `apiClient.ts` which reads `api.API_URL` at call time.
- **Never add a startup reachability probe** — it was removed intentionally. Probes cause false negatives on native where `localhost` is not the dev machine.
- **Never set `EXPO_PUBLIC_API_URL`** in `.env` permanently — it disables local dev entirely.
- Do not change the per-request fallback conditions without understanding the auth/validation exclusion.

---

## Color Convention

**Never define hex color literals in style or component files.**

Import `palette` from `@/theme/colors` and reference design tokens directly:

```ts
import { palette } from '@/theme/colors';

// ✅ correct
backgroundColor: palette.brand[500],
color: palette.text.primary,
borderColor: palette.border.secondary,

// ❌ wrong — never do this
backgroundColor: '#135452',
color: '#181d27',
```

### Theme tokens vs. palette — light/dark mode

**Every surface/text/border colour must come from the active `theme` (light/dark aware), NOT from `palette` directly.** `palette` is the raw colour atlas (single source of truth for values); `theme` is the semantic, mode-aware layer built from it in `colors.ts` (`lightTheme` / `darkTheme`, type `Theme`).

- A `.styles.ts` file exports a **factory**: `export const createStyles = (theme: Theme) => StyleSheet.create({ ... })`. Reference `theme.card`, `theme.text`, `theme.primary`, `theme.cardBorder`, etc. — never `palette.*` for a normal surface/text colour.
- The component consumes it with the **`useStyles` hook**: `const s = useStyles(createStyles);` (from `@/hooks/useStyles`). Colours used as JSX props (icon `color=`, `placeholderTextColor=`) come from `const { theme } = useTheme();`.
- Light values of every `theme` token equal the original Figma `palette` colour, so light mode is unchanged; dark values live in `darkTheme`.

**When is a direct `palette.*` ref still correct?** Only for colours that are intentionally **constant across light & dark** — decorative/brand accents (category tile fallbacks `palette.tileFallback`, flag fills `palette.flags`, sponsor logo box, AI mint avatar), semantic warning/error *tints* with no theme token, shadow colour (`palette.shadow`), and the Mushaf **reader** parchment canvas (`reader.styles.ts` is a deliberately preserved fixed surface). Document each such ref inline.

### Rules

1. **All raw colour values live in `src/theme/colors.ts`** (`palette`). Semantic light/dark tokens live in the same file (`lightTheme`/`darkTheme`, `Theme` type).
2. **Themed surfaces/text/borders → `theme.*` via `createStyles(theme)`.** Do **not** create local `FIGMA`, `BRAND_500`, `TEXT_PRIMARY`, `WHITE` constants, and do not reach for `palette.*` when a `theme` token exists.
3. **To add a new semantic colour**, add a token to the `Theme` type + `lightTheme` + `darkTheme` (light value = exact Figma colour). To add a new raw value, add it to `palette`.
4. **Component-specific opacity tints** (e.g. `rgba(255,255,255,0.18)`) and fixed scrims/shadows may remain as local constants when they are not part of the global design system, but they must be documented inline.
5. **No exported colour constants** like `export const ICON_ACTIVE` from a `.styles.ts` — pass `theme.*` from the component instead (the old pattern of exporting `ICON_*`/`*_COLOR` consts has been removed).

### Palette quick reference

| Token | Value | Usage |
|---|---|---|
| `palette.brand[500]` | `#135452` | Primary brand / CTA background |
| `palette.brand[600]` | `#0f4342` | Brand tertiary text / links |
| `palette.brand[700]` | `#0b3231` | Player background |
| `palette.brand[25]` | `#ebfafa` | Active row / icon bubble background |
| `palette.brand[50]` | `#d5e9e9` | Number pill border |
| `palette.text.primary` | `#181d27` | Main body text |
| `palette.text.secondary` | `#414651` | Secondary / subtitle text |
| `palette.text.tertiary` | `#535862` | Meta / hint text |
| `palette.text.placeholder` | `#717680` | Input placeholder |
| `palette.text.onBrand` | `#ffffff` | Text on brand-colored backgrounds |
| `palette.text.secondaryOnBrand` | `#aac8c8` | Muted text on brand backgrounds |
| `palette.border.primary` | `#d5d7da` | Input / button borders |
| `palette.border.secondary` | `#e9eaeb` | Card borders |
| `palette.border.tertiary` | `#f5f5f5` | Dividers / top-bar border |
| `palette.bg.overlay` | `rgba(255,255,255,0.5)` | Top-bar translucent background |
| `palette.shadow` | `#313940` | `shadowColor` for elevation |
| `palette.white` | `#ffffff` | White backgrounds |
| `palette.system.error[500]` | `#f04438` | Error / destructive states |
| `palette.secondaryGreen[600]` | `#469b34` | Green action buttons |
| `palette.secondaryGreen[300]` | `#97d88a` | Active dot indicator |

## Style File Convention — TOP PRIORITY, NON-NEGOTIABLE

**Never mix CSS (styles) with TSX. Styles ALWAYS live in their own file.** This rule
overrides convenience — if a component has an inline `StyleSheet.create`, extract it
before doing anything else, and never introduce a new one.

- Component styles live in a `ComponentName.styles.ts` file **beside** the component file.
- Screen-level styles live in `src/styles/screenName.styles.ts`.
- **Never** place a `StyleSheet.create` block inside a `.tsx` file. The only inline styles
  allowed are trivial one-liners (`{ flex: 1 }`) or values that MUST be dynamic at runtime
  (e.g. a computed `marginTop` from safe-area insets) — and even those stay minimal.

### Themed-factory pattern (the one and only way to define styles)

Every `.styles.ts` exports a **factory** keyed on the active theme, and the component
consumes it with the `useStyles` hook. This is what makes light/dark mode work everywhere.

```ts
// Foo.styles.ts
import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: { backgroundColor: theme.card, borderColor: theme.cardBorder, padding: spacing.lg },
  });
```

```tsx
// Foo.tsx
import { useStyles } from '@/hooks/useStyles';
import { createStyles } from './Foo.styles';

function Foo() {
  const s = useStyles(createStyles);          // memoized, re-themes on toggle
  // const { theme } = useTheme();             // only if a colour is needed as a JSX prop
  return <View style={s.card} />;
}
```

- A themeless factory still takes the param: `(_theme: Theme) => StyleSheet.create({ ... })`.
- Use spacing/typography/radius **tokens** (`spacing.lg`, `fontSize.sm`, `radius.md`), not raw
  numbers, whenever an exact token exists.
- Do **not** export a plain style object (`export const fooStyles = StyleSheet.create(...)`)
  or colour constants — that pattern was fully removed in the theming migration.
- When touching any `.tsx`/`.styles.ts` still on the old static pattern, migrate it to the
  factory as part of the change — do not leave new code that violates this rule.

## Bilingual Content Rule — Arabic + English Required

**All content in the mobile app — both dynamic (from the API) and static (hardcoded strings) — must hold both `ar` and `en` values.**

The backend uses **Spatie Translatable**, which means every translatable field is returned as a JSON object:

```ts
// API response shape for any translatable field
{ ar: "اسم السورة", en: "Surah Name" }
```

### Dynamic content (API responses)

- Type all translatable fields as `{ ar: string; en: string }` — never type them as `string`.
- Select the active locale from the app's language state at render time.
- Never hard-access only one key (`item.name.ar`) — always go through the locale selector.

```ts
// ✅ correct
type TranslatableField = { ar: string; en: string };

const label = item.name[currentLocale]; // currentLocale is 'ar' | 'en'

// ❌ wrong — hard-coded locale
const label = item.name.ar;
```

### Static content (hardcoded strings)

- Any user-facing string must be defined with both `ar` and `en` entries.
- Place shared string maps in `src/i18n/` (or the locale file for that feature).

```ts
// ✅ correct
const labels = {
  ar: { title: 'المصحف', empty: 'لا توجد نتائج' },
  en: { title: 'Mushaf', empty: 'No results found' },
};

const title = labels[currentLocale].title;

// ❌ wrong — single language only
const title = 'المصحف';
```

### Locale state

- The active locale is `'ar' | 'en'`.
- It lives in the Redux store (or a dedicated i18n context) — never derive it from device locale alone without a user preference fallback.
- Default locale: `'ar'`.

## Type Definition Convention

**Shared, exported types live in `src/types/`; single-use component prop types stay co-located.**

The goal is one obvious home for every type without churning the codebase with needless files.

### What belongs in `src/types/<domain>.ts`

- **Data models** — the shape of anything from the API (`Disease`, `Recording`, `Category`, …).
- **Cross-module contracts** — any `type`/`interface` that is imported by **more than one module**, or
  that is exported from one module and consumed in another (e.g. the `Wird*` source contract in
  `src/types/wird.ts`, consumed by both the hook and the screen).
- One domain per file, named after the domain (`wird.ts`, `disease.ts`). Import via the `@/types/*` alias.
- A type is defined **once**. Do not re-export it from the hook/component that happens to use it —
  point every consumer at `@/types/*` so there is a single source of truth.

### What stays co-located (do NOT move)

- **Component / hook prop types** used by a single file — keep the `type Props = { … }` at the top of
  that `.tsx`/`.ts`. Moving single-use prop shapes into `src/types/` adds import noise for zero benefit
  and is **not** wanted.
- A prop shape only graduates to `src/types/` once a **second** module needs it.

### Rules for Claude

1. New shared/data/contract type → add it to `src/types/<domain>.ts` (create the domain file if absent).
2. Never duplicate a type definition; never re-export it as a convenience — fix the import instead.
3. Leave single-use `Props` types where they are. Don't refactor them into `src/types/` "for tidiness."
4. When a co-located type gains a second consumer, promote it to `src/types/` and update both imports.

## Commenting Convention — Don't Narrate Code

**Do not write comments that describe *what* the code does. Code is the source of truth; let it speak.**

When writing or editing any file, **do not add** a comment unless it carries information the code
cannot. Default to **no comment**. Never add a JSDoc/prose block that just summarizes a function,
hook, or component's behaviour — that is exactly the noise to avoid.

### Remove / never write (useless)

- Prose blocks narrating what a function/hook/component does or returns
  (`/** Recordings metadata for a disease, sorted by session… */`).
- Restatements of the line below them (`// loop over recordings`, `// set loading to true`).
- Decorative section labels that add no information (`// ── Main content area ──`).
- Refactor/history meta (`// behaviour preserved exactly`, `// moved from X`).

### Keep / allowed to write (carries real information)

- **Why**, not what — a non-obvious decision or trade-off
  (`// The summarized (مختصرة) recording is free for all; the detailed (مطولة) one needs a subscription`).
- **Business rules** and edge-case reasoning that aren't evident from the code.
- **Traceability** — Figma node IDs (`Figma node 18032:3119`), ticket refs, spec links.
- **Mandated inline notes** required by other rules in this file — e.g. the Color Convention's
  documentation of each intentional `palette.*` exception. These take precedence; keep them.
- **Concise contract docs on a shared/exported type** in `src/types/*` that explain a field's
  non-obvious meaning (`/** False when the recording is a paid session and the user lacks access. */`).

### Rule of thumb

If deleting the comment loses **no** information a competent reader couldn't get from the code in
~5 seconds, the comment is useless — don't write it (and remove it if you're already editing the
file). When in doubt, prefer a clearer name or smaller function over a comment.

## Linting

ESLint is configured with **Expo's official flat config** (`eslint.config.js`, `eslint-config-expo`).

```bash
npm run lint         # fails on errors only (warnings allowed) — use in CI
npm run lint:strict  # fails on any warning too (use when ratcheting)
npm run lint:fix     # auto-fix
```

- Pin **ESLint to v9** — v10 breaks `eslint-plugin-react-hooks` (`getFilename` removed).
- `eslint-config-expo` enables `eslint-plugin-react-hooks` v6's experimental React-Compiler rules
  (`refs`, `set-state-in-effect`, `immutability`, `preserve-manual-memoization`) as **errors**.
  These flag many correct patterns, so they're downgraded to **warnings** in `eslint.config.js`.
  Don't rewrite app hooks just to satisfy them — that's a React Compiler migration, do it
  deliberately. The codebase currently has 0 errors / ~70 warnings; ratchet warnings down over time.

## Testing Convention

Runner: **Jest + `jest-expo` preset** (`jest.config.js`). The `@/` alias maps to `src/`; tests are
`src/**/*.test.{ts,tsx}`.

```bash
npm test            # run once
npm run test:watch  # watch mode
```

- **Co-locate** tests in a `__tests__/` folder next to the code (e.g.
  `src/store/slices/__tests__/authSlice.test.ts`).
- **Reliable, no-native layers (write these freely):** pure utils (`src/utils/*`), Redux slice
  reducers + selectors (test `reducer(state, action)` and pass a partial `RootState` to selectors),
  and services (mock `@/services/apiClient`).
- A module importing `@/services/api`, `expo-*`, or native modules must be **mocked**
  (`jest.mock('@/services/api', () => ({ API_URL: 'http://test/api' }))`). `jest-expo` mocks most
  Expo native modules already.
- **Hooks** → `renderHook` from `@testing-library/react-native` (+ `jest.useFakeTimers()` for
  time-based hooks). **Components** → `render`/`fireEvent`; mock `@/context/ThemeContext` and
  `@/hooks/useStyles` so the test targets behavior, not styling.
- **Pin `@testing-library/react-native` to v13** — v14 fails to resolve its renderer under this
  jest-expo/React 19 setup (`Cannot find module 'test-renderer'`).
- `jest.config.js` extends the preset's `transformIgnorePatterns` to also transform
  `@reduxjs/toolkit` & the redux ecosystem (jest-expo resolves them to their TS source).
- Never start Expo to run tests; Jest runs standalone.
- Bilingual/locale logic: when testing a locale selector, assert **both** `ar` and `en` paths.

## Server / Port Convention

Never start Expo or any dev server. The user runs the terminal themselves.

## Figma MCP Convention

When the user asks for Figma-based styling, use the local Figma MCP server — **one connection, one call, no retries**.

**Config:** `.vscode/mcp.json` → SSE at `http://127.0.0.1:3845/sse`

**Protocol (Node.js, single script):**
1. GET `/sse` → read the `data: /messages?sessionId=…` line → extract `sessionId`
2. POST `/messages?sessionId=…` with `initialize` (protocolVersion `2024-11-05`)
3. POST `/messages?sessionId=…` with `tools/call` → `get_design_context` (nodeId, clientLanguages: `typescript`, clientFrameworks: `react-native`)
4. Wait ~8 s for SSE `data:` response, write to a temp file, destroy the SSE connection
5. Never reconnect or retry — if the server is not running, ask the user to start it
