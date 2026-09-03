# 78. DSA & Memory Deep Dive of the Refactored Code — Every Array, Closure, Ref and Allocation

> *This section takes the exact code from §76–§77 and explains it the way a compiler
> sees it: what data structure each value is, where it is allocated (stack vs heap),
> what each algorithm costs in Big-O, and how the optimization choices keep memory
> and re-renders down. Read §70 first for the memory-model fundamentals; this section
> applies them to real lines.*

## 78.1 `getIdxAtMs` — binary-search candidate vs. the linear scan actually used

The hot path of audio→verse highlighting is `getIdxAtMsRef.current` in
[useReaderScroll.ts](mobile/src/hooks/useReaderScroll.ts):

```ts
getIdxAtMsRef.current = (posMs: number): number => {
  if (verseTiming && verseTiming.length > 0) {
    for (let i = verseTiming.length - 1; i >= 0; i--) {       // scan from the END backwards
      if (posMs >= verseTiming[i].timestampFrom) return i;     // first verse whose start we've passed
    }
    return 0;
  }
  if (verseStartFractions.length === 0 || audio.durationMillis === 0) return -1;
  const progress = posMs / audio.durationMillis;               // 0..1 position in the track
  for (let i = verseStartFractions.length - 1; i >= 0; i--) {
    if (progress >= verseStartFractions[i]) return i;
  }
  return 0;
};
```

**The data structure.** `verseTiming` is a sorted array of
`{ timestampFrom, … }` — strictly ascending by `timestampFrom`. The question "which
verse is playing at `posMs`?" is a **predecessor query**: find the last element
`≤ posMs`.

**The algorithm chosen — reverse linear scan, O(n).** The loop walks from the last
verse backwards and returns the first index whose `timestampFrom ≤ posMs`. Because
playback positions are near-monotonic (the listener is usually near the end of what
they've heard), the reverse scan typically returns within the first few iterations.

**The textbook alternative — binary search, O(log n).** Since the array is sorted, a
predecessor query *could* use binary search:

```ts
// not used here — shown for the trade-off
let lo = 0, hi = verseTiming.length - 1, ans = 0;
while (lo <= hi) {
  const mid = (lo + hi) >> 1;                 // floor((lo+hi)/2) via bit shift
  if (verseTiming[mid].timestampFrom <= posMs) { ans = mid; lo = mid + 1; }
  else hi = mid - 1;
}
return ans;
```

**Why linear wins *here*.** The longest surah has 286 verses; most have far fewer.
For n ≤ 286, log₂ n ≈ 8 vs. an *expected* 1–5 iterations for the reverse scan given
monotonic playback. Binary search also adds two more branch mispredictions per call
and is easier to get wrong (off-by-one at the boundary). This is the correct
engineering call: **the asymptotically worse algorithm is faster in the real input
regime and simpler to verify.** Documenting *why* the O(n) scan beats the O(log n)
search for this n is exactly the kind of reasoning the optimization sections ask
for — Big-O is about growth, not a verdict at n = 286.

**Memory of this function:** zero heap allocation per call. `i`, `posMs`,
`progress` are numbers living in the call frame on the **stack**; they evaporate on
return. The only heap object touched is the pre-existing `verseTiming` array (read,
never copied). Called up to 4×/second during playback, it must be allocation-free —
and it is.

## 78.2 `verseCumChars` / `totalChars` — a prefix-sum array (precompute once, O(1) lookup)

```ts
const verseCumChars = useMemo(() => {
  if (!surah) return [] as number[];
  let cum = 0;
  return surah.verses.map((v) => { const s = cum; cum += v.text.ar.length; return s; });
}, [surah]);

const totalChars = useMemo(
  () => (surah ? Math.max(1, surah.verses.reduce((s, v) => s + v.text.ar.length, 0)) : 1),
  [surah]
);
```

This is a **prefix-sum (cumulative sum) array**, one of the most useful DSA
patterns. `verseCumChars[i]` = total Arabic characters in verses `0..i-1`.

**Why it exists.** `scrollToVerseRef.current(idx)` needs "what fraction of the
surah's text comes before verse `idx`?" to place that verse proportionally in the
scroll viewport:

```ts
const targetY = blockTop + (verseCumChars[idx] ?? 0) / totalChars * blockH - 150;
```

Without the prefix sum, computing that fraction would re-sum verses `0..idx` on every
scroll tick — O(n) per call, O(n²) over a full surah scroll. With it:

| Phase | Cost | Where the memory lives |
|---|---|---|
| Build (once per surah, in `useMemo`) | O(n) time, **one heap array of n numbers** | Heap; identity stable until `surah` changes (the `[surah]` dep) |
| Lookup per scroll tick | **O(1)** — a single array index + divide | Stack-only arithmetic |

`Math.max(1, …)` on `totalChars` is a **divide-by-zero guard**: an empty/loading
surah would make the denominator 0 and produce `NaN`/`Infinity` for `targetY`. The
`?? 0` on `verseCumChars[idx]` guards an out-of-range index during the brief window
before the memo recomputes. Both are cheap insurance for the async gap between "surah
id changed" and "verses arrived".

**Character-proportional vs. verse-count-proportional.** A naive scroll would use
`idx / verses.length`. That is wrong because Al-Baqara's verse 282 (the longest in
the Qur'an) occupies far more vertical space than a 3-word verse. Weighting by
*character count* makes the highlight land where the eye actually is. `verseStartFractions`
(§76) is the same idea normalized to 0..1 for the timing-less fallback.

## 78.3 `reciters` via `flatMap` — filter+map+unwrap in one pass, and why `[]`/`[x]` is the trick

```ts
const reciters = useMemo(
  () =>
    recitations.flatMap((r) =>
      r.reciter && !unavailableReciterIds.has(r.reciter_id) ? [r.reciter] : []
    ),
  [recitations, unavailableReciterIds]
);
```

`flatMap` = `map` then flatten one level. Returning `[r.reciter]` keeps the element;
returning `[]` drops it. So this single pass simultaneously:

1. **filters** out recitations with no reciter or an unavailable one, and
2. **maps** each survivor from a `Recitation` to its nested `Reciter`.

The equivalent `.filter(...).map(...)` would walk the array **twice** and allocate an
intermediate array between the two. `flatMap` does it in **one pass with one output
array**. The `[x] : []` idiom is the canonical functional way to express "emit zero
or one element" without a separate filter step.

**Membership test cost.** `unavailableReciterIds.has(r.reciter_id)` is a `Set.has`,
which is **O(1)** average (hash lookup). If `unavailableReciterIds` were an array,
`.includes` would be O(m) per element → O(n·m) overall. Choosing a `Set` for the
"unavailable" collection is a deliberate DSA decision that turns a quadratic filter
into a linear one.

**Memory:** `flatMap` allocates exactly one result array on the **heap**, sized to
the number of available reciters. Because it is wrapped in `useMemo([recitations,
unavailableReciterIds])`, that array keeps a **stable identity** until either input
changes — so the `<FlatList data={filteredReciters}>` does not see a "new" array on
unrelated re-renders and skips re-diffing its rows (§70 re-render cost).

## 78.4 `filteredReciters` — case-folded substring search, short-circuited

```ts
const filteredReciters = useMemo(() => {
  const q = reciterSearch.trim().toLowerCase();
  if (!q) return reciters;                                    // empty query → return the SAME array
  return reciters.filter(
    (r) => r.name.ar.toLowerCase().includes(q) || (r.name.en ?? '').toLowerCase().includes(q)
  );
}, [reciters, reciterSearch]);
```

* `if (!q) return reciters;` — when the search box is empty, return the *existing*
  `reciters` reference, **not** a new filtered copy. This preserves identity (no
  needless FlatList re-render) and skips the whole scan. `!q` is `true` for the empty
  string — the cheapest possible early-out.
* `r.name.ar.toLowerCase().includes(q) || (r.name.en ?? '').toLowerCase().includes(q)`
  — checks Arabic first; the `||` **short-circuits**, so for an Arabic query that
  matches, the English branch (and its `.toLowerCase()` allocation) never runs. The
  `?? ''` makes a missing English name a no-match instead of a crash.
* Cost: O(n·L) where L is the average name length — fine for ~50 reciters typed one
  keystroke at a time. The memo dep `reciterSearch` means it recomputes per keystroke
  but not on unrelated re-renders.

## 78.5 The eight refs of `useReaderScroll` — what each costs and why it isn't state

```ts
const scrollRef = useRef<ScrollView>(null);
const contentHeightRef = useRef(0);
const lastScrolledIndexRef = useRef(-1);
const versesTopRef = useRef(0);
const versesHeightRef = useRef(0);
const scrollToVerseRef = useRef((_idx: number) => {});
const pagerRef = useRef<FlatList<Verse[]>>(null);
const lastPageRef = useRef(-1);
const currentPageRef = useRef(0);
```

Each `useRef(x)` allocates **one tiny heap object** `{ current: x }` on the first
render and returns that *same object* forever after. The cell is mutated in place;
mutation triggers **no** render. This is the entire reason these are refs:

| Ref | Holds | Written from | Why a ref (not state) |
|---|---|---|---|
| `scrollRef`, `pagerRef` | the native scroll handle | React on mount (`ref=`) | Imperative handle for `scrollTo`/`scrollToIndex`; not render data. |
| `versesTopRef`, `versesHeightRef`, `contentHeightRef` | layout geometry (px) | `onLayout` every layout pass | Written many times per second; as state it would re-render the whole verse list each measurement. |
| `lastScrolledIndexRef`, `lastPageRef` | the last auto-scrolled index/page | the playback effect | A **dedup latch** — "did I already scroll to this?" prevents fighting the user's manual scroll. Pure control state, never displayed. |
| `currentPageRef` | the current page, *synchronously* | viewability + scroll handlers | Read inside the same tick it is written, before a state update would have committed. |

`lastScrolledIndexRef` deserves a name: it is a **debounce/idempotency guard**. The
playback effect runs ~4×/s; without the latch it would call `scrollTo` every tick
even when the active verse hasn't changed, producing jitter and cancelling the user's
own scrolling. `if (idx !== lastScrolledIndexRef.current)` collapses that to "scroll
only on an actual verse change" — an O(1) comparison that saves dozens of redundant
native scroll calls per minute.

## 78.6 `handleContinuousScroll` — deriving the page from an offset in O(1)

```ts
const handleContinuousScroll = useCallback(
  (e) => {
    const y = e.nativeEvent.contentOffset.y;
    if (pages.length > 0 && versesHeightRef.current > 0) {
      const relativeY = Math.max(0, y - versesTopRef.current);     // offset INTO the verse block
      const pageH = versesHeightRef.current / pages.length;        // average page height
      const idx = Math.max(0, Math.min(pages.length - 1, Math.floor(relativeY / pageH)));  // clamp into range
      if (idx !== currentPageRef.current) {                        // only update on change
        currentPageRef.current = idx;
        setCurrentPageIndex(idx);
      }
    }
  },
  [pages.length]
);
```

This converts a scroll offset into a Mushaf page index with pure arithmetic — no
search, no loop, **O(1)** per scroll event (and scroll events fire *constantly*, so
O(1) is mandatory). `Math.max(0, Math.min(len-1, …))` is the standard **clamp**
idiom: floor-divide to a raw index, then bound it to `[0, len-1]` so over-scroll
bounce at the top/bottom can't produce a negative or out-of-range page. The
`if (idx !== currentPageRef.current)` guard again ensures `setCurrentPageIndex`
(a re-render) fires only when the page genuinely changes, not on every pixel of
scroll. Reading and writing `currentPageRef` synchronously means the *next* scroll
event in the same gesture already sees the updated value without waiting for React's
async state commit.

## 78.7 Backend memory & cost: `match(true)` builder selection and the bulk update

Re-examining `Recording::creating` (§77.2) at the allocation level:

```php
$query = match (true) {
    (bool) $recording->category_id    => static::where('category_id', $recording->category_id),
    (bool) $recording->subcategory_id => static::where('subcategory_id', $recording->subcategory_id),
    default                           => static::where('disease_id', $recording->disease_id),
};
$recording->session_number = ($query->max('session_number') ?? 0) + 1;
```

* `match(true)` evaluates arm conditions top-to-bottom and **stops at the first
  `true`** — it never builds more than one query. The `(bool)` casts are stack-only
  integer→bool conversions.
* `static::where(...)` allocates **one** `Builder` object on the PHP heap (a
  fluent/builder pattern instance). `->max('session_number')` compiles it to a
  single `SELECT MAX(session_number) … WHERE … LIMIT 1`, executes via PDO, and
  returns a scalar — **no model hydration**, so memory is O(1) regardless of how many
  recordings the group has.
* `?? 0` handles the empty group on the PHP side (null coalescing), avoiding a
  `null + 1 = 1` ambiguity.

The `saved` hook's `$siblings->update(['is_free' => false])` is the memory
counterpart to "no N+1": instead of loading every sibling into model objects (heap
cost O(k)) and saving each (k queries), it issues **one** `UPDATE … WHERE` — O(1)
PHP memory, one round-trip — to flip all stale-free rows. This is the single most
important scalability habit in Eloquent: *mutate sets with one query, don't loop
models*.

## 78.8 Where each refactored value lives — a stack/heap ledger

| Value | Kind | Stack or heap | Lifetime |
|---|---|---|---|
| `surahId`, `posMs`, `idx`, `cum`, `progress` | number primitives | **stack** (in their call frame) | one function call |
| `verseCumChars`, `verseStartFractions`, `reciters`, `filteredReciters` | arrays | **heap**, identity pinned by `useMemo` | until deps change |
| `scrollRef`, `versesHeightRef`, … (refs) | `{current}` boxes | **heap**, identity pinned by `useRef` | component lifetime |
| `getIdxAtMs`, `scrollToVerse` (wrappers) | closures | **heap**, identity pinned by `useCallback([])` | component lifetime |
| `getIdxAtMsRef.current` body | closure, **reassigned each render** | **heap**, new each render (old one GC'd) | one render |
| `handleSeek`, `handlePlay` (orchestrator glue) | closures | **heap**, re-created when `[audio, scroll]` change | until deps change |
| `$query`, `$siblings` (PHP builders) | objects | PHP **heap** (request-scoped) | one request |

The pattern is consistent and intentional: **render-affecting collections are
memoized arrays on the heap with pinned identity; per-tick scalars are stack
primitives that never allocate; "latest value" caches and native handles are heap
refs that never re-render.** That triad is what makes the reader smooth at 60fps
while audio drives it 4×/second.

---

# 79. The `!` Operator Family — Line-by-Line, With Every Occurrence Explained

> *The user asked specifically: "clarification why using `!`." The single character
> `!` means four different things across this codebase depending on language and
> position. Confusing them is a common source of bugs, so this section is a complete,
> example-driven reference keyed to the actual lines above.*

## 79.1 The four meanings of `!`

| Form | Name | Language | Runtime effect | Example from this project |
|---|---|---|---|---|
| `!x` | **Logical NOT** | TS & PHP | inverts a boolean (after coercion) | `if (!q) return reciters;` |
| `x!` (postfix) | **Non-null assertion** | TypeScript *only* | **compile-time only** — erased at runtime; tells the type-checker "trust me, not null/undefined" | `verseTiming![0].timestampFrom` |
| `prop!: T` | **Definite-assignment assertion** | TypeScript | compile-time — "this is assigned before use even though I don't initialize it here" | class field declarations |
| `!!x` | **Double-NOT (to-boolean)** | TS & PHP | coerces any value to a real `true`/`false` | `const next = hasSourceRef.current && !status.isLoaded && !ready;` (the `!`s here) |

The two that look alike but are opposites in *risk*: **`!x` (prefix)** is a real
runtime operation; **`x!` (postfix)** is a *promise to the compiler* that disappears
at runtime and crashes nothing on its own — but if the promise is wrong, you get a
runtime `undefined` access. Knowing which is which is essential.

## 79.2 Logical NOT — guard clauses and early-outs

This is the overwhelmingly common use, and almost always appears in a **guard
clause** (an early `return`/`throw` that handles the negative case first so the happy
path stays un-indented).

```ts
if (!q) return reciters;                         // §78.4 — empty query: skip the scan
if (!surah) return [] as number[];               // §78.2 — no data yet: empty result
if (!currentRecitation || !selectedReciterId) return;   // §76.2 — can't play without both
```

```php
if (! empty($r->subcategory_id)) { … }           // §77.2 — only when a parent is set
if (! $recording->session_number) { … }          // §77.2 — only when unset
if (! $recording->is_free) return;               // §77.2 Rule D — early-exit guard
if (! $base) return;                             // §77.4 — nothing to slug from
```

**Why it reads well:** `if (!x) return;` means "if the precondition fails, leave
now." Every function then continues knowing its inputs are valid, with one less level
of nesting. In PHP, `! empty($x)` is the idiomatic "x is set and truthy" (treating
`null`, `0`, `''`, `[]` uniformly as "absent"), which is exactly the semantics wanted
for nullable foreign keys.

**Coercion to watch:** `!x` first coerces `x` to boolean. In JS the falsy set is
`false, 0, '', null, undefined, NaN`; in PHP it additionally includes `'0'` and `[]`.
So `!q` being true for the empty string is *intended* here — that is the whole point
of the empty-search early-out.

## 79.3 Non-null assertion `x!` — the postfix one, used sparingly and only when proven

```ts
const timingLoaded = verseTiming != null && verseTiming.length > 0;
const firstVerseMs = timingLoaded ? verseTiming![0].timestampFrom : 0;
//                                            ^ postfix ! — "verseTiming is definitely not null here"
```

Here `verseTiming` is typed `VerseTiming[] | undefined`. Inside the ternary, the
`timingLoaded` flag has **already** proven `verseTiming != null`, but TypeScript's
narrowing doesn't carry that proof across the separate `const`. The postfix `!` tells
the compiler "I checked — index 0 is safe," avoiding either a redundant `?.` (which
would change the type to `number | undefined`) or a clumsier restructure.

**The rule this project follows:** a postfix `!` is only acceptable when a *visible*
prior check guarantees non-null on the same code path (as `timingLoaded` does here).
It is **erased at compile time** — it generates no runtime code and provides no
runtime protection. If the guarantee is wrong, you get a plain `Cannot read property
'0' of undefined` at runtime. That is why it is used here exactly once, next to its
proof, and not sprinkled to silence the type-checker. When non-null *isn't* already
proven, the codebase uses `?.` + `??` instead (e.g. `verseCumChars[idx] ?? 0`,
`r.name.en ?? ''`).

## 79.4 Double-NOT `!!` — coercing to a true boolean

```ts
const isBasmalahPhase = !!surah && surah.id !== 1 && surah.id !== 9;
```

`surah` is `SurahWithVerses | undefined`. `!!surah` converts it to a strict boolean:
`!surah` is `true` when absent → `!!surah` is `false` when absent, `true` when
present. Why bother, when `surah && …` already short-circuits? Because the result is
*assigned to a `boolean`-typed const*; `surah && …` would widen the type to
`SurahWithVerses | false`. `!!` forces a clean `boolean`, which keeps the const's
type honest and avoids leaking the object into a boolean context downstream. It is
the idiomatic "cast anything to a real boolean" in both JS and PHP (`(bool)$x` is
PHP's explicit equivalent, used in the `match(true)` arms of §77.2).

## 79.5 Combined example — reading the IDE-selected loading effect line by line

The loading-state effect in [PlayerContext.tsx](mobile/src/context/PlayerContext.tsx)
packs three `!`s into one expression; here is each:

```ts
const ready = status.playing || (status.currentTime ?? 0) > 0;
const next  = hasSourceRef.current && !status.isLoaded && !ready;
if (next !== loadingActive) dispatch(setLoading(next));
```

| Token | Meaning | Reads as |
|---|---|---|
| `status.playing \|\| (status.currentTime ?? 0) > 0` | — | "track is *ready* if it's playing **or** has advanced past 0" |
| `!status.isLoaded` | logical NOT | "the player has **not** reported loaded" |
| `!ready` | logical NOT | "and it is **not** yet ready by our fallback test" |
| `hasSourceRef.current && … && …` | — | "a source is attached **and** both not-loaded conditions hold" |
| `next !== loadingActive` | `!==` (not `!`) | "only dispatch when the value actually changed" — the same idempotency guard pattern as §78.5 |

So `next` is `true` exactly when "a source is attached but the track is neither
loaded nor making progress" → show the spinner. The two prefix `!`s invert the two
positive signals (`isLoaded`, `ready`) into the negative condition the spinner needs.
The trailing `!==` is **not** the `!` operator — it is the strict-inequality
operator, here used as the standard "skip the dispatch if nothing changed" guard that
prevents a redundant Redux action (and the re-render it would cause).

## 79.6 Quick decision guide

* Need to **invert a condition / write a guard clause** → prefix `!x` (or PHP
  `! empty($x)`).
* Need to **coerce to a real boolean for a typed const / a `match(true)` arm** →
  `!!x` (TS) or `(bool)$x` (PHP).
* The value is **statically `T | null | undefined` but you've already proven it's
  present on this path** → postfix `x!` — and put it right next to the proof.
* You have **not** proven presence → do **not** reach for `!`; use `?.` and `??`
  instead, which fail safe at runtime.

---

*This block (§76–79) documented the two recent refactors — the Mushaf reader split
into an orchestrator plus four domain hooks, and the Disease/Recording redefinition —
then dissected that code at the level of data structures, algorithms, memory, and the
`!` operator family.*

*The reference continues at **§80** with the **Visual Memory Atlas**: drawn diagrams
of the stack and heap on both sides (Hermes/JS and PHP-FPM), frame-by-frame call
walks, closure environments, zvals and copy-on-write — followed by **§81**, the
**Cache Atlas**, which traces where every cached byte physically lives (TanStack
Query's in-RAM map, the SQLite files, the PHP worker heap, Redis db1, the MySQL
buffer pool), and **§82**, one end-to-end journey of a single tap through every
memory region in the system.*
