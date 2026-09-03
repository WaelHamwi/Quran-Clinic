# 83. Algorithm Animation Gallery — Every Core Algorithm, Pointer by Pointer

> *This section is a flip-book. Each algorithm used in the project is drawn as a
> sequence of frames: the array/tree as boxes, the pointers (`i`, `j`, `lo`, `hi`,
> `cum`) as arrows underneath, one frame per step, with the project line the frame
> executes. Read a frame, look where the pointer moved, read the next frame — you
> are watching the algorithm run.*

## 83.1 The reverse predecessor scan — `getIdxAtMs(posMs)`

The playback highlighter (§78.1) answers "which verse contains position 5300 ms?"
by walking **right → left** and stopping at the first start-time it has passed:

```ts
for (let i = verseTiming.length - 1; i >= 0; i--) {
  if (posMs >= verseTiming[i].timestampFrom) return i;
}
```

The array (values = `timestampFrom` in ms), and the pointer `i` frame by frame for
`posMs = 5300`:

```
 index:        0        1        2        3        4        5        6
 value:  ┌──────┬────────┬────────┬────────┬────────┬────────┬────────┐
         │    0 │  4100  │  9800  │ 15400  │ 21000  │ 27700  │ 33100  │
         └──────┴────────┴────────┴────────┴────────┴────────┴────────┘

 FRAME 1                                                          i ──▶ 6
         5300 >= 33100 ?  NO  → i--                                  ▲
 FRAME 2                                                 i ──▶ 5
         5300 >= 27700 ?  NO  → i--                         ▲
 FRAME 3                                        i ──▶ 4
         5300 >= 21000 ?  NO  → i--                ▲
 FRAME 4                               i ──▶ 3
         5300 >= 15400 ?  NO  → i--       ▲
 FRAME 5                      i ──▶ 2
         5300 >=  9800 ?  NO  → i--  ▲
 FRAME 6             i ──▶ 1
         5300 >=  4100 ?  YES ──▶ return 1   ✓ verse 2 is playing
                        ▲
```

**What the picture teaches:** the pointer only ever moves left, one cell per frame —
that is the definition of O(n). But notice *where playback usually is*: during
continuous listening, `posMs` grows tick by tick, so the answer is almost always
found within 1–2 frames of the previous answer. The pointer's *expected* travel is
tiny even though its *worst-case* travel is the whole array — the practical argument
for preferring this over binary search at n ≤ 286 (§78.1).

## 83.2 Binary search on the same array — three pointers halving

The textbook alternative (shown in §78.1, not used in the hot path) keeps **three**
pointers — `lo`, `hi`, and their midpoint — and throws away half the array per frame:

```
 index:     0       1       2       3       4       5       6
 value:  [  0 ][ 4100 ][ 9800 ][15400 ][21000 ][27700 ][33100 ]      posMs = 5300

 FRAME 1   lo=0                 mid=3                       hi=6
            ▲                     ▲                           ▲
           15400 <= 5300 ?  NO → answer is LEFT of mid → hi = mid-1 = 2

 FRAME 2   lo=0        mid=1           hi=2
            ▲            ▲              ▲
           4100 <= 5300 ?  YES → remember ans=1, go RIGHT → lo = mid+1 = 2

 FRAME 3          lo=2 = mid = hi
                        ▲
           9800 <= 5300 ?  NO → hi = mid-1 = 1 → lo > hi → STOP, return ans = 1  ✓
```

Same answer, 3 frames instead of 6 — but each frame costs *two* pointer updates and
a harder-to-verify boundary rule. The gallery shows both so the trade-off is
visual: **linear scan moves one pointer simply; binary search moves two pointers
cleverly.** Cleverness only pays when the array is big.

## 83.3 Building the prefix-sum — one pointer, one accumulator

`verseCumChars` (§78.2) is built by a single left-to-right pass where the *running
total* `cum` is written **before** being increased — that ordering is the whole
algorithm:

```ts
let cum = 0;
return surah.verses.map((v) => { const s = cum; cum += v.text.ar.length; return s; });
```

Input verse lengths `[42, 55, 38, 61]`, output array built frame by frame:

```
              verse lengths:   [ 42 ][ 55 ][ 38 ][ 61 ]

 FRAME 1   ptr ──▶ v0 (len 42)     cum = 0
           write out[0] = 0        cum ← 0+42  = 42      out: [ 0 ]
 FRAME 2   ptr ──▶ v1 (len 55)     cum = 42
           write out[1] = 42       cum ← 42+55 = 97      out: [ 0 ][ 42 ]
 FRAME 3   ptr ──▶ v2 (len 38)     cum = 97
           write out[2] = 97       cum ← 97+38 = 135     out: [ 0 ][ 42 ][ 97 ]
 FRAME 4   ptr ──▶ v3 (len 61)     cum = 135
           write out[3] = 135      cum ← 135+61 = 196    out: [ 0 ][ 42 ][ 97 ][ 135 ]
                                   totalChars = 196
```

Now the payoff drawn — *"how far down the page is verse 2?"* is a single division,
no loop, no pointer movement at all:

```
   fraction before v2  =  out[2] / totalChars  =  97 / 196  =  0.495
   targetY = blockTop + 0.495 × blockHeight    ← one multiply, O(1), every scroll tick
```

The pass costs O(n) **once per surah**; every later question costs O(1). That
"spend a pointer walk now, answer with arithmetic forever" trade is the essence of
precomputation — the same reasoning behind an index in MySQL (§30).

## 83.4 Fisher–Yates shuffle — two pointers, one swap per frame

The ruqyah queue and randomized adhkar sections shuffle with the canonical
Fisher–Yates, from [sections.ts](mobile/src/utils/sections.ts):

```ts
function shuffle<T>(input: readonly T[]): T[] {
  const a = [...input];                              // copy — never mutate the cache's array
  for (let i = a.length - 1; i > 0; i--) {           // i = boundary between "unshuffled | done"
    const j = Math.floor(Math.random() * (i + 1));   // j = random partner in [0..i]
    [a[i], a[j]] = [a[j], a[i]];                     // swap
  }
  return a;
}
```

Watch `[A, B, C, D]` shuffle. `i` sweeps right→left; everything **right of `i` is
final** (drawn in ⟦⟧); `j` jumps randomly into the unshuffled zone:

```
 FRAME 0     [ A ][ B ][ C ][ D ]          start: copy made, nothing final

 FRAME 1     i=3, random j=1
             [ A ][ B ][ C ][ D ]
                    ▲j        ▲i    swap B↔D
             [ A ][ D ][ C ]⟦ B ⟧   ← slot 3 is now FINAL

 FRAME 2     i=2, random j=2   (j may equal i — the element "swaps with itself")
             [ A ][ D ][ C ]⟦ B ⟧
                         ▲i=j       swap C↔C (no-op)
             [ A ][ D ]⟦ C ⟧⟦ B ⟧   ← slot 2 final

 FRAME 3     i=1, random j=0
             [ A ][ D ]⟦ C ⟧⟦ B ⟧
               ▲j    ▲i             swap A↔D
             [ D ]⟦ A ⟧⟦ C ⟧⟦ B ⟧   ← slot 1 final; slot 0 is forced → DONE

 RESULT      [ D ][ A ][ C ][ B ]
```

**Why this and not `sort(() => Math.random() - 0.5)`?** Two visible reasons:
1. Every element gets swapped into its final slot exactly once → **O(n)**, and every
   one of the n! orderings is equally likely (the random `j` range shrinking with
   `i` is what makes it uniform). The random-comparator hack is both biased and
   O(n log n).
2. The first line `const a = [...input]` — the copy — is drawn in Frame 0 for a
   reason: the input array belongs to the **TanStack cache** (§81.3). Swapping in
   place would scramble the cached data for every other screen. Copy first, then
   mutate *your own* heap array (the same ownership rule as `[...(query.data ?? [])].sort` in §77.3).

## 83.5 `Set.has` vs `Array.includes` — a bucket jump vs a pointer crawl

`useReaderRecitations` filters unavailable reciters with a `Set` (§78.3). The
difference between the two data structures is *pointer movement*, drawn:

```
  Array.includes(7):  the pointer must CRAWL —  O(n)
      [ 3 ][ 12 ][ 5 ][ 9 ][ 7 ][ 14 ]
        ▲    ▲     ▲    ▲    ▲
        3≠7  12≠7  5≠7  9≠7  7=7 ✓   5 hops

  Set.has(7):  the pointer JUMPS straight to a bucket —  O(1)
      hash(7) = 7 mod 8 = bucket 7
      buckets: [0]      [1]      …      [7]
                                         │
                                         └─▶ { 7 } ✓   1 hop
```

A hash set is an array of **buckets**; `hash(key)` computes the bucket index
directly — the "search" is replaced by arithmetic, exactly like the prefix-sum
replaced the scroll loop in §83.3. Inside the reciter filter, this runs once per
recitation per render; with an array it would be a nested crawl (n × m pointer
hops), with the `Set` it is n bucket jumps.

The same picture explains **three other structures in the project**:
* TanStack's cache `Map` (§81.3) — bucket jump by hashed queryKey string.
* Redis's keyspace (§81.4) — the server-side twin: `GET quran_cache:categories`
  is a bucket jump inside Redis's own hash table, which is why a cache hit is
  ~0.2 ms regardless of how many keys exist.
* Eloquent's eager-load dictionary (§84.2 below) — buckets keyed by foreign key.

## 83.6 The sort comparator as a decision tree — free sessions first

`useRecordings` orders sessions with a two-level comparator (§77.3):

```ts
list.sort((a, b) => {
  if (a.is_free !== b.is_free) return a.is_free ? -1 : 1;   // level 1: free first
  return a.session_number - b.session_number;                // level 2: session order
});
```

Every pairwise comparison the sort makes walks this tree:

```
                     compare(a, b)
                          │
             a.is_free !== b.is_free ?
                ┌─────────┴─────────┐
              YES                   NO (same tier)
                │                    │
        a.is_free ?          a.session_number - b.session_number
        ┌───────┴──────┐             │
      -1 (a first)   +1 (b first)   <0 a first · 0 keep · >0 b first
```

And the effect on real data, before → after:

```
  before:  [ s3·paid ][ s1·FREE ][ s4·paid ][ s2·paid ]
  after:   [ s1·FREE ]│[ s2·paid ][ s3·paid ][ s4·paid ]
            └ tier 1 ─┘└──── tier 2, by session_number ────┘
```

A comparator returning negative/zero/positive is the universal sorting contract
(same in PHP's `usort`, SQL's `ORDER BY is_free DESC, session_number`): **the
comparator is a tiny pure function; the sort algorithm just moves pointers according
to its verdicts.** Composing tiers as "compare the distinguishing field first, fall
through to the tiebreaker" is how any multi-column ORDER BY works in memory.

## 83.7 Slug linear probing — the collision pointer

`Disease::assignSlug` (§77.4) probes for a free slug the way open addressing probes
for a free hash slot. Creating a third "Anxiety" disease:

```
  taken slugs (unique index, incl. soft-deleted): { anxiety, anxiety-1, stress, fear }

  FRAME 1   candidate: "anxiety"      EXISTS? ──▶ yes   n=1
  FRAME 2   candidate: "anxiety-1"    EXISTS? ──▶ yes   n=2
  FRAME 3   candidate: "anxiety-2"    EXISTS? ──▶ no ✓  assign
                          │
                          └── each frame = ONE indexed SELECT … LIMIT 1
```

The pointer here is the counter `n` walking the virtual sequence
`base, base-1, base-2, …`. The `withTrashed()` in the query is what makes the
"taken" set in the drawing include soft-deleted rows — without it Frame 1 would
report "free", the INSERT would hit the unique index, and the request would 500.
The drawing makes the bug you *didn't* get visible.

## 83.8 The ruqyah queue — an index pointer over an immutable array

The general-ruqyah player (§72.2) is a classic **queue-by-index**: the track list is
frozen at shuffle time; playback state is just a pointer:

```
  Redux (heap):   queue.recordings ──▶ [ R4 ][ R1 ][ R7 ][ R2 ]   (shuffled once)
                  queue.index = 0

  track ends ──▶ auto-advance:  index 0 ──▶ 1
       [ R4 ][ R1 ][ R7 ][ R2 ]        [ R4 ][ R1 ][ R7 ][ R2 ]
         ▲ playing                             ▲ playing
  … end …  index ──▶ 2 … end … index ──▶ 3 … end: index+1 = 4 = length → STOP
```

Advancing is `index + 1`, never `array.shift()`. The drawing shows why: `shift()`
would *move every remaining element one slot left* (n pointer writes per track, and
a mutation of a Redux-owned array). Incrementing the index moves **one number** and
leaves the array untouched — which also keeps time-travel/debugging honest, since
Redux state stays immutable (§70). The edge `index+1 === length` is the natural
end-of-queue sentinel.

---

# 84. Loading the Content Tree Without N+1 — the Dictionary Match, Drawn

> *The clinic's home screen needs the full tree: categories → subcategories →
> diseases (+ counts). This section draws the naive N+1 disaster, then the three
> queries Eloquent actually runs for
> [CategoryRepository.php](backend/app/Repositories/CategoryRepository.php), and —
> the part almost never drawn anywhere — the **in-memory dictionary stitch** that
> assembles the tree after the queries return.*

## 84.1 The trap, drawn: N+1 pointer trips to the database

The innocent-looking loop:

```php
$categories = Category::all();               // 1 query
foreach ($categories as $c) {
    foreach ($c->subcategories as $s) { … }  // lazy-load: +1 query PER category
}
```

```
  PHP heap                          MySQL
  ┌─────────┐   Q1: SELECT * FROM categories        ──▶  8 rows
  │ cat #1  │──▶ Q2: … WHERE category_id = 1        ──▶  network round-trip
  │ cat #2  │──▶ Q3: … WHERE category_id = 2        ──▶  network round-trip
  │   …     │        …                                    …
  │ cat #8  │──▶ Q9: … WHERE category_id = 8        ──▶  network round-trip
  └─────────┘
       9 queries for 8 categories — and another +N when each subcategory
       lazy-loads its diseases. Tree depth multiplies the N.
```

Each arrow is a full round-trip: serialize SQL → network → parse → plan → execute →
network → hydrate. Latency, not CPU, is what kills it — 9 × ~1 ms of round-trip
dwarfs the query work itself, and it grows linearly with content.

## 84.2 What the repository actually runs — 3 queries + 2 dictionary matches

```php
return Category::active()->ordered()
    ->with([
        'subcategories'  => fn ($q) => $q->active()->ordered()->withCount('diseases'),
        'directDiseases' => fn ($q) => $q->active()->ordered(),
    ])
    ->get();
```

**Phase 1 — three set-based queries, regardless of row counts:**

```
  Q1  SELECT * FROM categories    WHERE is_active = 1 ORDER BY display_order
      ──▶ ids collected: [1, 2, 3, 4]

  Q2  SELECT *, (SELECT COUNT(*) FROM diseases d
                 WHERE d.subcategory_id = subcategories.id) AS diseases_count
      FROM subcategories WHERE category_id IN (1, 2, 3, 4) AND is_active = 1
                                          ▲▲▲▲▲▲▲▲▲▲▲▲
                            the collected ids, injected as ONE WHERE IN

  Q3  SELECT * FROM diseases WHERE category_id IN (1, 2, 3, 4) AND is_active = 1
```

**Phase 2 — the dictionary match, in PHP memory.** Eloquent now holds two flat
arrays and must build the tree. It does **not** nest loops (that would be the N+1's
CPU twin, O(parents × children)); it builds a **hash dictionary keyed by foreign
key** — the same bucket structure as §83.5 — then each parent does one bucket jump:

```
  flat children (Q2 result):                dictionary (group by category_id):
  [ sub#10 cat_id=1 ]                        ┌────────────────────────────────┐
  [ sub#11 cat_id=1 ]          ── build ──▶  │ 1 ──▶ [ sub#10, sub#11 ]       │
  [ sub#12 cat_id=2 ]             O(m)       │ 2 ──▶ [ sub#12 ]               │
  [ sub#13 cat_id=4 ]                        │ 4 ──▶ [ sub#13 ]               │
                                             └────────────────────────────────┘
  parents:                                      one O(1) bucket jump each:
  cat#1 ── dict[1] ──▶ setRelation('subcategories', [sub#10, sub#11])
  cat#2 ── dict[2] ──▶ setRelation('subcategories', [sub#12])
  cat#3 ── dict[3]=∅ ─▶ setRelation('subcategories', [])        ← empty, no query!
  cat#4 ── dict[4] ──▶ setRelation('subcategories', [sub#13])
```

Total work: O(parents + children) time, one dictionary in the request arena, **3
round-trips no matter how big the tree grows**. The same match runs again for
`directDiseases`. The stitched result is exactly the `relations` array drawn inside
the model box in §80.7 — which is then what `ModelCache::snapshot()` walks with its
DFS (§81.4). The three diagrams are one pipeline:

```mermaid
flowchart LR
    A["3 SQL queries<br/>(WHERE IN)"] --> B["dictionary match<br/>(hash buckets, §83.5)"]
    B --> C["model.relations tree<br/>(§80.7)"]
    C --> D["snapshot() DFS<br/>→ Redis bytes (§81.4)"]
    D --> E["rehydrate() DFS<br/>→ fresh models per request"]
```

## 84.3 `withCount` — the count rides inside Q2, drawn

Note where `diseases_count` came from in Q2: a **correlated subquery in the SELECT
list**, not a fourth query and not a loaded relation:

```
  subcategories row:  [ id=10 │ name=… │ diseases_count = (subquery, evaluated per row) = 17 ]
                                                            │
                MySQL executes it against the diseases      │
                index (subcategory_id) WHILE producing ─────┘
                each row — no extra round-trip, no disease models hydrated
```

The count lands as a plain attribute in `getAttributes()` — which is precisely why
the snapshot in §81.4 preserves it for free (`attributes` are raw DB values), and
why the mobile type has `recordings_count?: number` as a scalar field rather than an
array to count client-side. **The cheapest data structure is the one you never
build:** 17 disease models were never hydrated anywhere on the path from disk to
screen — only the integer 17 travelled.

## 84.4 The DFS visit order over the stitched tree — numbered

Finally, the traversal `snapshot()` performs on the §84.2 result, with visit order
numbered on the tree — the recursion of §81.4 made visible:

```
                 ①  cat#1
                 │  (open its array, then relations…)
        ┌────────┴─────────┐
   ②  sub#10          ④  sub#11          visit = depth-first, left to right:
        │                  │              a child's array is CLOSED before its
   ③ (no loaded          ⑤ (none)        parent's 'relations' entry is written
      children → leaf)
                 ⑥  close cat#1's array → append to snapshot list → next root

  emit order:   ① ② ③ ④ ⑤ ⑥  — parent opens first, closes LAST (post-order close)
  stack depth:  never exceeds the tree height (3) — six frames max on the PHP stack
```

`rehydrate()` replays the same shape in reverse: it must finish building `sub#10`
and `sub#11` (frames ②–⑤) before it can call `setRelation('subcategories', …)` on
`cat#1` (frame ⑥). Recursion order *is* the data-dependency order — the same
principle the hook call-order followed in §76.2, one level down the stack.

---

*This gallery (§83–84) drew every core algorithm frame by frame and the three-query
eager load with its dictionary stitch.*

*The reference continues at **§85** with the **Complete Code Atlas** — a systematic,
file-by-file sweep of the remaining codebase. Each module family's pattern is
explained exactly once (no repeated concepts; earlier sections are cross-referenced),
and every file's distinctive logic gets the same treatment as before: the code, its
pointers and allocations, its null handling, and how it contacts its neighbours.
§85 covers the mobile network & storage spine, §86 the Redux state spine, §87 the
backend request spine, §88 the project-wide null & data-handling catalog, and §89
the module contact map — who is allowed to import whom, and why.*
