# 91. The Source Companion — Complete Files Behind the Central Claims

> *§90 walked the chains; this section prints the **whole files**. Each subsection
> opens with a functional claim made earlier in the document, then shows every
> related source file in full — so no claim rests on an excerpt. Annotations sit
> between the listings, keyed to line behaviour: what comes in, what goes out, and
> which earlier drawing explains the mechanism.*

## 91.1 Claim: "roles collapse to a single `user` role assigned at registration"

The claim from §1.4 / §90.2. Here is the *registration* that does the assigning —
[AuthService.php](backend/app/Services/AuthService.php), complete:

```php
<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

class AuthService
{
    public function __construct(private UserRepositoryInterface $repository) {}

    public function register(array $data): array
    {
        $user = DB::transaction(function () use ($data) {
            $user = $this->repository->create([
                'name'     => $data['name'],
                'email'    => $data['email'],
                'password' => $data['password'],          // hashed by the 'hashed' cast (§39.7)
                'phone'    => $data['phone'] ?? null,
                'country'  => $data['country'] ?? null,
                'gender'   => $data['gender'] ?? null,
            ]);

            $user->assignRole('user');                    // ← THE line the claim describes

            return $user;
        });

        return $this->tokenResponse($user);
    }

    public function login(string $email, string $password): ?array
    {
        $user = $this->repository->findByEmail($email);

        if (! $user || ! $user->password || ! Hash::check($password, $user->password)) {
            return null;                                   // one null for ALL failure modes
        }

        return $this->tokenResponse($user);
    }

    public function updateProfile(User $user, array $data): User
    {
        // Only overwrite columns that were actually submitted, so a partial
        // update never blanks out fields the client didn't touch.
        return $this->repository->update($user, array_filter(
            $data,
            static fn ($value) => $value !== null,
        ));
    }

    public function logout(User $user): void
    {
        /** @var PersonalAccessToken|null $token */
        $token = $user->currentAccessToken();

        $token?->delete();                                 // revoke THIS device only
    }

    public function deleteAccount(User $user): void
    {
        $user->tokens()->delete();                         // revoke EVERY device

        $this->repository->forceDelete($user);             // hard purge (§75.4)
    }

    private function tokenResponse(User $user): array
    {
        return [
            'user'  => $user->fresh(),
            'token' => $user->createToken('mobile')->plainTextToken,   // shown ONCE (§75.1)
        ];
    }
}
```

Line-level notes, in file order:

* **`register` runs inside `DB::transaction`** — user row *and* role pivot row
  commit together. `assignRole('user')` (spatie) inserts into `model_has_roles`;
  if that insert failed after the user insert succeeded, a role-less user would
  exist — the transaction makes the pair atomic (same reasoning as §90.3's toggle).
* **`$data['phone'] ?? null`** — the §88 catalog live: validation marked these
  `nullable`, so absent keys become explicit `null` columns, never missing array
  keys blowing up the insert.
* **`login` returns `?array` and collapses three failures into one `null`** — no
  such user, OAuth-only account (`! $user->password`: Google users have no password
  column set), and wrong password all produce the *same* 401 upstream. Telling an
  attacker *which* failed is an enumeration leak; the null merges them (§75.1).
* **`updateProfile`'s `array_filter($data, fn ($v) => $v !== null)`** — a partial
  `PUT /me` with only `name` must not null out `phone`. Filtering by `!== null`
  (not truthiness!) keeps deliberate empty strings while dropping absent fields —
  §88.2's `??`-vs-`||` distinction, in array form.
* **`logout` vs `deleteAccount`** — one token (`currentAccessToken()?->delete()`,
  the `?->` handling the no-token edge) vs all tokens + `forceDelete`. Two
  different blast radii, two methods.
* **`tokenResponse`** — `createToken('mobile')` stores only the SHA-256 hash;
  `plainTextToken` is the single moment the raw token exists in a response.
  `fresh()` re-reads the user so the response reflects committed state (including
  DB defaults), not the in-memory pre-insert object.

And the *admin* half of the role axis — [ContentPolicy.php](backend/app/Policies/ContentPolicy.php),
complete, bound to the 19 content models:

```php
class ContentPolicy
{
    public function viewAny(User $user): bool            { return true; }
    public function view(User $user, $model): bool       { return true; }
    public function create(User $user): bool             { return $user->isAdmin(); }
    public function update(User $user, $model): bool     { return $user->isAdmin(); }
    public function delete(User $user, $model): bool     { return $user->isAdmin(); }
    public function deleteAny(User $user): bool          { return $user->isAdmin(); }
    public function restore(User $user, $model): bool    { return $user->isAdmin(); }
    public function forceDelete(User $user, $model): bool { return $user->isAdmin(); }
}
```

The whole authorization matrix is two distinct rows: **reads open, writes
admin-only** — eight one-line methods, every one delegating to the single
`isAdmin()` predicate printed in §90.2. Filament consults this policy per action
(create button hidden, edit page 403s), so the CMS UI and the enforcement can never
disagree. Together with `canAccessPanel()` (§90.2) and the route rings (§90.1),
this is the complete role surface of the application — there is deliberately
nothing more to find.

## 91.2 Claim: "the privilege axis that matters at runtime is subscription/trial entitlement"

The *decision engine* — [RecordingService.php](backend/app/Services/RecordingService.php),
complete:

```php
<?php

namespace App\Services;

use App\Models\Recording;
use App\Models\User;
use App\Repositories\Contracts\RecordingRepositoryInterface;
use Illuminate\Support\Collection;

class RecordingService
{
    public function __construct(private RecordingRepositoryInterface $repository) {}

    public function getByDisease(int $diseaseId): Collection
    {
        return $this->repository->byDisease($diseaseId);
    }

    public function find(int $id): ?Recording
    {
        return $this->repository->findById($id);
    }

    public function recordPlay(Recording $recording): void
    {
        $this->repository->incrementPlays($recording);       // atomic UPDATE (§87.4)
    }

    public function generalRuqyah(): Collection
    {
        return $this->repository->generalRuqyah();
    }

    public function canAccess(Recording $recording, ?User $user): bool
    {
        if ($recording->isFreeSession()) {
            return true;                                     // 1 free content: everyone, even guests
        }

        if ($user === null) {
            return false;                                    // 2 premium + guest: never
        }

        // Admins manage the content and must be able to preview any session.
        if ($user->isAdmin()) {
            return true;                                     // 3 role axis joins here
        }

        if ($user->isSubscribed() || $user->hasActiveTrial()) {
            return true;                                     // 4 the paid/trial axis (§90.2)
        }

        if ($user->canGrantTrial()) {
            $user->grantTrial();                             // 5 AUTO-GRANT: first premium touch
                                                             //   starts a 7-day trial, then…
            return true;                                     //   …admits the request that triggered it
        }

        return false;                                        // 6 exhausted: 403 upstream
    }
}
```

`canAccess` is a **guard-clause ladder** (§79.2) evaluating six rules in strictly
cheapest-first, most-permissive-first order — and rule 5 is a business rule stated
nowhere else in the document until now: **the trial is granted lazily, by the act
of trying**. A logged-in user who taps session 2 with trials remaining doesn't see
a "start trial?" dialog — `grantTrial()` (§90.2: `trial_used_count++`, expiry
`now()+7d`, `save()`) fires *inside the access check*, and the same request that
would have been rejected streams instead. The ordering matters twice: admins are
checked *before* entitlement (an admin never consumes a trial), and
`isSubscribed() || hasActiveTrial()` runs *before* `canGrantTrial()` (an active
trial never burns the second trial slot). Side note honestly stated: a *write*
inside a `canX` predicate is a deliberate trade-off — it makes the API one-shot
(no separate "activate trial" round-trip) at the cost of a check that isn't pure.

Where the verdict is *serialized* — [RecordingResource.php](backend/app/Http/Resources/RecordingResource.php),
complete:

```php
class RecordingResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                    => $this->id,
            'disease_id'            => $this->disease_id,
            'category_id'           => $this->category_id,
            'subcategory_id'        => $this->subcategory_id,
            'session_number'        => $this->session_number,
            'description'           => $this->getTranslations('description') ?: null,
            'segments'              => collect($this->segments ?? [])->values()->map(fn($s) => [
                'start'   => (float) ($s['start'] ?? 0),
                'end'     => (float) ($s['end'] ?? 0),
                'text_ar' => trim($s['text_ar'] ?? ''),
                'text_en' => trim($s['text_en'] ?? ''),
            ])->filter(fn($s) => $s['end'] > $s['start'])->values()->all() ?: null,
            'audio_url'             => $this->streamUrl(),
            'duration_seconds'      => $this->duration_seconds,
            'is_general'            => $this->is_general,
            'is_free'               => $this->isFreeSession(),
            'requires_subscription' => ! $this->isFreeSession(),   // derived, never stored
            'plays_count'           => $this->plays_count,
        ];
    }
}
```

* **`requires_subscription => ! $this->isFreeSession()`** — the field the mobile
  `accessible` memo consumes (§77.3) is *derived at serialization*, the negation of
  one source of truth. Storing it as a second column could drift from `is_free`;
  deriving it cannot. This single line is the wire half of the §90.2 enforcement
  chain.
* **The `segments` pipeline** — the densest data-sanitization line in the project,
  worth reading inside-out: `$this->segments ?? []` (null column → empty, §88
  rule 2) → `->values()` (re-index, in case the JSON stored an object) →
  `->map(...)` normalizes every entry: floats coerced with `?? 0` defaults, texts
  trimmed with `?? ''` — so a half-filled admin row can't ship `null` starts into
  the player's arithmetic → `->filter($s['end'] > $s['start'])` drops zero-length
  or inverted intervals (which would break the §78-style timestamp scans) →
  `->values()` re-indexes *again* after the filter (JSON arrays must be dense —
  a gap would serialize as an object) → `->all() ?: null` collapses "nothing
  survived" to `null`, matching the mobile type `segments: Segment[] | null`.
* **`?:` vs `??` twice in this file** — `getTranslations(...) ?: null` uses the
  *elvis* operator deliberately: an empty translations array `[]` is falsy and
  should become `null` ("no description"), which `??` would let through. The exact
  §88.2 distinction, chosen correctly in both directions in one file.

## 91.3 Claim: "toggles update Redux optimistically… disease favorites also sync to the server"

The two files §90.3 delegated to, now in full. The pivot —
[Favorite.php](backend/app/Models/Favorite.php), complete:

```php
class Favorite extends Model
{
    protected $fillable = ['user_id', 'disease_id'];

    protected function casts(): array
    {
        return ['user_id' => 'integer', 'disease_id' => 'integer'];
    }

    public function user(): BelongsTo    { return $this->belongsTo(User::class); }
    public function disease(): BelongsTo { return $this->belongsTo(Disease::class); }

    public static function toggle(int $userId, int $diseaseId): bool
    {
        $existing = static::where('user_id', $userId)
            ->where('disease_id', $diseaseId)
            ->first();

        if ($existing) {
            $existing->delete();
            return false;                       // "no longer favorited"
        }

        static::create(['user_id' => $userId, 'disease_id' => $diseaseId]);
        return true;                            // "now favorited"
    }
}
```

`toggle` is check-then-act — `first()` (one indexed row or `null`), then the
branch. The boolean *is* the new state, which is what makes the mobile replay
convergent (§90.3). The check-act pair is exactly why `FavoriteService` wraps the
call in `DB::transaction` — printed in full in §90.3 — and the composite unique
index on `(user_id, disease_id)` backstops the race even so.

And the read side — [FavoriteRepository.php](backend/app/Repositories/FavoriteRepository.php),
complete:

```php
class FavoriteRepository implements FavoriteRepositoryInterface
{
    public function forUser(int $userId): Collection
    {
        return Disease::active()
            ->whereHas('favoritedBy', fn ($q) => $q->where('users.id', $userId))
            ->with('subcategory')
            ->ordered()
            ->get();
    }

    public function toggle(int $userId, int $diseaseId): bool
    {
        return Favorite::toggle($userId, $diseaseId);
    }

    public function isFavorited(int $userId, int $diseaseId): bool
    {
        return Favorite::where('user_id', $userId)
            ->where('disease_id', $diseaseId)
            ->exists();
    }
}
```

`forUser` queries **from the Disease side**, not the pivot side: `whereHas`
compiles to a `WHERE EXISTS (subquery into favorites)` — so the result rows *are*
diseases (ready for `DiseaseResource`, §90.3 ⑥), already filtered `active()`,
already `ordered()`, with `subcategory` eager-loaded for the card's breadcrumb
(§84.2's stitch, depth 1). Querying the pivot first would return favorites that
point at soft-deleted or deactivated diseases; anchoring on `Disease::active()`
makes "a favorite of a hidden disease" *unrepresentable in the response* — the same
make-invalid-states-impossible move as §77.5, applied to a query instead of a
write.

## 91.4 Claim: "the bearer token is attached by apiClient when a session exists"

The mobile keeper of that session — [tokenManager.ts](mobile/src/lib/tokenManager.ts),
complete:

```ts
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// These keys MUST match the keys AuthContext writes to in expo-secure-store.
// AuthContext is the single writer of the session; apiClient reads the bearer
// token back through TokenManager.getToken() to set the Authorization header.
// A mismatch here means every auth-gated request goes out unauthenticated.
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const TokenManager = {
  async getToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  async setToken(token: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  },

  async getUser(): Promise<any | null> {
    if (Platform.OS === 'web') {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    }
    const user = await SecureStore.getItemAsync(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  async setUser(user: any): Promise<void> { /* mirror of setToken with JSON.stringify */
    if (Platform.OS === 'web') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    }
  },

  async clear(): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    }
  },
};
```

* **Physical storage:** on device, `expo-secure-store` = Android Keystore / iOS
  Keychain — hardware-backed encrypted storage *outside* the app's normal files
  and outside redux-persist (which is why `authSlice` never holds the token,
  §86.1). On web it degrades to `localStorage` behind the same interface —
  the platform branch repeated per method is an inline **adapter pattern**.
* **The comment block is load-bearing project history:** the production-only auth
  bug (recorded in the project's memory) was precisely these key strings drifting
  from the ones `AuthContext` wrote — every request silently went out
  unauthenticated. The invariant "one writer (AuthContext), one reader path
  (apiClient → `getToken`), shared literal keys" is the fix, documented at the
  constants it protects.
* **The full token lifecycle across both codebases**, now traceable end to end in
  printed source: `AuthService::tokenResponse` mints (§91.1) → response envelope →
  `AuthContext` persists via `setToken` → every request's interceptor awaits
  `getToken()` and stamps `Authorization: Bearer …` (§85.2, printed there) →
  Sanctum hashes and matches server-side (§75.1) → on 401, the interceptor's
  `onUnauthorized` callback (§89's inversion) clears state and `clear()` empties
  the keychain; `logout` deletes the one token, `deleteAccount` deletes them all
  (§91.1).

---

*The Source Companion (§91) printed the complete files behind the central claims.*

*The reference culminates in **§92, the Auth Mega-Slice** — the model for how this
document treats a whole feature: the complete Google sign-in process between the
mobile app and the backend, with **all nine source files printed in full** (login
UI, auth context, OTP screen, flow state machine, web and API routes, controller,
service, mail) and every concept in the brief annotated directly on the code —
user story, use-case and sequence diagrams, stack/heap allocation and pointers,
OOP/SOLID and dependency injection, the algorithms and data structures, memory-leak
prevention, render/evaluation behaviour, memoization and re-render elimination.*
