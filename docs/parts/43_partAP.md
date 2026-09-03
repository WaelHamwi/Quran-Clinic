# Appendix Z — Master Concept Index

> *The document's closing navigation aid: every major concept, pattern, algorithm
> and mechanism treated in this reference, with every section that develops it.
> Bold marks the section holding the fullest treatment.*

## Z.1 Memory & runtime

| Concept | Sections |
|---|---|
| Stack vs heap, address-space map | **§80.1**, §70, §78.8, §92.9, §93.5 |
| Call frames, frame-by-frame walk | **§80.2**, §78.1 |
| Heap object graphs / pointer diagrams | **§80.3**, §76.4, §81.3 |
| Closures & environment records | **§80.4**, §69, §92.3 ① |
| Stale closures & ref-mirrors | §76.5, **§93.2**, §92.4, §94.3 |
| Hidden classes (Hermes) | **§80.5**, §85.2, §87.3 |
| Prototype chain / `instanceof` | **§85.2**, §92.7 |
| PHP-FPM request arena, OPcache | **§80.6**, §81.4, §90.4 |
| zvals & copy-on-write | **§80.7**, §81.4 |
| Eloquent model internals (attributes/original/relations) | **§80.7**, §77.4, §87.3 |
| Garbage collection (generational; refcount) | §70, **§80.4**, §80.6 |
| Memory-leak prevention (listeners, timers, registries) | **§92.3 ①**, §85.4, §93.3, §94.3 |
| ES-module live bindings & module scope | **§85.1**, §81.2, §85.3, §93.4 |

## Z.2 Data structures

| Concept | Sections |
|---|---|
| Arrays, immutable copy-then-write | §77.3, §83.4, **§85.3**, §92.4 |
| Hash maps / `Set` / `Record` bucket jumps | **§83.5**, §78.3, §86.2, §90.3 |
| Prefix-sum arrays | **§78.2**, §83.3, §94.3 |
| Sorted arrays & predecessor queries | **§78.1**, §83.1–83.2 |
| Trees & the content taxonomy | **§77.1**, §84, §81.4 |
| Tagged unions (snapshot types, outcomes) | §81.4, **§92.7**, §88.1 |
| Queues by index | **§83.8**, §93.2 |
| Finite-state machines (steps, downloads, playback) | **§86.2**, §92.5, §93.2 |
| Filename-as-key stores | **§93.3**, §81.2 |
| Maintained aggregates + reconciliation | §86.2, **§93.4**, §84.3 |

## Z.3 Algorithms

| Concept | Sections |
|---|---|
| Linear scan vs binary search trade-off | **§78.1**, §83.1–83.2 |
| Fisher–Yates shuffle | **§83.4**, §72 |
| Linear-probe uniqueness (slug) | **§77.4**, §83.7 |
| Eager loading & the dictionary stitch (no N+1) | **§84**, §77, §91.3 |
| `withCount` correlated subqueries | **§84.3**, §71 |
| Base64url encode/decode, modular padding | **§92.6**, §92.7 |
| Diacritic-insensitive Arabic search | **§71**, §94.5 |
| Debounce | **§85.4**, §94.4 |
| Throttle | **§93.2**, §72 |
| Edge detection via previous-value ref | **§92.5**, §93.2, §78.5, §79.5 |
| Idempotent promise resolution / races | **§92.3 ①**, §85.3 |
| DFS snapshot/rehydrate | **§81.4**, §84.4 |

## Z.4 OOP, SOLID & patterns

| Concept | Sections |
|---|---|
| Dependency injection (constructor; hooks; container) | §35, §68, **§90.3**, §92.2, §92.7 |
| Repository pattern & interface segregation | §36, **§87.4**, §94.3 |
| Facade (orchestrator hooks; `useDownloadManager`) | **§76**, §93.4 |
| Traits as horizontal reuse | **§87.1**, §53 |
| Policies & authorization layers | **§91.1**, §75.2, §90.2 |
| Value objects (Mailable; `ApiError`) | §92.8, **§85.2** |
| Null-object pattern | **§85.2**, §85.5, §88.3 |
| Chain of Responsibility (middleware) | **§68**, §87.2 |
| Adapter (platform-branched TokenManager) | **§91.4** |
| Singleton via module scope | **§81.2**, §85.3, §93.4 |
| Guard-clause ladders | **§79.2**, §91.2, §92.8 |

## Z.5 React & rendering

| Concept | Sections |
|---|---|
| Render/commit, Fiber, reconciliation | **§69**, §80.3 |
| useMemo / useCallback — when and when not | **§92.3 ⑦ vs §93.2**, §70, §92.5 |
| useEffect done right (FSM transitions, bridges) | **§92.5**, §92.3 ⑥, §94.3 |
| Re-render elimination (bail-outs, latches, throttles) | **§78.5**, §93.2, §85.3, §94.3 |
| Context providers & engine handles | **§93.2**, §92.3, §72 |
| Derive-don't-sync | **§92.3 ⑥**, §86.1 |
| Theming factories & `useStyles` | **§73**, §92.2 |
| Lazy initial state | **§92.5** |
| Headless components | **§93.4** |

## Z.6 Caching, persistence & networking

| Concept | Sections |
|---|---|
| The six cache layers, end to end | **§81**, §53, §82 |
| ModelCache snapshots in Redis | **§81.4**, §53, §80.7 |
| TanStack Query semantics | **§81.3**, §77.3, §90.5 |
| SQLite offline fallbacks | **§81.2**, §94.4, §52 |
| redux-persist & rehydration | §86, **§93.4** |
| Cache invalidation (events + staleTime) | **§81.5**, §53 |
| Local→production request fallback | **§85.2**, §85.1 |
| Envelope contract, both sides | **§87.1**, §85.2 |
| OS download resume tokens | **§93.3**, §86.2 |
| Gated audio: X-Accel-Redirect & CDN proxy | **§90.4** |
| Cache-as-state-machine (OTP keys) | **§92.8** |

## Z.7 Security & data integrity

| Concept | Sections |
|---|---|
| Roles & the admin axis | **§90.2**, §91.1, §75.2 |
| Subscription/trial entitlement (+ auto-grant) | **§91.2**, §90.2, §77.3 |
| Sanctum tokens: mint, hash, revoke | **§91.1**, §91.4, §75.1 |
| OAuth + OTP flow, end to end | **§92**, §31, §56 |
| CSRF/state defense, single-use exchange | **§92.3 ②**, §92.6, §92.8 |
| Hashed OTPs, attempt caps, rate rings | **§92.8**, §90.1, §75.1 |
| Injection prevention & bindings | **§75.3**, §71 |
| Mass assignment & `#[Hidden]` | **§75.4**, §39 |
| Model-enforced invariants | **§77.2, §77.5**, §91.3 |
| Null handling: the unified policy | **§88**, §79, §85.3, §94.5 |
| OWASP Top 10 map | **§75.6** |

## Z.8 The document's own method

Three passes over one system: **what** (§1–§75: architecture, flows, framework
internals), **how it sits in memory** (§76–§89: refactors, drawings, atlases,
galleries, catalogs), **the code itself** (§90–§94: chains, companions, and three
full mega-slices with user stories, diagrams, whole files and concept matrices).
Any question about this codebase should land in one of the three passes — and this
index says where.

---

*Quranic Clinic — Complete Reverse-Engineering & Architecture Dossier. Laravel 13
API · Filament 5 Admin · React Native (Expo) Client. End of document.*
