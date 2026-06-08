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

### Rules

1. **All design-system colors live in `src/theme/colors.ts`** under the `palette` export. This is the single source of truth.
2. **Do not create local `FIGMA`, `BRAND_500`, `TEXT_PRIMARY`, `WHITE`, or similar constants** that duplicate palette values.
3. **To add a new color**, add it to `palette` in `colors.ts` — only when the value is a genuine design-system token used in more than one place.
4. **Component-specific opacity tints** (e.g. `rgba(255,255,255,0.18)` for a player overlay) may remain as local constants when they are not part of the global design system, but they must be documented inline.
5. **Exported color constants** (e.g. `export const ICON_ACTIVE`) must be assigned from `palette`, not from a hardcoded hex string.

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

## Style File Convention

- Component styles live in a `ComponentName.styles.ts` file **beside** the component file.
- Screen-level styles live in `src/styles/screenName.styles.ts`.
- Never place styles inline in screen or component files (except trivial one-liners like `{ flex: 1 }`).
- Import styles as a single aliased object: `import { fooStyles as s } from './Foo.styles';`

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
