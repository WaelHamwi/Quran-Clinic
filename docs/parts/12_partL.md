
# 40. Glossary & Clarified Terminology

> This chapter exists to make the dossier self-contained and unambiguous. Every non-obvious term used above is defined here in plain language, with the project-specific meaning where relevant. Terms are grouped by area for study, then there is an alphabetical quick index.

## 40.1 Backend / Laravel terms

**Active Record** — a pattern where a model object *is* a database row and carries methods to read/write itself (`$item->save()`). Eloquent is an Active Record ORM. Contrast with Data Mapper (where a separate mapper moves data between objects and tables).

**Autowiring** — the container's ability to build an object by reading its constructor's type hints and supplying the dependencies automatically, with no manual `new`. Powered by PHP Reflection (§36).

**Binding** — a registered rule telling the container "when someone asks for interface X, build class Y." Done in a service provider's `register()`.

**Cast** — a declared type conversion for a model attribute (`'repetitions' => 'integer'`). Applied lazily when the attribute is read/written.

**Controller** — the thin HTTP layer: validates input, calls a service, returns a response. Holds *no* business logic here.

**Correlated subquery** — a subquery that references the outer query's current row and therefore runs once per outer row (e.g. `withCount` → a `COUNT(*)` per parent).

**Eager loading** — loading a parent and its related rows in a *fixed, small number* of queries using `WHERE foreign_key IN (...)`, instead of one query per parent. The cure for N+1.

**Eloquent** — Laravel's ORM (Object-Relational Mapper): maps tables to model classes and relationships to methods.

**Facade** — a class providing a static-looking API (`Cache::get()`) that actually proxies to a container-resolved object. Not a true static call.

**Hydration** — turning raw database rows into model objects (filling `$attributes`). The reverse of serialization.

**Mass assignment** — setting many model attributes at once from an array (`Model::create($data)`). Guarded by `$fillable` (a whitelist) to prevent a malicious request from setting unintended columns.

**Middleware** — a function wrapping the request/response, running before/after the controller (auth, locale, rate limiting, activity logging).

**Migration** — a versioned PHP file describing a schema change (`create_*_table`). This project amends the original migration and re-runs `migrate:fresh` rather than stacking new migrations.

**N+1 problem** — issuing 1 query for a list then N more (one per item) for a relation; a classic performance bug. Avoided here via eager loading.

**Policy** — a class deciding authorization for a model (`ContentPolicy`: public read, admin write).

**Repository** — the only layer that builds database queries; returns models/collections. Lets the rest of the app depend on an *interface*, not Eloquent.

**Resource (API Resource)** — a class that transforms a model into the exact JSON shape the client receives (`AdhkarCategoryResource`). The single place serialization rules live.

**Scope** — a reusable query fragment on a model (`scopeActive`, `scopeOrdered`) chained in repositories.

**Service** — the orchestration layer: caching, transactions, entitlement decisions. Sits between controller and repository.

**Service container** — the object that builds and wires all other objects via bindings + reflection (§36).

**SoftDelete** — marking a row deleted with a `deleted_at` timestamp instead of removing it; a global scope hides such rows automatically.

**Throttle / rate limiter** — a middleware capping requests per minute per key (IP or user id) to resist abuse.

**Transaction** — a group of writes that all succeed or all roll back (`DB::transaction`), keeping the database consistent.

## 40.2 Database terms

**B+ tree / B-tree index** — the balanced tree structure backing indexes; gives O(log n) lookups (§39.1).

**Cardinality** — how many rows a query/relationship produces ("one-to-many" = up to many).

**Composite index** — an index on multiple columns `(a, b)`; serves lookups/sorts on `a` then `b`.

**Foreign key (FK)** — a column referencing another table's primary key; the DB enforces the link and the cascade behavior.

**`cascadeOnDelete` / `nullOnDelete`** — what happens to a child when its parent is deleted: the child is also deleted, or its FK is set NULL.

**JSON column** — a column storing a JSON document; here used for i18n maps (`{"ar":…,"en":…}`).

**Pivot table** — a join table implementing many-to-many (`favorites` links users and diseases).

**Prepared statement / bound value** — SQL with `?` placeholders sent separately from the values; prevents SQL injection.

**Primary key (PK)** — the unique row identifier.

**Unique constraint** — guarantees no two rows share a value/combination (`unique(reciter_id, surah_id)`).

## 40.3 Authentication / security terms

**Bearer token** — a credential sent as `Authorization: Bearer <token>`; whoever holds it is authenticated. Stored hashed server-side.

**bcrypt** — a slow, salted password hash; slowness resists brute force (§39.7).

**OAuth / Google sign-in** — delegated login where Google vouches for the user's identity.

**OTP (One-Time Password)** — a short code emailed for verification; stored hashed with a TTL.

**PKCE** — "Proof Key for Code Exchange," an OAuth extension where the client proves it started the flow, so the `client_secret` never needs to be on the device.

**Sanctum** — Laravel's lightweight API token system used for mobile auth.

**Session token (one-time)** — an opaque, single-use string handed back via deep link, exchanged once for the real bearer token so the token never rides a URL.

**TTL (Time To Live)** — how long a cached/temporary value remains valid before expiring.

## 40.4 Frontend / React Native terms

**AsyncStorage** — the device's simple key/value persistent store (used by redux-persist).

**Atomic selector** — a selector returning one small field, so a component re-renders only when *that* field changes (§19).

**Expo / Expo Router** — the RN toolchain and its file-based navigation (a file under `app/` becomes a route).

**Fiber** — React's internal representation of a component instance; the tree that reconciliation diffs.

**Hermes** — the JavaScript engine RN runs; uses hidden classes for fast property access (§38.4).

**Hook** — a function (`useX`) that lets a component use state/effects/queries (`useQuery`, `usePlayer`).

**Hidden class / shape** — the engine's record of an object's property layout, shared across same-shaped objects for speed.

**Immer** — the library RTK uses to write "mutating" reducer code that actually produces new immutable state.

**`networkMode: 'offlineFirst'`** — a TanStack setting that runs the fetch even offline, so a catch block can serve cached data (§24).

**Reconciliation / diffing** — React's algorithm to update the view tree by comparing the new element tree to the old (§39.4).

**Redux / Redux Toolkit (RTK)** — the device/session state container; RTK reduces boilerplate and bundles Immer.

**redux-persist** — saves selected slices to AsyncStorage and rehydrates them on launch.

**Selector** — a function deriving a value from the store; subscribed components re-render when it changes.

**Slice** — one feature's Redux state + reducers + actions (`playerSlice`).

**`staleTime`** — how long TanStack treats cached data as fresh (no refetch). Tuned to match the server's cache TTL.

**Structural sharing** — reusing unchanged branches of an immutable tree so updates copy only the changed path (§38.5).

**TanStack Query (React Query)** — the server-state cache: dedupe, staleness, retry, offline (§24).

**Yoga** — the Flexbox layout engine RN uses instead of CSS (§29).

## 40.5 General CS / algorithm terms

**Big-O** — notation for how runtime/space grows with input size: O(1) constant, O(log n) logarithmic, O(n) linear, O(n log n) linearithmic, O(n²) quadratic.

**Copy-on-write (COW)** — share a buffer until a write forces a copy; makes passing large values cheap (§38.1).

**Fisher–Yates** — the correct unbiased array shuffle, O(n) (§39.5).

**Garbage collection (GC)** — automatic reclamation of unreachable memory (PHP per-request arena; Hermes heap).

**Hash table / dictionary** — a structure giving O(1) average key lookup; used for cache, eager-load matching, JS objects.

**Heap vs stack** — the stack holds call frames and primitives (fast, scoped); the heap holds objects/arrays (longer-lived, GC'd).

**Idempotent** — an operation that has the same effect whether applied once or many times (favorites toggle is server-idempotent per state).

**Immutable** — never mutated after creation; updates create new values (Redux state, JSON strings).

**Refcount** — a count of references to a value; when it hits zero the value can be freed (PHP zvals).

## 40.6 How to read this document (clarified guide)

1. **Start with §1–2** for the mental model: *every read is Route → Controller → Service(cache) → Repository → Model → Resource → JSON*.
2. **§3–12** drill the backend layer by layer; **§37** then walks one request through *all* of them at once with memory shapes — read it after §3–12 to consolidate.
3. **§17–29** cover the mobile app; **§38** explains how its data lives in memory.
4. **§35, §36, §39** are the "deep CS" chapters — SQL techniques (used and unused), container internals, and the algorithms.
5. **§30–32** are the audits (performance, security, best practices); **§34** explains how the system was built by an agentic Claude workflow.
6. Whenever a term is unclear, return here to **§40**.

## 40.7 Alphabetical quick index

Active Record (40.1) · AsyncStorage (40.4) · Atomic selector (40.4) · Autowiring (40.1) · B-tree (40.2/39.1) · bcrypt (40.3) · Bearer token (40.3) · Big-O (40.5) · Binding (40.1) · Cardinality (40.2) · Cast (40.1) · Composite index (40.2) · Controller (40.1) · COW (40.5) · Correlated subquery (40.1) · Eager loading (40.1) · Eloquent (40.1) · Facade (40.1) · Fiber (40.4) · Fisher–Yates (40.5) · Foreign key (40.2) · GC (40.5) · Hash table (40.5) · Heap/stack (40.5) · Hermes (40.4) · Hook (40.4) · Hydration (40.1) · Idempotent (40.5) · Immer (40.4) · Immutable (40.5) · JSON column (40.2) · Mass assignment (40.1) · Middleware (40.1) · Migration (40.1) · N+1 (40.1) · OAuth (40.3) · offlineFirst (40.4) · OTP (40.3) · PKCE (40.3) · Pivot table (40.2) · Policy (40.1) · Prepared statement (40.2) · Reconciliation (40.4) · Refcount (40.5) · Repository (40.1) · Resource (40.1) · Sanctum (40.3) · Scope (40.1) · Selector (40.4) · Service (40.1) · Service container (40.1) · Slice (40.4) · SoftDelete (40.1) · staleTime (40.4) · Structural sharing (40.4) · TanStack Query (40.4) · Throttle (40.1) · Transaction (40.1) · TTL (40.3) · Unique constraint (40.2) · Yoga (40.4)

---

*End of expanded edition. The original §1–34 remain unchanged above; §35–40 are the master-thesis deep-dive additions covering SQL technique pedagogy (used and unused, with real-world examples), service-container internals, the full DB→memory→API→UI data flow with parameter injection, in-memory data structures, the algorithms behind the scenes, and a clarifying glossary.*
