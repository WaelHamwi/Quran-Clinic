# HIERARCHY & NAVIGATION

Figma reference and the disease-page spec are defined once in `project.md`.

## CONTENT HIERARCHY (from SRS)
```
CATEGORIES            Physical Diseases · Personal Property · Homes & Relationships
│                     · Children · Diverse Ruqyah
│
├── SUBCATEGORIES     bones, chest, car, house, marriage, crying, general ruqyahs ...
│   │
│   ├── DISEASES      joint inflammation, fractures, anemia, asthma ...
│   │   └── RECORDINGS   summarized/مختصرة (free) · detailed/مطولة (subscription/trial)
│   │
│   └── ── OR ── RECORDINGS directly (subcategory is TERMINAL — no diseases)
│
├── ── OR ── DISEASES directly (category has no subcategories)
│   └── RECORDINGS   summarized/مختصرة (free) · detailed/مطولة (subscription/trial)
│
└── ── OR ── RECORDINGS directly (category is TERMINAL — no subcategories, no diseases)
```
- A recording owner has at most TWO recordings — one summarized (free) and one detailed
  (paid), switched only via the segmented type tabs on the record screen (Figma 19214:3234);
  no wird numbering, no swapping inside the reader area.
  Single source: `../shared-context.md` → RECORDING TYPES.
- `is_general = true` diseases power the General Ruqyah quick-launch (no drill-down).
- The backend API response for any category or subcategory includes `has_direct_recordings: bool`
  to let the mobile app detect the terminal level without a separate request.

## TERMINAL NODE NAVIGATION RULE
When the user taps a category or subcategory, the mobile app must inspect the node's type:
- **Category is TERMINAL** (`has_direct_recordings = true`) → navigate directly to the
  Ruqyah recordings page for that category. Do NOT show the subcategories screen.
- **Subcategory is TERMINAL** (`has_direct_recordings = true`) → navigate directly to the
  Ruqyah recordings page for that subcategory. Do NOT show the diseases screen.
- Otherwise follow the normal drill-down: Category → Subcategories → Diseases → Recordings.

The CMS guarantees a node is never both terminal and a parent, so the flag is authoritative.

## ROUTING MAP (Expo Router, file-based)
| Route | File | Purpose |
|---|---|---|
| `/(tabs)` | `app/(tabs)/_layout.tsx` | Tab navigator |
| `/` (Home) | `app/(tabs)/index.tsx` | ✓ built — General Ruqyah, categories, Mushaf entry, sponsor banner |
| `/mushaf` | `app/(tabs)/mushaf.tsx` | ✓ built — surah list + reciter selector |
| `/mushaf/[id]` | `app/mushaf/[id].tsx` | ✓ built — Quran reader + audio player |
| `/hospital` | `app/(tabs)/hospital.tsx` | Categories list + search |
| `/hospital/subcategories/[slug]` | `app/hospital/subcategories/[slug].tsx` | Subcategories for a category |
| `/hospital/diseases/[slug]` | `app/hospital/diseases/[slug].tsx` | Diseases for a subcategory |
| `/hospital/disease/[slug]` | `app/hospital/disease/[slug].tsx` | Disease detail + recordings (NOT in Figma) |
| `/adhkar` | `app/(tabs)/adhkar.tsx` | Adhkar tabs: Morning, Evening, Sleep, Waking |
| `/tahsinat` | `app/(tabs)/tahsinat.tsx` | Tahsinat tabs: Self, For Others |
| `/favorites` | `app/(tabs)/favorites.tsx` | Favorited diseases |
| `/more` | `app/(tabs)/more.tsx` | Downloads, sponsors, courses, settings, logout |
| `/ask-me` | `app/ask-me.tsx` | AI chat interface |
| `/login` | `app/login.tsx` | ✓ exists — unreachable while auth is bypassed |

**Route params use `slug`** for categories, subcategories, and diseases — the backend
exposes `/categories/{slug}`, `/subcategories/{slug}`, `/diseases/{slug}`. Surahs and
recitations use numeric `id`.

## TAB BAR
Current tabs: Home, Mushaf. Target tabs (Figma order to confirm against the design):
**Home · Hospital · Adhkar · Tahsinat · Mushaf · Favorites · More.**
If 7 tabs is too dense for the Figma, fold Favorites/Adhkar/Tahsinat reachable via
Home and keep ~5 tabs — decide from the Figma. Tab icons and styling come from the
Figma; the current `_layout.tsx` uses emoji placeholders.

## NAVIGATION RULES
- **Back button (FR-5.1)** — `router.back()` returns to the previous screen. Never
  force-navigate to Home on back. Use a custom header with an explicit back control.
- **General Ruqyah** — plays immediately; no navigation into the hierarchy.
- **Favorites tap** — opens the disease detail screen (or plays directly per Figma).
- **Deep links** — notification taps route into `/adhkar` with the matching tab.
- **Disease detail** — reached only from a diseases list; favorite toggle and player
  state persist via Redux so navigating away/back keeps playback.

## NAVIGATION STATE OWNERSHIP
- Route params (`slug`, `id`) — owned by Expo Router, not Redux.
- The currently playing recording, mini-player visibility, and selected tabs inside
  Adhkar/Tahsinat — owned by Redux (`playerSlice`, `uiSlice`) so they survive
  navigation. See `store-design.md`.
