# 90. The Vertical Slices — Every Functional Module, Every File in Its Chain

> *The early chapters described the modules functionally; the middle chapters
> dissected shared machinery. This closing chapter connects them: for each module,
> the complete chain is walked with the actual code from every file it passes
> through — route → controller → service → repository → model → resource → HTTPS →
> mobile service → hook → screen. Where a link was already dissected, it is cited,
> not re-printed; everything else is quoted from source.*

## 90.1 The front door — `routes/api.php`, annotated

Every chain below starts at one line of [api.php](backend/routes/api.php). The file
is organized as **three throttle rings + one auth ring**:

```php
Route::middleware(['throttle:auth'])->group(function () {          // ring 1: 5/min per IP
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
    Route::post('/auth/google/callback', [GoogleAuthController::class, 'handleMobileGoogleCallback']);
});
Route::middleware(['throttle:otp'])->group(function () {           // ring 2: 10/min per IP
    Route::post('/auth/verify-otp', [GoogleAuthController::class, 'verifyOtp']);
    Route::post('/auth/resend-otp', [GoogleAuthController::class, 'resendOtp']);
});
Route::middleware(['throttle:api'])->group(function () {           // ring 3: 120/min
    Route::get('/categories',        [CategoryController::class, 'index']);
    Route::get('/diseases/{slug}',   [DiseaseController::class, 'show']);
    Route::get('/recordings/{id}/audio', [RecordingController::class, 'audio']);  // gate INSIDE
    Route::post('/recordings/{id}/play', [RecordingController::class, 'play']);
    /* … all public content routes … */
    Route::middleware('auth:sanctum')->group(function () {         // ring 4: token required
        Route::get('/favorites',        [FavoriteController::class, 'index']);
        Route::post('/favorites/toggle', [FavoriteController::class, 'toggle']);
        Route::post('/feedback',        [FeedbackController::class, 'store']);
        /* /me, /logout, /account, notification preferences … */
    });
});
```

Three routing decisions carry the security model (§75):

* **Content is public; identity is gated.** Reading categories/diseases/adhkar
  needs no token — the app must work for guests. Anything *about the user*
  (favorites, feedback, profile) sits inside `auth:sanctum`.
* **The premium gate is *not* a route ring.** `/recordings/{id}/audio` is publicly
  routable because free sessions must stream for guests; the subscription check
  happens *inside* the controller against the resolved viewer (§90.4) — per-object
  authorization can't live at the route layer, which only knows the URL.
* **One route ordering subtlety:** `/diseases/search` is registered *before*
  `/diseases/{slug}` — otherwise the router would capture `search` as a slug.
  Route files are matched top-down; literal segments must precede parameter
  segments that could swallow them.

## 90.2 Slice: Roles & Entitlement — the code behind §1.4's claims

The functional claim: *mobile users collapse to one `user` role; the runtime
privilege axis is subscription/trial; Filament is gated by `isAdmin()`.* Here is
each clause's code, from [User.php](backend/app/Models/User.php):

**The role axis (admin vs everyone).** `User` pulls in spatie's trait and wraps it
in two intention-revealing methods:

```php
use Spatie\Permission\Traits\HasRoles;                 // adds roles() BelongsToMany + hasRole()

public function isAdmin(): bool
{
    return $this->hasRole(['super_admin', 'admin']);   // spatie: EXISTS on model_has_roles
}
public function canAccessPanel(Panel $panel): bool     // Filament's own contract method
{
    return $this->isAdmin();                            // panel login = admin only
}
```

`hasRole(['a','b'])` is an *any-of* test — one `EXISTS` query against spatie's
`model_has_roles` pivot (cached per-request by the trait). Every Filament page
render calls `canAccessPanel` first; a non-admin never sees a form. The API side
has a second, older gate — [CheckRole.php](backend/app/Http/Middleware/CheckRole.php):

```php
public function handle(Request $request, Closure $next, string ...$roles): Response
{
    if (!$request->user() || !in_array($request->user()->role, $roles)) {
        return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
    }
    return $next($request);
}
```

Note it reads a plain **`role` column**, not spatie's pivot — the divergence flagged
in §75.7's recommendations. `string ...$roles` is a variadic: the route alias
`role:admin,editor` arrives as `['admin','editor']`, and `in_array` is the tiny
whitelist test. The `!$request->user() ||` guard handles the guest before touching
`->role` — order matters, or a null deref replaces the clean 403.

**The entitlement axis** — three predicates whose *interplay* is the design:

```php
public function isSubscribed(): bool
{
    if ($this->is_subscribed) {                        // manual/admin-set flag → always in
        return true;
    }
    return $this->subscription_expires_at !== null     // else: time-boxed subscription
        && $this->subscription_expires_at->isFuture(); //       (Carbon cast, §87.4's datetime)
}

public function hasActiveTrial(): bool
{
    return ! $this->is_subscribed                      // trials never overlap a real sub
        && $this->trial_used_count > 0                 // a trial was actually granted
        && $this->subscription_expires_at !== null
        && $this->subscription_expires_at->isFuture(); // same expiry column does double duty
}

public function canGrantTrial(): bool
{
    return ! $this->isSubscribed() && $this->trial_used_count < 2;   // lifetime cap: 2 trials
}
public function grantTrial(): void
{
    $this->trial_used_count++;
    $this->subscription_expires_at = now()->addDays(7);
    $this->save();
}
```

The data-modeling decision worth seeing: **trial and subscription share one expiry
column** (`subscription_expires_at`), disambiguated by the `is_subscribed` flag and
`trial_used_count`. Four columns encode the whole state machine
(guest → trial ×2 → subscribed → lapsed), and `isFuture()` makes expiry *lazy* — no
cron needed to "expire" anyone; the predicate simply starts returning `false` when
the clock passes the timestamp. The truth table the three predicates implement:

| `is_subscribed` | expiry in future | `trial_used_count` | isSubscribed() | hasActiveTrial() | canGrantTrial() |
|---|---|---|---|---|---|
| true | — | — | **true** | false | false |
| false | yes | ≥1 | **true**\* | **true** | false |
| false | no | 0 or 1 | false | false | **true** |
| false | no | 2 | false | false | false |

\* row 2: `isSubscribed()` is also true via the expiry clause — which is exactly why
`Recording::canBeAccessedBy` (§77) can test `isSubscribed() || hasActiveTrial()`
and cover both paid and trial users with one line.

**Where the entitlement executes** — the same predicate chain, four enforcement
points already dissected, now connected:

```
  User::isSubscribed()/hasActiveTrial()      (this section)
        └▶ Recording::canBeAccessedBy($user)          model rule (§77)
             ├▶ RecordingService::canAccess           service delegation
             │    └▶ RecordingController::stream/audio → 403 (§90.4 below)
             ├▶ RecordingResource — audio_url withheld when inaccessible (§87.3)
             └▶ mobile: selectIsPaid (§86.1) → AccessibleRecording.accessible (§77.3)
                  └▶ lock icon + play gate in the session list UI
```

One rule, five layers, each layer failing safe if the one above is bypassed —
the defense-in-depth column of §75.2, now with every file named.

## 90.3 Slice: Favorites — the smallest complete chain, all nine files

**① Route** (`auth:sanctum` ring): `GET /favorites`, `POST /favorites/toggle`.

**② Controller** — [FavoriteController.php](backend/app/Http/Controllers/Api/FavoriteController.php):

```php
public function __construct(private FavoriteService $service) {}     // DI (§35): container injects

public function toggle(Request $request): JsonResponse
{
    try {
        $data = $request->validate(['disease_id' => 'required|integer|exists:diseases,id']);
        $isFavorited = $this->service->toggle($request->user()->id, (int) $data['disease_id']);
        return $this->success(['is_favorited' => $isFavorited]);
    } catch (ValidationException $e) {
        return $this->error('Validation failed', 422, $e->errors());
    } catch (\Throwable $e) {
        return $this->error('Server error', 500);
    }
}
```

The controller in one screen: validate (`exists:diseases,id` fires a `SELECT 1` so a
bogus id 422s before any logic), delegate, envelope (§87.1). `$request->user()` is
non-null *by construction* here — the `auth:sanctum` ring already rejected
tokenless requests, one more "type says so" case for §88. The catch order matters:
`ValidationException` first (specific → 422 with field errors), `\Throwable` last
(generic → logged 500, §75.5).

**③ Service** — [FavoriteService.php](backend/app/Services/FavoriteService.php), the
thinnest in the codebase, and still earning its layer:

```php
public function toggle(int $userId, int $diseaseId): bool
{
    return DB::transaction(fn () => $this->repository->toggle($userId, $diseaseId));
}
```

Its single contribution is the **transaction boundary** — toggle is check-then-write
(§71's `Favorite::toggle`: exists? delete : create), and the transaction makes the
pair atomic against a double-tap racing two requests. Transactions are *policy*, and
policy is the service layer's job; the repository stays a pure data mapper.

**④ Repository / ⑤ Model** — `FavoriteRepository::toggle` and the pivot model:
dissected in §71 (returns `true` if now favorited, `false` if removed — the boolean
the controller echoes back). **⑥ Resource**: `index` returns favorites as
`DiseaseResource::collection` — favorites *are* diseases on the wire, so the mobile
type needs no new shape.

**⑦ Mobile service** — [favoriteService.ts](mobile/src/services/favoriteService.ts),
the §85.2 family pattern verbatim:

```ts
export const favoriteService = {
  getFavorites: (): Promise<Disease[]> => apiGet<Disease[]>('/favorites'),
  toggleFavorite: (diseaseId: number): Promise<{ is_favorited: boolean }> =>
    apiPost<{ is_favorited: boolean }>('/favorites/toggle', { disease_id: diseaseId }),
};
```

**⑧ Hook** — [useFavorites.ts](mobile/src/hooks/useFavorites.ts) is where the slice
gets interesting, because the client is *not* a dumb mirror — favorites are
**offline-first with optimistic sync**:

```ts
const toggleFavorite = useCallback(
  (source: FavoriteSource, kind: FavoriteKind = 'disease', route?: string) => {
    const item: FavoriteItem = { id: source.id, name: source.name, /* …snapshot… */ };
    dispatch(toggleAction(item));                       // 1 optimistic: Redux flips NOW

    if (kind !== 'disease') return;                     // 2 node favorites are local-only
    if (online) {
      favoriteService.toggleFavorite(source.id).catch(() => {
        dispatch(enqueue({ type: 'favorite', payload: { diseaseId: source.id } }));  // 3a
      });
    } else {
      dispatch(enqueue({ type: 'favorite', payload: { diseaseId: source.id } }));    // 3b
    }
  },
  [dispatch, online],
);
```

```
  tap ❤ ──▶ Redux toggles instantly (UI never waits)
              │
              ├─ online?  POST /favorites/toggle ──ok──▶ done (server agrees)
              │                    └──fail──▶ enqueue in offlineQueueSlice ─┐
              └─ offline?  enqueue immediately ─────────────────────────────┤
                                                                            ▼
                        useOfflineQueue drains the queue when connectivity returns
                        (replays each queued toggle against the API)
```

Three design points, each doing real work:

* **The heart never lags.** The dispatch happens before any network call — the
  server is *eventually* consistent with the device, not the other way round.
  Because the API is a *toggle* (not set-true/set-false), a replayed queue item
  converges to the device's state regardless of what the server currently holds.
* **Two favorite kinds, one UI.** Diseases sync (the backend `favorites` table only
  knows disease ids — §90.1's route); category/subcategory "node" favorites exist
  only in redux-persist. The `kind !== 'disease'` early-return is that entire
  policy.
* **Membership is a `Set` again**: `keySet.has(favoriteKey(kind, id))` — §83.5's
  bucket jump, keyed by the composite `"${kind}:${id}"` string because two kinds
  share one id space.

**⑨ Screen**: any card calls `isFavorited(d.id)` for the icon state and
`toggleFavorite(d)` on press — the hook's memoized return object (§86.1's selector
boundary) is the entire surface the UI sees.

## 90.4 Slice: Gated audio streaming — the deepest backend path

`GET /recordings/{id}/audio` is the only route whose *response body is a file*, and
it stacks four mechanisms found nowhere else in the codebase.
[RecordingController.php](backend/app/Http/Controllers/Api/RecordingController.php):

**① The viewer, resolved without forcing auth:**

```php
private function resolveViewer(Request $request): ?User
{
    foreach (['sanctum', 'web'] as $guard) {
        try {
            if ($user = $request->user($guard)) return $user;
        } catch (\Throwable) { /* guard absent in this context — try next */ }
    }
    return null;                                        // guest — free sessions only
}
```

The same URL serves two clients with two credential types: the app (Sanctum bearer)
and the Filament admin preview (web session cookie). The loop tries each guard;
`null` is a *legitimate* outcome (guest), not an error — the trinary spirit of
§85.3 applied to identity. Then the gate:

```php
if (! $this->service->canAccess($recording, $this->resolveViewer($request))) {
    return $this->error('This session requires an active subscription or trial.', 403);
}
```

…which bottoms out in `canBeAccessedBy` → the §90.2 predicates. **② Local files
are served by Nginx, not PHP:**

```php
if (config('scalability.audio.use_x_accel')) {
    $internal = rtrim(config('scalability.audio.protected_x_accel_prefix'), '/') . '/' . ltrim($path, '/');
    return response('', 200, [
        'Content-Type'     => 'audio/mpeg',
        'Accept-Ranges'    => 'bytes',
        'X-Accel-Redirect' => $internal,
    ]);
}
```

```
  app ──GET /audio──▶ Nginx ──▶ PHP-FPM: auth + entitlement (ms of CPU)
                        ◀── empty 200 + X-Accel-Redirect: /protected/…mp3 ──┘
        Nginx sees the header, INTERNALLY serves the file itself
  app ◀══ MP3 bytes stream from Nginx (sendfile, zero PHP) ══
```

`X-Accel-Redirect` is the division of labor drawn: PHP decides *whether* (a few
milliseconds holding a worker, §80.6), Nginx does the *streaming* (minutes of I/O,
zero workers held). Without it, every listener would pin an FPM worker for the
length of a ruqyah session — a handful of listeners could starve the whole API.
The `/protected/` location is marked `internal` in Nginx, so the URL in the header
is unreachable directly — the redirect only works from inside a response,
preserving the gate. **③ Remote CDN files are proxied as a stream:**

```php
$cdnResponse = Http::withOptions(['verify' => true, 'stream' => true, 'timeout' => 60])
    ->withHeaders($clientHeaders)->get($path);          // Range passed through for seeking
…
return response()->stream(function () use ($stream) {
    while (! $stream->eof()) {
        echo $stream->read(8192);                        // 8 KB chunks: constant memory
        if (connection_aborted()) break;                 // listener left → stop pulling CDN
    }
}, $status, $responseHeaders);
```

`'stream' => true` keeps Guzzle from buffering the whole MP3 into the request arena
— the worker holds **8 KB at a time**, not 40 MB (the §80.6 memory model is why this
flag matters). The `Range` header passthrough is the server-side mirror of §85.3's
2-byte probe: the phone's player seeks by requesting byte ranges, and the proxy
forwards them so seeking works through the gate. `connection_aborted()` closes the
tap when the listener disconnects mid-stream.

**④ The play counter** — `POST /recordings/{id}/play` → `recordPlay` →
`increment('plays_count')`, the atomic in-database add of §87.4; the response echoes
`plays_count + 1` from the already-loaded model rather than re-querying. The mobile
player fires it once per track start (fire-and-forget — a lost count is not worth a
retry queue).

## 90.5 Slice: Adhkar — the content-family exemplar, backend to shuffled screen

The four *content* modules (Adhkar, Tahsinat, Courses, Sponsors) share one chain
shape; Adhkar is the fullest, so it stands for the family.

**②** [AdhkarController.php](backend/app/Http/Controllers/Api/AdhkarController.php)
— four read-only actions, all the §90.3 controller shape; the one variation is the
found/not-found split on slug lookup:

```php
public function items(string $slug): JsonResponse
{
    $category = $this->service->getCategoryBySlug($slug);
    if (! $category) {
        return $this->error('Adhkar category not found', 404);      // ?Model → 404 (§87.4)
    }
    return $this->success(new AdhkarCategoryResource($category));
}
```

**③–⑥** `AdhkarService` caches through `ModelCache` under its `CACHE_KEYS`
constants (§53) over `AdhkarRepository` (eager-loads `sections.items` — the
dictionary stitch of §84.2 at depth 2); `AdhkarCategoryResource` nests
`AdhkarSectionResource` with items (§87.3's `whenLoaded` discipline). The `today()`
endpoint filters categories by the current prayer window server-side, so the "now"
tab is one request.

**⑦–⑧** [useAdhkar.ts](mobile/src/hooks/useAdhkar.ts) — the full three-tier read
path assembled from parts already drawn:

```ts
export function useAdhkarItems(slug: string) {
  const query = useQuery({
    queryKey: cacheKeys.adhkarItems(slug),                                   // §86.3 namespace
    queryFn: () => cachedFetch(`adhkar_items_${slug}`, () => adhkarService.getItems(slug)),
    enabled: slug.length > 0,                                                // no slug → don't fire
    staleTime: FIVE_MIN,
  });
  return { category: query.data ?? null, isLoading: query.isLoading, /* … */ };
}
```

`enabled: slug.length > 0` is TanStack's declarative guard clause — the router may
render the screen a tick before params resolve; rather than fetching `/categories//
items`, the query simply doesn't exist yet. Note the hook returns `?? null` (a
*single entity* — §88 rule 2: null carries information) where its sibling
`useAdhkarCategories` returns `?? []` (a list — empty null-object).

**⑨ Screen**: the category flows into `flattenSectioned` (§83.4's shuffle inside
§72's per-view reshuffle) — the deliberate reason the hook returns the **raw**
category: randomization must re-roll on every view, so it happens at render, never
inside the cached value (a shuffled array in the cache would freeze one ordering
for five minutes).

## 90.6 The module × chain matrix — navigating every other slice

Every remaining module walks the same nine links; this matrix names each file so
any slice can be followed in the editor the way §90.3–90.5 were followed on paper:

| Module | Route(s) | Controller → Service → Repository | Resource | Mobile service → hook | Distinctive link (dissected at) |
|---|---|---|---|---|---|
| Hospital tree | `/categories`, `/categories/{slug}` | Category* → CategoryService → CategoryRepository | CategoryResource | categoryService → useCategories/useCategory | 3-query stitch §84.2; hospital routing §72 |
| Diseases | `/diseases`, `/diseases/search`, `/diseases/{slug}` | Disease* → DiseaseService → DiseaseRepository | DiseaseResource | diseaseService → useDiseases/useDiseaseSearch | slug lifecycle §77.4; debounce §85.4 |
| Recordings | `/recordings*`, `/general-ruqyah` | Recording* → RecordingService → RecordingRepository | RecordingResource | ruqyahService → useRecordings/useGeneralRuqyah | gate §90.4; queue §83.8; access flag §77.3 |
| Mushaf | `/surahs*`, `/verses/search`, `/reciters*` | Surah*/Verse*/Reciter*/Recitation* → services → repos | Surah/Verse/… Resources | quranService (native fetch, §85.2) → useSurah/useReaderRecitations | Arabic search §71; reader §76; timing §78 |
| Tahsinat | `/tahsinat/*` | Tahsinat* → TahsinatService → TahsinatRepository | TahsinatSectionResource | tahsinatService → useTahsinat | = Adhkar chain (§90.5) |
| Courses / Sponsors | `/courses`, `/sponsors`, `/sponsor-screen` | Course*/Sponsor* → services → repos | Course/SponsorResource | courseService/sponsorService → useCourses/useSponsors | ModelCache exemplar §53 |
| Feature flags | `/features` | FeatureFlag* → FeatureFlagService → FeatureFlagRepository | — (plain map) | featureService → featuresSlice + useFeatures | array-safe cache §53; constants/features.ts defaults |
| Favorites | `/favorites*` | Favorite* → FavoriteService → FavoriteRepository | DiseaseResource | favoriteService → useFavorites | full walk §90.3 |
| Feedback / Reports | `/feedback`, `/reports` | Feedback*/Report* → services → repos | — | feedbackService → screen forms | guest attribution note §90.1 |
| Notifications | `/notifications/*` | Notification* → NotificationService → NotificationRepository | NotificationPreferenceResource | notificationService → useNotificationPreferences | firstOrCreate/forceFill §71.5 |
| Auth & profile | `/register`, `/login`, `/me`, `/auth/*` | Auth*/GoogleAuth* → GoogleAuthService | — | googleAuth + tokenManager → AuthProvider | OAuth/OTP §31, §56; entitlement §90.2 |

Read a row left to right and you are tracing a request; read §89's contact map top
to bottom and you are tracing the same thing structurally. Between the two, every
line of the application sits on a named path.

---

*The Vertical Slices (§90) walked each module's chain. The reference concludes with
**§91, the Source Companion**: for the document's central functional claims, the
**complete implementing files printed in full** — every method, not excerpts — so
each claim can be verified against whole source, including the registration
role-assignment, the entire entitlement engine with its auto-granted trial, the
whole favorites persistence pair, and the token lifecycle on both sides of the
wire.*
