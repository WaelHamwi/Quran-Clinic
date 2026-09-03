# 95. The Line Ledgers — the Mega-Slice Code, Line by Line, Concept by Concept

> *The answer to "what does each line do?" in table form. Every ledger below takes
> one function printed whole in §92–§94 and walks it row by row: the line of code,
> what enters and leaves it, and which concept of the brief that exact line
> embodies. The **Concept** column uses the brief's own vocabulary — stack, heap,
> pointer, DI, algorithm, data structure, memory-leak prevention, optimization,
> render/evaluation, useMemo/useCallback/useEffect, OOP/prototype, SOLID.*

## 95.1 `AuthContext.signIn()` — the whole sign-in, row by row

| # | Line | In → Out (what it does) | Concept |
|---|------|--------------------------|---------|
| 1 | `setLoading(true);` | — → schedules a state commit; every `useAuth` consumer re-renders with the spinner | **render**: state → UI, the only way UI changes |
| 2 | `setAwaitingOtp(false);` | clears any stale OTP flag from a previous aborted attempt → AppFlow can't jump to `otp` on old data | **useEffect hygiene**: resetting the inputs the FSM effects watch |
| 3 | `const sessionToken = Array.from({ length: 32 }, () =>` | allocates one 32-slot array **on the heap**; the arrow fn is called per slot | **heap allocation** + **algorithm** (generate-by-index) |
| 4 | `Math.floor(Math.random() * 36).toString(36)` | random float (stack temp) → int 0–35 → one base-36 char; the float and int never touch the heap | **stack**: transient scalars live in the frame, die on return |
| 5 | `).join("");` | 32 strings → one 32-char string on the heap; the temp array becomes garbage | **heap** + GC: young garbage, §80.4 |
| 6 | `await SecureStore.setItemAsync(OTP_SESSION_KEY, sessionToken);` | token → device keychain (survives process death) | **memory allocation** choice: keychain vs closure — persistence beats the heap here (§92.3 ②) |
| 7 | `const authUrl = \`${OAUTH_BASE_URL}/auth/google/mobile?session_token=${encodeURIComponent(sessionToken)}\`;` | base + token → one URL string; `encodeURIComponent` guards reserved chars | **evaluation**: template literal evaluates inner expressions left-to-right, single concat |
| 8 | `const callbackUrl = await openAndAwaitCallback(authUrl);` | suspends this frame; the browser round-trip happens; resumes with URL or `null` | **pointer**: `await` parks the *continuation* (a heap closure) until resolve — §95.2 |
| 9 | `if (!callbackUrl) { setLoading(false); return; }` | user closed the tab → quiet exit, spinner off | **null handling** (guard clause, §79.2): cancel is not an error |
| 10 | `const params = parseCallback(callbackUrl);` | URL string → `Record<string,string>` dictionary | **data structure**: hash map built in O(n) — §95.3 |
| 11 | `if (params.session_token !== sessionToken) { … throw new Error("session_mismatch"); }` | compares the returned token to the one from line 3–5 | **algorithm (security)**: anti-CSRF equality — only *this* device's request may complete |
| 12 | `if (params.status === "success") { await exchangeSession(sessionToken); }` | existing user branch → trade token for bearer (§95.6) | **sequence diagram** branch A realized in code |
| 13 | `else if (params.status === "verification_required") { setAwaitingOtp(true); setLoading(false); }` | new user branch → raise the flag AppFlow's effect watches | **useEffect as FSM transition** (§92.5): state here, navigation there |
| 14 | `else { setLoading(false); throw new Error("auth_failed"); }` | unknown status → typed failure for the UI's message map | **OOP**: `Error` subclass-by-message contract between layers |
| 15 | `catch (err) { setLoading(false); throw err; }` | any throw → spinner guaranteed off, error re-raised to `LoginGate` | **memory-leak prevention** (UI edition): no path leaves `loading` stuck true |

## 95.2 `openAndAwaitCallback()` — the promise race, row by row

| # | Line | In → Out | Concept |
|---|------|----------|---------|
| 1 | `new Promise((resolve) => {` | allocates the promise + captures `resolve` | **heap**: `resolve` is a pointer into the promise's internals |
| 2 | `let settled = false;` | one boolean in the executor's environment record | **closure state** (§80.4): shared by all three callers below |
| 3 | `const done = (url) => { if (settled) return; settled = true; sub.remove(); resolve(url); };` | any caller → first one wins; listener detached; promise fulfilled | **memory-leak prevention**: `sub.remove()` deletes the native registry entry — the load-bearing line |
| 4 | `const sub = Linking.addEventListener("url", ({ url }) => { if (url && url.includes("auth-callback")) done(url); });` | registers a native listener; returns a handle (pointer) | **pointer** into the OS event registry — unreachable by GC until removed |
| 5 | `WebBrowser.openAuthSessionAsync(authUrl, RETURN_URL)` | opens the system auth tab; returns its own promise | **optimization/UX**: the OS-blessed auth session (shared cookies, auto-close) |
| 6 | `.then((res) => { if (res.type === "success" && res.url) { done(res.url); }` | browser reported the deep link itself → same idempotent exit | **algorithm**: two racers, one finish line (hand-rolled `Promise.race`, §85.3) |
| 7 | `else { setTimeout(() => done(null), 1200); } })` | dismiss/failure → 1.2 s grace before giving up | **race condition** handling: Android may deliver the Linking event *after* "dismissed" |
| 8 | `.catch(() => done(null));` | native error → resolve `null`, never reject | **null as outcome** (§88.1): "no URL" is data, not an exception |

## 95.3 `parseCallback()`, `bootstrap()`, `finishLogin()` — three small ledgers

**`parseCallback(url)`** — string → dictionary:

| # | Line | In → Out | Concept |
|---|------|----------|---------|
| 1 | `const out: Record<string, string> = {};` | allocates the result map | **data structure**: object-as-hash-map |
| 2 | `const raw = url.split("#")[1] ?? url.split("?")[1] ?? "";` | tries fragment, then query, then empty | **null handling**: `??` fallback chain ending in a null-object (§88.3) |
| 3 | `raw.split("&").forEach((pair) => {` | one pass over the pairs | **algorithm**: O(n) tokenizer |
| 4 | `const [k, v] = pair.split("=");` | destructures each pair; `v` may be `undefined` | **evaluation**: array destructuring = indexed reads |
| 5 | `if (k) out[decodeURIComponent(k)] = decodeURIComponent(v ?? "");` | decoded key → bucket write; valueless keys get `""` | **data structure**: O(1) bucket insert (§83.5) |

**`bootstrap()`** — the mount effect's body:

| # | Line | In → Out | Concept |
|---|------|----------|---------|
| 1 | `const storedToken = await SecureStore.getItemAsync("token");` | keychain → string or `null` | **persistence read**; the §91.4 key contract |
| 2 | `if (storedToken && storedUser) { setToken(…); setUser(JSON.parse(storedUser)); }` | JSON string → fresh heap object graph → two state commits | **heap allocation**: `JSON.parse` rebuilds the user object; **render**: session restored before first paint |
| 3 | `else { const storedGuest = …; if (storedGuest) setGuestProfile(JSON.parse(storedGuest)); }` | no session → try the guest profile instead | **algorithm**: fallback ladder, most-privileged first |
| 4 | `catch { await SecureStore.deleteItemAsync("token"); … }` | corrupted JSON → self-heal by clearing | **optimization (robustness)**: a bad byte can never brick launch |
| 5 | `finally { setLoading(false); }` | all paths → the splash gate opens | **leak prevention** (UI): loading always terminates |

**`finishLogin(authToken, authUser)`**:

| # | Line | In → Out | Concept |
|---|------|----------|---------|
| 1 | `await persistAuth(authUser, authToken);` | state + keychain in one place | **SOLID (SRP)**: one writer for the session (§91.4's invariant) |
| 2 | `setAwaitingOtp(false);` | OTP flag down → AppFlow's `otp → disclaimer` edge can fire | **useEffect as FSM input** |
| 3 | `await SecureStore.deleteItemAsync(OTP_SESSION_KEY);` | burn the in-flight token client-side | **security hygiene**: single-use both ends (server burns in §95.6) |
| 4 | `migrateGuestProfile(authToken, authUser).then(() => refreshProfile(authToken));` | **not awaited** — two background calls, ordered by `.then` | **optimization (perceived performance)**: user unblocks now; consistency arrives later (§92.3 ④) |

## 95.4 `OtpGate` — `handleChange` and the countdown, row by row

**`handleChange(text, index)`**:

| # | Line | In → Out | Concept |
|---|------|----------|---------|
| 1 | `const digit = text.replace(/[^0-9]/g, '').slice(-1);` | any input (letter, paste, digit) → exactly 0–1 digit | **algorithm**: sanitize-then-truncate; paste-safe |
| 2 | `const next = [...digits]; next[index] = digit;` | copy the 6-slot array, write one slot | **data structure**: immutable update — new heap array so React sees a new pointer (§85.3) |
| 3 | `setDigits(next); setError(null);` | commit → all six boxes re-render with new values | **render**: state drives UI; error cleared on any edit |
| 4 | `if (digit && index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();` | valid digit, not last → move the caret | **pointer**: `inputs.current[i]` is a native-view handle; `?.` guards unmounted slots |
| 5 | `if (next.every(d => d !== '') && digit) submitOtp(next.join(''));` | all six filled by a *typed* digit → auto-submit | **algorithm**: O(6) completeness scan; `&& digit` blocks re-submit on deletions |

**The countdown effect**:

| # | Line | In → Out | Concept |
|---|------|----------|---------|
| 1 | `if (cooldown <= 0) return;` | base case → no timer armed | **algorithm**: recursion's terminator, effect-shaped |
| 2 | `const id = setTimeout(() => setCooldown(c => c - 1), 1000);` | arms ONE timer; `c => c - 1` reads the freshest value | **useCallback/state**: functional update dodges the stale closure (§80.4) |
| 3 | `return () => clearTimeout(id);` | next tick or unmount → previous timer destroyed | **memory-leak prevention**: never two timers, never a dead-component `setState` (§85.4) |
| 4 | `}, [cooldown]);` | each decrement re-runs the effect → self-rescheduling chain | **useEffect**: dependency-driven loop, 60 links, one live timer |

## 95.5 `AppFlow` effect 1 + `useAppFlow` — the FSM's edges

| # | Line | In → Out | Concept |
|---|------|----------|---------|
| 1 | `const wasAuthed = useRef(false);` | one `{current}` box for the app's life | **pointer/heap**: previous-value cell, no re-render on write (§78.5) |
| 2 | `if (wasAuthed.current && !user) go('login');` | fires ONLY on the authed→guest *edge*, not on guest renders | **algorithm**: edge detection = compare present vs remembered past (§92.5) |
| 3 | `wasAuthed.current = !!user;` | records this render's truth for the next | **evaluation**: `!!` coerces object/null → clean boolean (§79.4) |
| 4 | `const [step, setStep] = useState<FlowStep>(() => __DEV__ \|\| !hasOnboarded ? 'splash' : 'app');` | initializer runs ONCE at mount | **useMemo-family optimization**: lazy initial state — persisted Redux consulted a single time |
| 5 | `const go = useCallback((next) => setStep(next), []);` | stable function pointer forever | **useCallback**: identity in the effects' dep arrays → effects re-run on *data* change only |
| 6 | `switch (step) { case 'login': return <LoginGate …/>; … }` | one state → exactly one screen | **render**: FSM output function; union type makes it exhaustive |

## 95.6 `GoogleAuthService::verifyOtp()` — the backend's richest ledger

| # | Line | In → Out | Concept |
|---|------|----------|---------|
| 1 | `$email = Cache::get("otp_session:{$sessionToken}");` | opaque token → email, from Redis (§81.4) | **data structure**: the session key of the five-key state machine (§92.8) |
| 2 | `if (! $email) return ['outcome' => 'session_expired'];` | TTL elapsed or bogus token → typed outcome | **null handling** + **tagged union**: absence is an outcome, not an exception |
| 3 | `if ((int) Cache::get($attemptsKey, 0) >= self::MAX_OTP_ATTEMPTS)` | counter (default 0) vs cap 5 | **security algorithm**: brute-force gate *before* the expensive hash check — cheapest-first (§91.2's ladder rule) |
| 4 | `$cached = Cache::get("otp:{$email}");` | email → `{hashed otp + google payload}` array | **heap (request arena)**: unserialized into this request's memory, freed at response (§80.6) |
| 5 | `if (! $cached \|\| ! Hash::check($otp, $cached['otp'])) {` | plaintext guess vs bcrypt hash → constant-time verdict | **algorithm (crypto)**: hashed-at-rest OTP; `\|\|` short-circuits so no hash runs when nothing is cached |
| 6 | `$attempts = (int) Cache::get($attemptsKey, 0) + 1; Cache::put($attemptsKey, $attempts, self::OTP_TTL);` | failure → counter incremented, TTL refreshed | **data structure**: counter key; state survives across *requests* precisely because it is NOT on the worker's heap (§81.4) |
| 7 | `return $attempts >= MAX ? too_many_attempts : invalid_otp;` (two lines) | distinguishes "wrong" from "locked" | **evaluation**: the caller's `match` maps these to 422 vs 429 (§92.7) |
| 8 | `$user = DB::transaction(function () use ($cached, $email) {` | opens an ACID envelope; the closure captures its inputs | **OOP/closure**: PHP `use` = explicit capture list (vs JS's implicit); **SOLID**: atomicity is service-layer policy (§90.3) |
| 9 | `User::onlyTrashed()->where('email', $email)->get()->each(fn ($t) => …forceDelete());` | soft-deleted twin rows → purged with their providers/tokens | **data integrity**: clears the unique-index collision *inside* the same transaction (§92.8) |
| 10 | `$user = User::create([…, 'password' => bcrypt(Str::random(32)), …]);` | INSERT; a random unusable password satisfies the NOT NULL column for an OAuth-only account | **security**: no password path exists for this user — `login()`'s `! $user->password` check (§91.1) can never pass wrongly |
| 11 | `$user->oauthProviders()->create([…]);` | links the Google identity (FK insert) | **data structure**: the relation row future sign-ins match on (§92.8's rung 1) |
| 12 | `$user->assignRole('user');` | pivot insert into `model_has_roles` | **the §90.2 claim's line**: single role at registration, OAuth path |
| 13 | `catch (\Exception $e) { Log::error(…); return ['outcome' => 'registration_failed']; }` | any failure → full server-side log, generic outcome | **error hygiene** (§75.5): stack traces stay server-side |
| 14 | `Cache::forget("otp:…"); ×4` | all five pending-state keys burned | **memory-leak prevention (server)**: the state machine terminates; nothing waits for TTL |
| 15 | `return $this->successResult($user->fresh());` | re-read committed row → `{outcome, user, token}` with `createToken(…)->plainTextToken` | **OOP**: Sanctum trait method (`HasApiTokens`) — behaviour mixed in, §91.1's once-visible token |

## 95.7 `PlayerContext` — the auto-advance effect, row by row

| # | Line | In → Out | Concept |
|---|------|----------|---------|
| 1 | `const prev = prevPlaybackStateRef.current; const curr = status.playbackState;` | remembered past + present, two locals on the stack | **pointer** (previous-value ref) + **stack** scalars |
| 2 | `if (prev === 'playing' && (curr === 'idle' \|\| curr === 'ended') && hasSourceRef.current) {` | true only on the *natural-end edge* — pause and fresh loads fail the `prev` term | **algorithm**: edge detection distinguishing event from level (§93.2); `&&` short-circuit = **evaluation** order as a guard |
| 3 | `const q = queueRef.current; const idx = queueIndexRef.current;` | freshest queue via refs, though the effect's deps never listed it | **stale-closure avoidance**: identity/freshness split (§76.5) — the dep array stays `[playbackState]` |
| 4 | `const nextIdx = idx + 1;` | queue pointer arithmetic | **data structure**: queue-by-index (§83.8) — O(1), no array mutation |
| 5 | `if (q.length > 0 && nextIdx < q.length) {` | bounds check → advance or finish | **algorithm**: the sentinel `nextIdx === length` = end of queue |
| 6 | `dispatch(setQueueIndex(nextIdx)); dispatch(setRecording({…}));` | Redux learns the new track → any screen's mini-player re-renders | **render**: state mirror of the non-serializable engine (§93.2) |
| 7 | `pendingPlayRef.current = true;` | records the intent to play once loaded | **pointer as deferred intent** — no render for invisible state |
| 8 | `player.replace({ uri: next.audio_url, headers: {…} });` | native source swap begins (async) | **DI**: the injected native handle does the work; JS only orchestrates |
| 9 | `} else if (q.length > 0) { dispatch(clearQueue()); }` | last track ended → queue cleared | **FSM**: terminal transition |
| 10 | `prevPlaybackStateRef.current = curr;` | present becomes the remembered past — runs on EVERY invocation, matched or not | **algorithm**: the latch update outside the branch is what makes edge detection sound |

## 95.8 `audioService.downloadRecording()` — row by row

| # | Line | In → Out | Concept |
|---|------|----------|---------|
| 1 | `const localPath = getRecordingPath(recordingId);` | id → `audio/recording_{id}.mp3` | **data structure**: filename-as-primary-key (§93.3) |
| 2 | `await ensureAudioDir(localPath);` | creates `audio/` if absent (`intermediates: true`) | **null handling**, filesystem edition: absence is expected |
| 3 | `const headers = await buildAudioHeaders(downloadUrl);` | URL → `{Authorization}` for our backend, `{}` for CDNs | **security**: credentials only to their owner (§93.3) |
| 4 | `const resumable = FileSystem.createDownloadResumable(url, path, { headers }, (p) => {…}, resumeData ?? undefined);` | builds the native download object; progress closure attached; optional resume token in | **OOP**: a stateful native object behind a JS handle; `?? undefined` folds the null contract |
| 5 | `onProgress(p.totalBytesWritten / p.totalBytesExpectedToWrite, …)` | byte counters → 0..1 fraction, pushed up | **algorithm**: normalization; guarded by `> 0` against divide-by-zero (§78.2's guard family) |
| 6 | `const token = resumable.savable().resumeData; if (token) onSnapshot(token);` | OS continuation token → persisted via the caller's dispatch | **optimization (durability)**: crash-safe resume — state exported *while* running |
| 7 | `activeRecordingDownloads.set(recordingId, resumable);` | registry write | **data structure**: module-scope `Map` = the cancellation index (§93.3) |
| 8 | `result = resumeData ? await resumable.resumeAsync() (catch → downloadAsync()) : await resumable.downloadAsync();` | token path with stale-token downgrade, else fresh | **algorithm**: optimistic resume, pessimistic fallback |
| 9 | `if (!result) throw new Error('Download cancelled');` | native `undefined` (cancelled) → typed throw for `failTask` | **null → error boundary** (§88.3): translate at the edge |
| 10 | `const info = await FileSystem.getInfoAsync(result.uri); return { uri, size: … };` | stat the finished file → `{uri, size}` for the `storageUsed` aggregate | **maintained aggregate** input (§86.2) |
| 11 | `finally { activeRecordingDownloads.delete(recordingId); }` | success/failure/cancel → registry entry removed | **memory-leak prevention**: the `Map` never accumulates dead handles |

## 95.9 Reader ledgers — `handlePlay`, `handleSearch` strategy 1, `handleGoToBookmark`

**`useMushafReader.handlePlay()`**:

| # | Line | In → Out | Concept |
|---|------|----------|---------|
| 1 | `if (!currentRecitation \|\| !selectedReciterId) return;` | nothing selected → no-op | **guard clause** (§79.2) |
| 2 | `if (audio.hasError \|\| unavailableReciterIds.has(selectedReciterId)) { recitations.setShowReciterPicker(true); return; }` | dead source → open the picker instead of retrying a known 404 | **UX algorithm**: fail forward; `Set.has` O(1) (§83.5) |
| 3 | `if (audio.isPlaying) { await audio.pause(); return; }` | toggle semantics | **FSM**: one button, state-dependent meaning |
| 4 | `if (!audio.hasSource) {` | only load when nothing is attached | **optimization**: resume never restarts from 0 (§94.2) |
| 5 | `const cached = await audioService.isAudioCached(surahId, selectedReciterId);` | one file-stat → boolean | **cache tier check** (§81.1 layer 4) |
| 6 | `const uri = cached ? audioService.getLocalPath(…) : resolveRecitationUri(currentRecitation);` | offline-first source pick | **algorithm**: cheapest source wins; CDN-vs-proxy routing (§94.2) |
| 7 | `await audio.loadAudio(uri); } await audio.play();` | attach then play | **DI**: the injected engine executes; the hook only decides |

**`useReaderSearch.handleSearch()` — the verse-reference strategy**:

| # | Line | In → Out | Concept |
|---|------|----------|---------|
| 1 | `const q = normalizeArabicDigits(rawQuery.trim());` | `"٢:٢٥٥"` → `"2:255"` | **algorithm**: digit-set normalization before parsing |
| 2 | `const match = q.match(VERSE_REF_RE);` | string → capture groups or `null` | **regex as parser**; `null` = "not a reference" (§88.1) |
| 3 | `const sid = Number(match[1]); const vnum = Number(match[2]); if (sid >= 1 && sid <= 114 && vnum >= 1)` | strings → ints, then domain bounds | **evaluation** + validation: 114 surahs, hard-coded domain truth |
| 4 | `if (sid === surahId && surah) { const idx = surah.verses.findIndex(v => v.verse_number === vnum);` | verse *number* → array *index* (0-based ≠ 1-based) | **data structure**: O(n) `findIndex` mapping between two keyspaces |
| 5 | `setSearchHighlightIndex(idx); scrollToVerse(idx);` | highlight + character-proportional scroll | **render** + the §78.2 prefix-sum payoff |
| 6 | `else router.replace(\`/mushaf/${sid}?highlight=${vnum}\`);` | cross-surah → the URL carries the intent | **SOLID (decoupling)**: hooks communicate via route params, not imports (§94.5) |

**`useReaderBookmarks.handleGoToBookmark()` — continuous branch**:

| # | Line | In → Out | Concept |
|---|------|----------|---------|
| 1 | `currentPageRef.current = b.pageIndex; setCurrentPageIndex(b.pageIndex);` | ref (synchronous readers) + state (renderers), both updated | **pointer + render**: the dual-write the §78.6 scroll handler depends on |
| 2 | `const pageH = versesHeightRef.current > 0 && pages.length > 0 ? versesHeightRef.current / pages.length : 0;` | measured block ÷ page count, guarded | **algorithm**: §78.6's inverse function; divide-by-zero guard |
| 3 | `const y = versesTopRef.current + pageH * b.pageIndex - 16;` | page index → pixel offset | **evaluation**: pure arithmetic from geometry refs — no layout query, O(1) |
| 4 | `scrollRef.current?.scrollTo({ y: Math.max(0, y), animated: true });` | clamped scroll on the native handle | **pointer** (`?.` on the ref) + clamp idiom (§78.6) |

## 95.10 How to read any remaining line

The ledgers above cover the mega-slices' load-bearing functions. Every line not
tabled falls into one of five families, each with its ledger-of-record:

| If the line looks like… | It is… | Its ledger/drawing |
|---|---|---|
| `const [x, setX] = useState(…)` / `$fillable = […]` | state/shape declaration | §86.1 (slices), §80.7 (models) |
| `useAppSelector(selectX)` / `$this->service->x()` | a layer boundary read | §86.1, §90.3, §89 |
| `dispatch(action(…))` / `return $this->success(…)` | a layer boundary write | §86.2, §87.1 |
| `x ?? y` / `x?.y` / `if (!x) return` | absence handling | §88 (the catalog), §79 (`!`) |
| `useMemo/useCallback/useRef(…)` | identity/allocation control | §78.5, §92.3 ⑦ vs §93.2 |

---

*End of the Line Ledgers. Every function that carries the mega-slices now has a
row-by-row account — line, input→output, concept — and §95.10 routes every other
line shape to its ledger-of-record. The Master Concept Index follows.*
