# CACHING RULE — `ModelCache` is the ONLY way to cache Eloquent data

**Status: MANDATORY.** This supersedes the model-caching example in
`cache-strategy.md`. Applies to every Service in `app/Services`.

## Why this rule exists

`CACHE_STORE=database` (and `file`, `redis`, `memcached`) serialize cached
values. Storing a **live Eloquent model or Collection** couples cache
correctness to PHP's ability to serialize the entire object graph. A single
closure / resource / media-library conversion anywhere in that graph throws
`Serialization of 'Closure' is not allowed` — and it fails on the **cache HIT,
not the miss**, so it passes in dev and 500s in production. Symptoms seen in
this project: `__PHP_Incomplete_Class` reads, silent `Server error` 500s.

`App\Support\ModelCache` solves this once: it caches a **primitive snapshot**
(attributes + nested relations, fully object-free) and **rehydrates real
models** on read — so API Resources keep working (`getTranslations()`,
`iconUrl()`, `whenLoaded()`, `whenCounted()`, eager-loaded relations,
`withCount()` aggregates all survive).

## The only allowed pattern

```php
use App\Support\ModelCache;

// 1) A query that returns a Collection of models
public function items(): Collection
{
    return ModelCache::rememberMany('items.v1.all', 300,
        fn () => $this->repository->all());
}

// 2) A query that returns a single model (or null)
public function config(): ?SomeModel
{
    return ModelCache::remember('something.v1.config', 300,
        fn () => $this->repository->config());
}

// 3) A query that returns a LengthAwarePaginator (->paginate())
public function paginated(int $perPage = 15): LengthAwarePaginator
{
    return ModelCache::rememberPaginated("items.v1.page.{$perPage}", 300,
        fn () => $this->repository->paginate($perPage));
}
```

Key conventions:

- **Namespace + version the key:** `<resource>.v<n>.<scope>`. Bump `v<n>` when the
  cached shape changes so old payloads can't be rehydrated wrongly.
- **TTL ≤ 300s** (see `rules.md` RULE_7) — it is a backstop; invalidation (below)
  is what makes edits appear immediately.

### Which method to use

| Repository returns | Use | Returns |
|---|---|---|
| `Collection` of models (`->get()`) | `ModelCache::rememberMany($key, $ttl, $fn)` | `EloquentCollection` |
| a single model or `null` (`->first()`, `->find()`) | `ModelCache::remember($key, $ttl, $fn)` | `?Model` |
| `LengthAwarePaginator` (`->paginate()`) | `ModelCache::rememberPaginated($key, $ttl, $fn)` | `LengthAwarePaginator` |

Relations are captured automatically from whatever the repository eager-loads
(including nested, e.g. `parent.child`). Add a relation in the repository and the
cache follows — no service change needed.

## PROHIBITED — these will fail review and the `CachingConventionTest`

- ❌ **Caching live models/collections/paginators.**
  `Cache::remember($k, $ttl, fn () => $repo->get())` where the closure returns
  models. `Cache::put($k, $modelOrPaginator)`. The `instanceof` "guard +
  `Cache::forget`" workaround is also banned — it silently disables caching on
  the failure path.
- ❌ **Hand-rolled snapshot / rehydrate.** Any `->getAttributes()` +
  `Model::hydrate()` / `setRawAttributes()` / `newFromBuilder()` /
  `setRelation()` inside a Service. That logic lives in `ModelCache` only.
- ❌ **Caching `->toArray()` and returning arrays** where a Resource needs a
  model — it breaks `getTranslations()` / `whenLoaded()` etc.

## Cache the aggregate; slice in PHP. Never a per-id key.

Cache a whole **aggregate** (a list / tree / collection that many requests read
identically) under **one static key**, then derive a single request's view from
it in PHP — paginate it, or `->firstWhere(...)` / `->where(...)` it by a parent id.
This only pays off when the whole set is **small and bounded** (so holding it all,
and rehydrating it on every hit, is cheap).

Never build a **per-id cache key** (`"items.v1.{$id}"`). A dynamic key can't be
named by a `CACHE_KEYS` constant, so the write side can't enumerate which keys to
forget — that is precisely what breaks single-source invalidation. One static key
holding the whole set is trivially invalidated and trivially sliced.

A read stays **uncached** (straight to the repository) when it reuses nothing
across requests, or when caching would cost more than it saves:

- **Searches / filters on free input** (a query that varies per term/user) — there
  is no shared result to cache.
- A **single-row convenience lookup whose data already lives in a cached
  aggregate** — don't cache it a second time under its own key.
- A **per-parent slice of a large table** (e.g. one parent's child rows out of
  thousands). Caching the whole set to serve one slice snapshots/rehydrates
  everything on each miss/hit — a net loss. Use the indexed `where parent_id`
  query; if (and only if) that read becomes genuinely hot, it warrants caching,
  which would require a documented per-id-key exception to the rule above.

Rule of thumb: cache the *set* only when the set is small; never cache each
*slice* of a large set.

## Allowed exceptions (not Eloquent data)

- **Scalars / plain arrays** — e.g. OTP tokens, counters, flag maps. If the cached
  value contains **no Eloquent object**, plain `Cache::*` is acceptable (and
  `ModelCache` is unnecessary).
- **Cache invalidation** — `Cache::forget(...)` is always allowed.

## Invalidation — `InvalidatesCache` trait (the write side)

Caching has TWO halves: read via `ModelCache`, and **bust on write** so admin
edits appear on the next request instead of waiting out the TTL. There is ONE
mechanism for the write side: the `App\Models\Concerns\InvalidatesCache` trait.

A cached model uses the trait and returns the keys it owns — defined as a
`CACHE_KEYS` constant **on the owning Service**, so the read key and the write key
can never drift:

```php
use App\Models\Concerns\InvalidatesCache;
use App\Services\SomeService;

class SomeModel extends Model
{
    use InvalidatesCache;

    protected function cacheKeysToForget(): array
    {
        return SomeService::CACHE_KEYS; // const on the Service that caches this data
    }
}
```

The trait forgets those keys on `saved` / `deleted` / `restored`. Rules:

- ❌ Do NOT hand-roll invalidation (`Cache::forget` in a model `booted()`, or a
  `Service::flushCache()` called from a model). Use the trait.
- **A cache that embeds data from other tables must be invalidated by those tables
  too.** The Service that builds the aggregate **owns** its `CACHE_KEYS`; every
  other model whose rows appear in that aggregate re-exports the owner's constant
  so the key stays single-source:

  ```php
  // Owner — builds and caches the aggregate
  class OwnerService { public const CACHE_KEYS = ['owner.v1.tree']; }

  // Contributor — its rows are embedded in the owner's aggregate
  class ContributorService { public const CACHE_KEYS = OwnerService::CACHE_KEYS; }
  ```

  Each contributing model then returns *its own* service's `CACHE_KEYS`, and they
  all resolve to the same owner key.
- A model carries the trait **only if a write of it actually dirties a cached
  aggregate.** If nothing cached embeds the model, it has no `cacheKeysToForget`.
- Keep the **TTL as a backstop** even with invalidation, so a missed write path
  self-heals.

Implementation notes (the trait already handles these — don't re-derive them):

- The trait registers via `static::registerModelEvent()`, NOT `static::restored()`
  — the `restored`/`restoring` static helpers exist only on SoftDeletes models, so
  calling them on a plain model hits `__callStatic` → `(new static)` → boot recursion.
- The `database` cache store does NOT support `Cache::tags()`; explicit
  `Cache::forget(KEY)` is the only invalidation that works.

Every cached model is enforced by `tests/Feature/Cache/CacheInvalidationTest.php`:
it asserts each one uses the trait and returns exactly its owning Service's
`CACHE_KEYS` — so read and write keys can't silently diverge.

## Requirement for new services

Any new Service that caches Eloquent query results MUST use `ModelCache`. There
is no second pattern. If you need a shape `ModelCache` doesn't cover, extend
`ModelCache` (and its test) — do not hand-roll in the service.

Enforced by `tests/Unit/Support/CachingConventionTest.php`.
