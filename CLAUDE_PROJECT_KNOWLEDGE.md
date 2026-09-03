# Claude Project Knowledge Pack - Quranic Clinic (Al-Mashfa Al-Qurani)

Generated: 2026-07-12 19:12
Source machine: C:\Users\wael\Desktop\Quran

## What this document is

This is a complete, self-contained export of every Claude-specific instruction,
memory, rule, role, agent prompt and configuration file used to build the
Quranic Clinic project (Laravel backend + React Native Expo mobile app).

If the original Claude account is ever lost, give this document to a new Claude
session and it can rebuild the same working context for both backend and frontend.

## How to use it in a new account

1. Copy the project code (the backend/ and mobile/ folders) into place.
2. Recreate the .claude/ directory using the files reproduced below - each
   section header named ".claude/..." is the exact relative path of that file.
3. Recreate the persistent memory: each "MEMORY/..." section is one memory file.
   Put them in your new account's memory folder and rebuild MEMORY.md from the
   index section.
4. Recreate mobile/CLAUDE.md at the project root from its section.
5. Paste this whole file into a fresh chat first so Claude absorbs the rules,
   conventions, deployment runbook, OAuth contract and offline-cache design
   before doing any work.

Note: text/markdown is the best format for re-injection because Claude reads text
directly. The .md twin of this PDF is the most faithful copy - prefer it when
recreating individual files (copy/paste preserves exact formatting).

## Table of contents

- MEMORY/MEMORY.md (index)
- MEMORY/feedback_api_test_mode_toggle.md
- MEMORY/feedback_deploy_shortcut.md
- MEMORY/feedback_filament_separation.md
- MEMORY/feedback_migration_and_naming_rules.md
- MEMORY/feedback_no_server_start.md
- MEMORY/feedback_plan_docs_single_source.md
- MEMORY/project_quran.md
- MEMORY/project_quran_auth_token_fix.md
- MEMORY/project_quran_deployment.md
- MEMORY/project_quran_monorepo.md
- MEMORY/project_quran_oauth_flow.md
- MEMORY/project_quran_offline_cache.md
- MEMORY/project_quran_ota_updates.md
- MEMORY/project_quran_redis.md
- MEMORY/reference_backend_cache_models.md
- MEMORY/reference_mobile_dev_build.md
- MEMORY/reference_ssh_server.md
- MEMORY/user_profile.md
- .claude/shared-context.md
- .claude/server-production.md
- .claude/settings.json
- .claude/settings.local.json
- .claude/backend/agents/api-engineer.md
- .claude/backend/agents/database-architect.md
- .claude/backend/agents/filament-cms-builder.md
- .claude/backend/agents/helper-generator.md
- .claude/backend/agents/model-generator.md
- .claude/backend/agents/repository-generator.md
- .claude/backend/agents/security-auditor.md
- .claude/backend/agents/seeder-generator.md
- .claude/backend/agents/service-generator.md
- .claude/backend/amendment-rules.md
- .claude/backend/cache-strategy.md
- .claude/backend/caching.md
- .claude/backend/deployment-checklist.md
- .claude/backend/error-handling-patterns.md
- .claude/backend/mcp/database-config.json
- .claude/backend/mcp/filesystem-config.json
- .claude/backend/mcp/mcp-instructions.md
- .claude/backend/messages/initial-message.md
- .claude/backend/messages/phase-complete.md
- .claude/backend/phase-assignment.md
- .claude/backend/phase-modes.md
- .claude/backend/project.md
- .claude/backend/prompts/phase-1-database.md
- .claude/backend/prompts/phase-2-repositories.md
- .claude/backend/prompts/phase-3-models-services.md
- .claude/backend/prompts/phase-4-filament.md
- .claude/backend/prompts/phase-5-api.md
- .claude/backend/prompts/phase-6-security.md
- .claude/backend/roles/executor-api.md
- .claude/backend/roles/executor-filament.md
- .claude/backend/roles/executor-laravel.md
- .claude/backend/roles/executor-security.md
- .claude/backend/roles/parent.md
- .claude/backend/roles/qa.md
- .claude/backend/roles/researcher.md
- .claude/backend/rules.md
- .claude/backend/scan-instructions.md
- .claude/backend/system-prompt.md
- .claude/backend/testing.md
- .claude/backend/validation-checklist.md
- .claude/mobile/CLAUDE.md
- .claude/mobile/components-design.md
- .claude/mobile/hierarchy-navigation.md
- .claude/mobile/hooks-design.md
- .claude/mobile/notifications.md
- .claude/mobile/offline-sync.md
- .claude/mobile/optimization.md
- .claude/mobile/phase-assignment.md
- .claude/mobile/project.md
- .claude/mobile/rules.md
- .claude/mobile/screens-design.md
- .claude/mobile/services-design.md
- .claude/mobile/store-design.md
- .claude/mobile/styling-convention.md
- .claude/prompt-rules.md
- mobile/CLAUDE.md


---

# FILE: MEMORY/MEMORY.md (index)

```
# Memory Index

- [User Profile](user_profile.md) — Wael, full-stack web + mobile app software engineer (Laravel + React Native), building a Quran app locally
- [Quranic Clinic Project](project_quran.md) — Laravel + React Native Expo, Mushaf feature first, 6-phase build plan, all local
- [Migration & Naming Rules](feedback_migration_and_naming_rules.md) — No extra migrations (edit original + migrate:fresh); single-language text columns, no _ar/_en, no Spatie Translatable
- [Plan Docs Single Source](feedback_plan_docs_single_source.md) — Define shared rules once in .claude/shared-context.md; never duplicate across backend plan files
- [No Server Start](feedback_no_server_start.md) — Never start Expo or occupy any port; user runs the terminal themselves
- [Quran Deployment](project_quran_deployment.md) — Backend deployed to mashfa.odooclick.com (Ubuntu, PHP 8.4, MySQL, Nginx) at /var/www/mashfa/app from Azure repo
- [Filament Separation Rule](feedback_filament_separation.md) — Every Filament resource must have separate Schemas/XxxForm.php and Tables/XxxTable.php; never inline form/table logic in the Resource file
- [SSH Server Access](reference_ssh_server.md) — Key at C:\Users\wael\Downloads\id_ed25519_MashfaQurani_pro, port 2222, root@185.55.243.191; deploy via deploy.sh
- [Mobile Dev Build vs Metro](reference_mobile_dev_build.md) — Phone runs a standalone build (expo-updates, android/ folder, no dev-client); local Metro edits won't show unless using Expo Go (press s), expo run:android, or eas update --channel preview
- [Offline Caching](project_quran_offline_cache.md) — All text/metadata auto-caches via cachedFetch + networkMode offlineFirst; only Ruqyah/recitation AUDIO is download-only; Mushaf uses separate offlineStorage SQLite
- [OAuth Flow](project_quran_oauth_flow.md) — Google sign-in must use openAuthSessionAsync; backend↔mobile return-URL contract quranicclinic://auth-callback; session-token polling
- [Deploy+Build Shortcut](feedback_deploy_shortcut.md) — "ship it" / "شيب" / "d+b" / "deploy+build" / "push and build" = push backend to server + EAS APK build + return link
- [API Test-Mode Toggle](feedback_api_test_mode_toggle.md) — Flip mobile between LOCAL and PRODUCTION testing via EXPO_PUBLIC_API_URL in mobile/.env; auth-gated bugs only surface in production mode
- [Auth Token Fix](project_quran_auth_token_fix.md) — Production-only auth bug fixed: tokenManager read wrong SecureStore key; keep its keys in sync with AuthContext ("token"/"user")
- [Backend Cache & Models](reference_backend_cache_models.md) — DB cache store model round-trip issue; now have App\Support\ModelCache (snapshot+rehydrate). Adhkar/Tahsinat/Sponsor fixed 2026-06-25; FeatureFlag was already array-safe
- [Quran Monorepo](project_quran_monorepo.md) — github.com/WaelHamwi/Quran-Clinic (backend+mobile via subtree, 2026-06-25); ⚠️ leaked Google OAuth secret purged from history but MUST be rotated
- [Production Redis](project_quran_redis.md) — prod cache + rate limiting on Redis (predis client, db1) since 2026-06-27; fallback must run in boot() not register()
- [OTA Updates](project_quran_ota_updates.md) — Preview APK uses expo-updates; "failed to download remote update" = stale update; fix by republishing `eas update --branch preview`
```

---

# FILE: MEMORY/feedback_api_test_mode_toggle.md

```
---
name: feedback-api-test-mode-toggle
description: How to flip the mobile app between local-backend testing and production (Mashfa) testing via the .env EXPO_PUBLIC_API_URL toggle
metadata:
  type: feedback
---

Standard workflow for the Quran mobile app: test a change on LOCAL first, then on PRODUCTION (Mashfa) before/after building the APK. Flip between the two via one line in `mobile/.env`.

- **LOCAL mode** — comment out `EXPO_PUBLIC_API_URL` in `mobile/.env`. A dev run hits the local backend (LAN host auto-derived from the Expo dev server) and auto-falls back to Mashfa if local is down. Backend auth is lenient locally.
- **PRODUCTION mode** — uncomment `EXPO_PUBLIC_API_URL=https://mashfa.odooclick.com/api`. This is rule #1 in `mobile/CLAUDE.md` (hard override): it forces Mashfa everywhere, even in Expo Go / dev client, so REAL auth is exercised.

**Why:** Auth-gated bugs (e.g. the bearer-token key mismatch in [[project_quran_auth_token_fix]]) stay hidden in LOCAL mode because the local Laravel backend doesn't enforce the token. They only surface in PRODUCTION mode against real auth. So production testing is required to validate any auth-gated feature.

**How to apply:** When the user says "move to production setting" / "test on production", ensure the `EXPO_PUBLIC_API_URL` line in `mobile/.env` is uncommented. When returning to local dev, comment it out. The `.env` block is self-documented as a "PRODUCTION TEST TOGGLE". Treat it as a temporary test switch, never a permanent default (CLAUDE.md forbids leaving it set permanently — but the user explicitly toggles it for production testing). A real release/preview EAS APK uses production automatically (`__DEV__` is false), independent of this toggle. OAuth always uses production regardless. Never start Expo myself — see [[feedback_no_server_start]].
```

---

# FILE: MEMORY/feedback_deploy_shortcut.md

```
---
name: deploy-shortcut
description: "User abbreviation \"ship it\" (or \"شيب\" / \"deploy+build\" / \"d+b\") triggers the standard deploy+build flow: push backend to server + build APK and return link"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 5c5ff59b-bb88-4c46-ad35-51293c172c32
---

When the user says any of these shorthand phrases, immediately run the full deploy+build flow without asking for confirmation:

- **"ship it"**
- **"شيب"**
- **"d+b"**
- **"deploy+build"**
- **"push and build"**

**The flow:**
1. Check `git diff --stat HEAD -- backend/ mobile/` for uncommitted changes
2. If backend has changes: commit them, push to Azure (`git push origin dev` or `master`), then SSH deploy: `git stash --include-untracked && git pull --ff-only origin master && git stash drop && composer install --no-dev && php artisan config:cache && php artisan route:cache && systemctl reload php8.4-fpm`
3. Start EAS APK build in background: `cd mobile && npx eas build --platform android --profile preview --non-interactive`
4. Post the APK download link when the build finishes

**Why:** User asked to save this shortcut so they don't have to type the long prompt every time.

**How to apply:** Recognize any of the above phrases as a trigger for the full deploy+build pipeline. No clarification needed — just execute.
```

---

# FILE: MEMORY/feedback_filament_separation.md

```
---
name: feedback-filament-separation
description: Every Filament resource must separate form schema and table into dedicated classes — never inline in the Resource file
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 156d5619-5983-4dba-a936-766de0d2edc7
---

Every Filament resource must split its form and table logic into dedicated sub-classes. Never write columns, filters, actions, or form components inline inside the Resource file.

**Why:** User explicitly enforced this as a hard project rule after finding resources that still had inline `form()` / `table()` logic.

**How to apply:**
- `Schemas/XxxForm.php` → `public static function getSchema(): array` containing all form components
- `Tables/XxxTable.php` → `getColumns()`, `getFilters()`, `getActions()`, `getBulkActions()` each returning an array
- Resource `form()` calls `$schema->components(XxxForm::getSchema())`
- Resource `table()` calls `->columns(XxxTable::getColumns())->filters(...)->actions(...)->bulkActions(...)` plus any `->defaultSort()` or `->defaultGroup()` on the Resource side
- Shared constants needed by both form and table (e.g. `APPLICABILITY`) stay on the Resource class and are referenced as `XxxResource::CONSTANT` from the sub-classes

See [[project-quran]] for project context.
```

---

# FILE: MEMORY/feedback_migration_and_naming_rules.md

```
---
name: feedback_migration_and_naming_rules
description: "Hard project rules: no extra migration files; Spatie Translatable JSON on backend; mobile must hold both ar+en for all content (dynamic and static)"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: ddf14b82-f10a-40b4-b486-7805da138594
---

NEVER create a separate migration file to add, remove, or rename a column. Always edit the original `create_*_table` migration for that model, then tell the user to run `php artisan migrate:fresh --seed`. One schema, one file.

**Why:** This is now the DATABASE MIGRATION RULE in `.claude/shared-context.md` (the single source of truth at the top of the plan hierarchy). Stacking alter migrations creates clutter and diverges from the single-source-of-truth schema philosophy the user follows.

**How to apply:** Any time a column change is needed on an existing table, open the original `create_*_table` migration, edit it in place, and instruct `migrate:fresh --seed`. Never run `php artisan make:migration`.

---

All bilingual text uses **Spatie Translatable** — ONE `json` column per field (`name`, `description`, `text`, `title`, `alias`, `daleel`, `hint`, `label`, `bio`, …) with `use HasTranslations` + `public array $translatable`. Never `_ar`/`_en` column pairs, never two separate columns.

**Why:** On 2026-05-18 the user's final decision (stated in conversation) is that the WHOLE project — including the already-built Mushaf feature — uses Spatie Translatable for consistency. This supersedes the brief "single plain column / no translation" direction and the original `_ar`/`_en` rule.

**How to apply:** Every translatable column is a single `json` column. Models declare `use HasTranslations` + `$translatable`. The Mushaf feature (`surahs`, `verses`, `reciters`) is being refactored from `name_ar`/`name_en` / `text_ar`/`text_en` to Spatie JSON — across migrations, models, Filament, API, seeders, AND the React Native mobile app. API Resources expose the full translations object (`getTranslations()`), e.g. `name: {ar, en}`.

---

**Mobile bilingual rule** (added 2026-05-24, codified in `mobile/CLAUDE.md`):

All content in the mobile app — dynamic (API responses) AND static (hardcoded strings) — must hold both `ar` and `en`. Type translatable fields as `{ ar: string; en: string }`, never as `string`. Select the active locale from the Redux store at render time (`'ar' | 'en'`, default `'ar'`). Static strings go in `src/i18n/` with both locales. Never hard-access a single locale key.

**Why:** Backend Spatie Translatable always returns both locales. The mobile must mirror that contract end-to-end.

**How to apply:** Any new screen, component, hook, or service that renders text must follow this pattern — no exceptions for "small" static labels.
```

---

# FILE: MEMORY/feedback_no_server_start.md

```
---
name: feedback-no-server-start
description: Never start the Expo dev server or occupy any port — user runs the terminal themselves
metadata:
  type: feedback
---

Never run `npx expo start`, `npm start`, or any command that starts a dev server or occupies a port.

**Why:** User wants full control over the terminal and port usage.

**How to apply:** After making code changes, do not start or restart the app. Do not kill processes on port 8081. Simply report what was changed and let the user run the server themselves.
```

---

# FILE: MEMORY/feedback_plan_docs_single_source.md

```
---
name: plan-docs-single-source
description: "In the .claude/ plan docs, define each shared rule once in shared-context.md — never duplicate it across backend files"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: f4785dd6-610b-441c-b1fc-f0a5f4f7389c
---

The `.claude/` directory holds a multi-file plan/instruction set (shared-context.md at the top, plus backend/ roles, agents, phases, messages). Shared rules must be defined ONCE in `shared-context.md` and not repeated anywhere else.

**Why:** The user explicitly pushed back on the file-size rule ("max 450 lines") being repeated across ~20 files. They consider `shared-context.md` the top of the plan hierarchy — it is always read first, so downstream files do not need to restate its rules. Duplication causes drift and noise.

**How to apply:**
- When adding a project-wide rule (file-size limit, migration policy, naming conventions), put it in `shared-context.md` only.
- Do NOT add "see shared-context.md" pointer lines in other files either — the user wants the rule simply absent elsewhere, not cross-referenced.
- Also removed: any requirement for the agent to ask user permission before amending/splitting a file (splitting happens automatically per the shared-context rule). Deletion still requires user approval — that protocol stays.
- Current shared-context.md rules: FILE SIZE LIMIT (450 lines, migrations exempt, auto-split) and DATABASE MIGRATION RULE (amend existing create_*_table migration directly, never add a new migration file for column changes — see [[migration-and-naming-rules]]).
```

---

# FILE: MEMORY/project_quran.md

```
---
name: project-quran
description: "Quranic Clinic app — Laravel backend + React Native Expo mobile, Mushaf feature first, all local"
metadata: 
  node_type: memory
  type: project
  originSessionId: f4785dd6-610b-441c-b1fc-f0a5f4f7389c
---

Project: **Quranic Clinic**
Root: `C:\Users\wael\Desktop\Quran`
Stack: Laravel 13 (PHP 8.4.6) + Filament 5 + MariaDB 10.4.32 + React Native Expo

**Why:** User is building a real Quran application; first feature is the Mushaf (Quran text display).
**How to apply:** Everything runs locally — no cloud deployment. Never touch `mobile/` from backend tasks. Only the Quran feature is in scope now; all other features (categories, diseases, recordings, favorites, azkar, feedback, subscriptions, reciters, audio) are explicitly out of scope.

## Current state (2026-05-19)
- Backend built: full API exists (`backend/routes/api.php`) covering Quran, Hospital/Ruqyah, Adhkar, Tahsinat, courses, sponsors, features, favorites, feedback, notifications.
- **Mobile frontend now built** — full React Native Expo app per `.claude/mobile/` plan: Redux Toolkit store (9 slices) + redux-persist, `apiClient`, Hospital (categories→subcategories→diseases→disease detail + General Ruqyah + search + favorites), Adhkar, Tahsinat, Favorites, More/Settings, Downloads, Sponsors, Courses, Onboarding + Sponsor launch gate, local notifications + accelerometer wake-detection, and "Ask Me" OpenAI chat (key in `EXPO_PUBLIC_OPENAI_API_KEY`, model gpt-4o-mini, called direct from app).
- Mushaf feature left untouched (functionality preserved); the existing 4 Contexts (Theme/Language/Auth/Mushaf) remain the source of truth — Redux added for new domains only.
- **Outstanding:** Figma-accurate styling pass is NOT done — it needs the Figma MCP connector enabled. New screens currently use the shared green theme tokens. One pre-existing type error in `app/mushaf/[id].tsx:178` (not introduced by the frontend build).
- Verified: `tsc --noEmit` clean (except that pre-existing error); `expo export` Android bundle succeeds.

## Key specs
- Quran JSON source: https://cdn.jsdelivr.net/npm/quran-cloud@1.0.0/dist/quran.json (114 surahs, 6,236 verses)
- Tables: `surahs`, `verses` (plus users, Spatie RBAC, Spatie media)
- API: GET /api/surahs, GET /api/surahs/{id}, GET /api/verses/search?q={query}
- Rules: max 450 lines/file (migrations exempt), no inline comments, repository + service pattern, transactions, cache TTL 300s

## Phase plan
- Phase 0: Backend scan
- Phase 1: 9 migrations
- Phase 2: Repositories (6 files)
- Phase 3: Models + Services + Seeder + Tests (12 files)
- Phase 4: Filament CMS (4 files)
- Phase 5: API controllers (5+ files)
- Phase 6: Security + Middleware (6+ files)
```

---

# FILE: MEMORY/project_quran_auth_token_fix.md

```
---
name: project_quran_auth_token_fix
description: Fixed production-only auth bug — TokenManager read the wrong SecureStore key so apiClient sent no bearer token; only reproducible against real (production) auth
metadata:
  type: project
---

The mobile app had a production-only auth bug (fixed 2026-06-18): `AuthContext` writes the bearer token to expo-secure-store key `"token"`, but `src/lib/tokenManager.ts` read key `"auth_token"` (never written), and `apiClient.ts` builds its `Authorization` header from `TokenManager.getToken()`. Result: every auth-gated apiClient call (notifications, favorites, courses, ruqyah, tahsinat, feedback) went out unauthenticated → 401/403 in the production APK.

**Fix applied:** changed `TOKEN_KEY`/`USER_KEY` in `tokenManager.ts` to `"token"`/`"user"` to match AuthContext (the single writer). AuthContext's login/logout logic was left untouched. There is NO frontend dev-auth-bypass flag — the bug hides in local dev only because the local backend doesn't enforce the token (see [[feedback_api_test_mode_toggle]]).

**How to apply:** Keep `tokenManager.ts` keys in sync with whatever keys `AuthContext` writes — they are a contract. To verify auth-gated features, test in PRODUCTION mode (real auth), not local. If the user wants this class of bug to surface in dev too, that's a separate backend change (stop bypassing `auth:sanctum` in the local Laravel env).
```

---

# FILE: MEMORY/project_quran_deployment.md

```
---
name: project-quran-deployment
description: Production server deployment for the Quranic Clinic Laravel backend (mashfa.odooclick.com)
metadata: 
  node_type: memory
  type: project
  originSessionId: dddd0277-b10f-441e-b4fa-9f40237c4693
---

The Quranic Clinic Laravel backend ([[project-quran]]) is deployed to a production server.

- **Server:** Ubuntu 24.04, SSH `ssh -i C:\Users\wael\Downloads\id_ed25519_MashfaQurani_pro -p 2222 root@185.55.243.191`.
- **Domain:** https://mashfa.odooclick.com (Let's Encrypt/Certbot SSL, Nginx).
- **App path:** `/var/www/mashfa/app` (git repo, `origin` = Azure DevOps `Core-Click/Almashfa`). Nginx root → `/var/www/mashfa/app/public`.
- **Stack:** PHP **8.4** (from `ondrej/php` PPA — project needs 8.4 because composer.lock pins Symfony 8; Ubuntu's default 8.3 is too old), Composer, MySQL 8. PHP-FPM socket `/run/php/php8.4-fpm.sock`.
- **DB:** MySQL `quranic_clinic`, user `quranic`@localhost. Password stored at `/root/.mashfa_dbpass` and in the app `.env`.
- **Env:** `APP_ENV=production`, `APP_DEBUG=false` (differs from local's debug=true, deliberately).
- **Nginx config** kept in repo at `deploy/nginx-mashfa.conf`.
- **Deploy update flow (intended):** push to Azure `master`, then on server run `bash /var/www/mashfa/app/deploy.sh` (in repo: `backend/deploy.sh`) — does git pull + composer install --no-dev + migrate --force + config/route/view:cache + chown storage + reload php8.4-fpm. Azure PAT is now stored in git credential store (`/root/.git-credentials`, chmod 600) so pulls are non-interactive.
- **Deploy reality (as of 2026-07-04):** local `backend/` IS its own git repo now (branch `master`, `origin` = Azure Almashfa, `github` = quranic-api) and the normal push → `deploy.sh` flow works, including `route:cache`. **The Azure PAT in `/root/.git-credentials` EXPIRED (2026-07-04)** — `deploy.sh`'s `git pull` fails with auth error until Wael rotates it (PAT scope Code→Read, then rewrite `/root/.git-credentials` per `.claude/server-production.md`). **Working fallback used:** `git bundle create` locally → `scp` to `/root/mashfa-deploy.bundle` → on server `git fetch /root/mashfa-deploy.bundle master && git merge --ff-only FETCH_HEAD` → run deploy.sh's remaining steps manually (composer install --no-dev, migrate --force, config/route/view:cache, chown storage, reload php8.4-fpm).
- **Full live-reflection runbook** (backend, CMS, API, APK): `.claude/server-production.md`, summarized as a rule in `.claude/shared-context.md`.
- **Mobile APK** built via EAS from the server (local IPv4 to api.expo.dev is broken). Project `@wael_hamwi/quranic-clinic`; API base URL fixed to production in `mobile/src/services/api.ts`. Rebuild needed for native changes; EAS Update (OTA) not yet set up for JS-only changes.
- Admin login: `admin@quran.local` (seeded, same as local).
- **Google OAuth:** Configured. Client ID/Secret in `.env` (Web client `848883725084-knuqqgdkkkd1vlf6q1c8t7atforfunlh`). OAuth app published to production on Google Cloud Console (`mashfa-quranic-clinic` project, owner `haw6218@gmail.com`). SMTP relay also via `haw6218@gmail.com` (App Password in `.env`).
- **Queue worker & scheduler (FIXED 2026-07-06, backend commit `79837bb`):** systemd service `mashfa-queue` (unit versioned at `deploy/mashfa-queue.service`, worker log `storage/logs/worker.log`) + `/etc/cron.d/mashfa` running `schedule:run` (versioned at `deploy/mashfa-cron`). deploy.sh now installs both idempotently and signals `queue:restart` each deploy. `DB_QUEUE_RETRY_AFTER=630` added to server .env (must exceed CompressAudioJob's 600 s timeout). **ffmpeg installed** on the server (was missing — compression jobs could never have run). The 8 stuck jobs were stale pre-`$disk`-refactor payloads (typed-property unserialize crash); re-dispatched fresh for recordings 16/17/25/26/27 — all compressed OK (27's .m4a → .mp3, audio_path updated) — then `queue:flush`ed the stale failures. The old never-installed `deploy/laravel-worker.conf` (Supervisor) was deleted.
```

---

# FILE: MEMORY/project_quran_monorepo.md

```
---
name: project-quran-monorepo
description: Quran-Clinic GitHub monorepo (backend+mobile) created 2026-06-25; plus a leaked OAuth secret that must be rotated
metadata: 
  node_type: memory
  type: project
  originSessionId: e4e67272-9644-4c58-abb4-2dd3da0ee36f
---

On 2026-06-25 the Quran project was consolidated into a **GitHub monorepo**: https://github.com/WaelHamwi/Quran-Clinic.git (branch `main`). Built from `C:\Users\wael\Desktop\Quran-Clinic` via `git subtree` from the two pre-existing sub-repos, preserving full history:
- `backend/` ← was `Desktop/Quran/backend` (.git remotes: Azure `Almashfa` = deploy, GitHub `quranic-api`).
- `mobile/` ← was `Desktop/Quran/mobile` (had NO remote before).

Each sub-project keeps its own `.gitignore`. Deploy still flows through Azure `Almashfa`; to keep deploying, push the backend subtree: `git subtree push --prefix=backend <azure-Almashfa-url> master` (or repoint deploy.sh).

**Accidental repo:** there was a stray `.git` at `C:\Users\wael` (home dir) pointing at an unrelated Azure `MalakBeautyLanding`/Next.js project — it polluted `git status` and held the misleading "Initial commit" history. User chose to remove it (move `.git` to a backup, then delete) — **still NOT removed as of 2026-07-06** (`git rev-parse --show-toplevel` from Desktop/Quran still resolves to `C:/Users/wael`).

**⚠️ SECURITY ACTION PENDING:** `mobile/.env` (with a **Google OAuth Client Secret**) had been tracked since early mobile history; GitHub push protection caught it. Purged from the monorepo history via `git filter-branch` and `.env` is now gitignored. BUT the secret is still compromised — **must be rotated in Google Cloud Console**. **Fixed 2026-07-06 (commit `e097afb` in the mobile repo):** the secret line was deleted from `mobile/.env`, `.env` is now untracked + gitignored, and a secret-free `.env.example` template was added. The secret env var was referenced nowhere in mobile source. Old commits in the local mobile repo history still contain it (unpushed, no remote), which rotation makes harmless. **Rotation in Google Cloud Console still pending user action** — re-verified 2026-07-12: the leaked secret in mobile history (pre-`e097afb`) is byte-identical to the live `GOOGLE_CLIENT_SECRET` in `backend/.env`, so it has NOT been rotated.

**Claude files pushed (2026-06-25):** root `.claude/` (agents/prompts/rules/shared-context/mcp configs), `CLAUDE_PROJECT_KNOWLEDGE.md`, `docs/`, `build-claude-knowledge.ps1`, `.mcp.json` are now in the monorepo. EXCLUDED + gitignored: `.claude/settings.json` and `.claude/settings.local.json` (they embed a **live Expo access token** `EXPO_TOKEN` + SSH host/key paths), and generated `*.pdf`. The Expo token also appeared inside `CLAUDE_PROJECT_KNOWLEDGE.md` (the build script concatenates the settings files) — redacted before commit. Token was never pushed, but consider rotating it as hygiene. ⚠️ As of 2026-07-12 the LOCAL `Desktop/Quran/CLAUDE_PROJECT_KNOWLEDGE.md` and `.html` again contain the UNREDACTED Expo token (build script re-embedded it) — must be re-redacted before any future push of those files. Server IP 185.55.243.191 is NOT secret and is already public in `backend/deploy.sh`.

Related: [[project_quran]] [[project_quran_deployment]] [[reference_backend_cache_models]] [[reference_ssh_server]]
```

---

# FILE: MEMORY/project_quran_oauth_flow.md

```
---
name: project_quran_oauth_flow
description: Quran app Google OAuth — deep-link callback + native OTP + one-time session exchange (no polling)
metadata: 
  node_type: memory
  type: project
  originSessionId: eca2f302-9b94-4531-a244-a4b71593b29c
---

Mobile Google sign-in (rewritten 2026-06-13, replacing the old session-polling/browser-OTP
flow): app opens `WebBrowser.openAuthSessionAsync(authUrl, RETURN_URL)` with a generated
32-char `session_token` stored in SecureStore (`otp_session_token`). A `Linking` listener
is kept as a fallback because the standalone Android APK can surface the custom-scheme
redirect as an OS deep link slightly after the tab reports dismissed.

**Return-URL contract (must match exactly):** `quranicclinic://auth-callback`.

**Browser→app handoff MUST be an HTML "bounce" page, NOT a 302** (`GoogleAuthController@callbackRedirect`
returns inline HTML via `response()`, not `redirect()->away()`). Inside the Android Chrome
Custom Tab that `openAuthSessionAsync` opens, a server 302 to a custom scheme is dropped
(ERR_UNKNOWN_URL_SCHEME, no user gesture) → app stuck, no OTP screen (the failure seen
2026-06-13 on the production APK). The page does JS `window.location.replace` + a tap
"Open the app" `<a>` button (a user tap always launches a registered scheme). **Use QUERY
params `?status=…&session_token=…`, NOT a `#` fragment** — Android strips fragments off
launched intents. status ∈ {success, verification_required, error}. Only status + opaque
session_token leave the server — never the bearer token or profile. This is a backend-only
contract: changing it needs NO APK rebuild (app already parses `?`).

Flow:
- Backend callback (`GoogleAuthController@handleGoogleMobileWebCallback`, redirects now — NO blade views):
  - Existing user → caches one-time `auth_exchange:{token}` = {token,user}, redirects `status=success`.
  - New user → emails OTP, caches `otp:{email}` + `otp_session:{token}=email`, redirects `status=verification_required`.
- App validates returned session_token === stored, then:
  - success → `POST /api/auth/session-exchange {session_token}` → bearer token (one-time, forgotten on read; 410 if expired). NOT a poll.
  - verification_required → native `OtpGate` screen → `POST /api/auth/verify-otp {session_token, otp}`.
- `verify-otp`/`resend-otp` resolve the email from `otp_session:{token}` (app never receives the email).
- AuthContext state trigger is `awaitingOtp` (replaced `pendingEmail`).

Screen flow is a step machine (`AppFlow` + `useAppFlow`: splash/onboarding/login/otp/disclaimer/app),
SEPARATE from expo-router. Sign-in/OTP transitions are gated on `step === 'login'`. Gotcha
(fixed 2026-06-13): sign-out/delete sets `user=null` but the step stayed on `app`, so a
re-signup never reached OTP and landed half-logged-out ("guest"). Fix = AppFlow effect that
returns to `login` on an authenticated→null transition (tracks previous user via a ref so
guest mode, where user is always null, is unaffected). Backend delete is fine: `deleteAccount`
hard-`forceDelete()`s and `oauth_providers.user_id` FK is `ON DELETE CASCADE` (verified live),
freeing the email. Also: `finishLogin` persists immediately from the exchange/verify response
and refreshes `/me` in the BACKGROUND (don't re-add a blocking `/me` — it slowed every sign-in).

`app.json` has Android `intentFilters` for the scheme — a NATIVE change, so the APK must be
rebuilt (`eas build`/`expo run:android`); an OTA `eas update` won't apply it. See
[[reference_mobile_dev_build]]. Backend is edited directly on the server then caches cleared
(the live tree has uncommitted edits; `deploy.sh` git-pull is NOT usable as-is) —
[[project_quran_deployment]] / [[reference_ssh_server]].
```

---

# FILE: MEMORY/project_quran_offline_cache.md

```
---
name: project_quran_offline_cache
description: Quran/Mashfa app offline caching architecture — what auto-caches vs download-only
metadata:
  type: project
---

The Mashfa mobile app must work offline for all content the user has navigated through; only **Ruqyah recordings and Quran recitations AUDIO files** stay download-only (explicit user action). All text/metadata auto-caches.

**Mechanism (two layers):**
- `networkMode: 'offlineFirst'` set globally in `src/providers/QueryProvider.tsx` so React Query runs the `queryFn` even when offline (default `'online'` pauses it forever — the original bug that left Mushaf spinning and the Clinic page blank).
- `cachedFetch(key, fetcher)` from `src/services/contentCache.ts` (SQLite KV `content_cache_v1.db`) — API-first, writes on success, returns last cached copy on failure. This is the standard pattern (RULE_35); use it for any new content hook. Do NOT create parallel caches (an early `clinicCache.ts` AsyncStorage duplicate was deleted).

**Hooks wired to cachedFetch:** useCategories, useCategory, useSubcategory, useDisease, useDiseases, useRecordings (metadata/text only), useReciters, useCourses, useSponsors, SponsorScreen, plus useGeneralRuqyah (manual contentCache.get/setItem). Adhkar/Tahsinat already used it.

**Remote icons:** `RemoteSvg.tsx` caches fetched SVG XML via `cachedFetch('svg:'+uri)` so category/disease icons render offline (raw `fetch` with no cache was the bug — icons vanished offline). Raster images use expo-image's default `memory-disk` cache (no `cachePolicy` overrides anywhere). Note: RN `StyleSheet`/styles and fonts are bundled in the APK — there is no "CSS" to cache.

**Mushaf uses the separate `offlineStorage.ts` SQLite DB (`quran_v2.db`), not contentCache.** Key fix: `useSurah` now saves the surah's own metadata via `saveSurahs([surahMeta])` on every open (not just list page 1) — otherwise surahs beyond #15 had verses but no metadata and threw "Failed to load surah" offline. `useSurahs` now caches every scrolled page, not just page 1. Mushaf hooks use `retry: false` + `networkMode: 'offlineFirst'`.

Related: [[project_quran]], [[feedback_migration_and_naming_rules]]
```

---

# FILE: MEMORY/project_quran_ota_updates.md

```
---
name: project_quran_ota_updates
description: Preview APK uses expo-updates OTA; "failed to download remote update" is fixed by republishing to the preview branch
metadata:
  type: project
---

The Quran mobile **preview** EAS APK ships with expo-updates **enabled** (app.json has `updates.url` + `runtimeVersion.policy: appVersion` → runtime `1.0.0`; `/android` is gitignored so EAS prebuilds native config from app.json — the local AndroidManifest `ENABLED=false` never reaches the build).

**Symptom:** `Uncaught Error: java.io.IOException: failed to download remote update` when opening the installed APK. Root cause is usually a **stale published update whose assets no longer download**, not a code bug.

**How to apply / fix:** republish a fresh update — the installed APK grabs it on next launch (needs internet; may take 2 full relaunches since download applies on the *following* launch):
```
cd mobile && npx eas-cli update --branch preview --message "..." --non-interactive
```
Check channel state with `npx eas-cli channel:view preview`. Logged in as `wael-hamwi` (haw6218@gmail.com), projectId c44a0590-7866-4458-b3d0-e01e4a9ca4d8.

**If it still red-screens after republish + 2 relaunches:** it's a real JS/native startup crash that expo-updates masks behind the same message — pull `adb logcat` (adb at `%LOCALAPPDATA%\Android\Sdk\platform-tools`) to get the true error. Alternatively, disabling OTA (`updates.enabled=false` in app.json) + rebuilding forces the embedded bundle and unmasks the real crash. See [[reference_mobile_dev_build]] and [[feedback_deploy_shortcut]].
```

---

# FILE: MEMORY/project_quran_redis.md

```
---
name: project_quran_redis
description: "Production Redis is now enabled for cache + rate limiting (predis client, db1); the boot()-vs-register() fallback gotcha"
metadata: 
  node_type: memory
  type: project
  originSessionId: ce355cee-d320-4ed6-b402-5521536d4002
---

As of 2026-06-27, production (mashfa.odooclick.com) uses **Redis 7** for the cache store and rate limiting. SESSION_DRIVER and QUEUE_CONNECTION stay on `database` (sessions to avoid logout churn; queue has no worker, so Redis would be inert there).

Key facts:
- Client is **predis** (pure PHP), not phpredis — `REDIS_CLIENT=predis`, `predis/predis` is in composer. So no `ext-redis` extension is needed on the server. Added via the Azure deploy repo so `deploy.sh`'s `composer install` keeps it.
- Laravel's cache uses the **`cache` redis connection = DB 1**; the `default` connection is DB 0. Keys are double-prefixed: `quranic-clinic-database-` (connection options.prefix) + `quranic-clinic-cache-`. So inspect with `redis-cli -n 1 keys '*'`.
- **Gotcha fixed:** `AppServiceProvider::applyRedisFallbacks()` (the auto-fallback that pings Redis and degrades to file/database if down) was called in `register()`. That's too early — `app('redis')` throws there, and during `php artisan config:cache` the thrown `cache.default=file` got compiled into the cached config, permanently masking a healthy Redis (warning lost because Log isn't booted in register()). Fix: call it in `boot()` and skip under `runningInConsole()` so config:cache can never bake a stale fallback.
- To enable on the server originally: `apt install redis-server` (bound to 127.0.0.1 only), flip prod `.env` `CACHE_STORE=redis` + `REDIS_CLIENT=predis`, run `deploy.sh`. A pre-redis `.env.bak.before-redis.*` rollback sits in the app dir. See [reference_ssh_server]] and [[project_quran_deployment]].
```

---

# FILE: MEMORY/reference_backend_cache_models.md

```
---
name: reference-backend-cache-models
description: Quran backend DB cache store cannot round-trip Eloquent models; cache raw attribute arrays and hydrate instead
metadata: 
  node_type: memory
  type: reference
  originSessionId: 9a7a49a2-efb2-44cd-b1dc-1447dacdfd0c
---

On the Quran Laravel backend (`CACHE_STORE=database`), caching Eloquent **models/collections** via `Cache::remember(...)` is broken: the value writes fine but reads back as `__PHP_Incomplete_Class`, so any service returning a typed `Collection` throws a `TypeError` on the **cache hit** (cache miss runs the closure and works, which masks the bug until an entry is both written and hit). Surfaces as the API's generic `{"success":false,"message":"Server error"}` 500 — the controller catches `\Throwable` and does NOT log, so `laravel.log` stays silent.

**Fix / pattern:** cache plain `->map->getAttributes()->all()` arrays and rebuild with `Model::hydrate($rows)`. Already used by `RecitationService`; `ReciterService` uses a try/catch + `Cache::forget` fallback. Applied to `CourseService` on 2026-06-23.

**Reusable helper (added 2026-06-25):** `App\Support\ModelCache` — `rememberMany()` / `remember()` cache a primitive snapshot (attributes + nested relations, fully object-free / serialize-safe) and **rehydrate real models with relations** on read, so API Resources keep working (getTranslations/iconUrl/whenLoaded/whenCounted). Unit-tested in `tests/Unit/Support/ModelCacheTest.php`.

**Fixed via ModelCache (2026-06-25):** `AdhkarService`, `TahsinatService`, `SponsorService`. `FeatureFlagService` was never broken — its repository already returns a plain `array`. NOTE: empirical test showed plain `serialize()` of these translatable models actually round-trips fine (no media/closures), so the original 500 cause is narrower than "all models"; ModelCache is store-agnostic regardless.

Part of [[project_quran]] / deployed via [[project_quran_deployment]].
```

---

# FILE: MEMORY/reference_mobile_dev_build.md

```
---
name: reference-mobile-dev-build
description: "Why local Metro edits don't appear on the device for the Quran mobile app, and how to actually see them"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 810b048d-50d7-46ed-be57-e7e8d0f6fcde
---

The Quran mobile app (`c:\Users\wael\Desktop\Quran\mobile`, Expo SDK 54) has a native **`android/` folder + `expo-updates` installed but NO `expo-dev-client`**. The app the user runs on the phone is a **standalone/prebuilt build** that loads its embedded (or OTA) JS bundle from `updates.url` (`u.expo.dev/efcf776d-...`) and **never connects to local Metro**. So local code edits — even an obvious debug banner — will NOT appear on that device no matter how many times Metro cache is cleared.

Confirmed troubleshooting: Metro running fresh from the correct dir (`expo start -c`) + on-disk source containing the changes is NOT enough; the device must actually load from Metro.

Ways to make local changes show up:
- **Expo Go (fastest):** with `expo start` running, press **`s`** in the Metro terminal to switch to "Expo Go" mode (the `android/` folder makes it default to dev-build QR), then scan the new `exp://` QR with the Expo Go app.
- **Rebuild dev build:** `npx expo run:android` (recompiles APK with current JS, connects to Metro).
- **OTA to the installed preview app:** `eas update --channel preview`, then relaunch the app twice.

Never start the dev server myself — see [[feedback_no_server_start]]. Related: [[project_quran]].
```

---

# FILE: MEMORY/reference_ssh_server.md

```
---
name: reference-ssh-server
description: SSH key and command for connecting to the Mashfa production server
metadata: 
  node_type: memory
  type: reference
  originSessionId: 5c5ff59b-bb88-4c46-ad35-51293c172c32
---

Production server SSH access:

```
ssh -i "C:\Users\wael\Downloads\id_ed25519_MashfaQurani_pro" -p 2222 root@185.55.243.191
```

⚠️ 2026-07-12: the key file `id_ed25519_MashfaQurani_pro` no longer exists in Downloads, and `C:\Users\wael\.ssh\id_ed25519_tkeys` is refused (Permission denied). Ask Wael where the Mashfa key now lives before attempting SSH.

To deploy after pushing to Azure:
```
bash /var/www/mashfa/app/deploy.sh
```

- App dir: `/var/www/mashfa/app`
- Branch: `master`
- Related: [[project-quran-deployment]]
```

---

# FILE: MEMORY/user_profile.md

```
---
name: user-profile
description: Wael — full-stack web + mobile app software engineer building a Quran app with Laravel backend and React Native frontend
metadata: 
  node_type: memory
  type: user
  originSessionId: f4785dd6-610b-441c-b1fc-f0a5f4f7389c
---

Name: **Wael**.

Software engineer working across full-stack web and mobile apps — comfortable with both Laravel (backend) and React Native (mobile frontend).

- Has already built and tested a working data-passing flow between Laravel and React Native locally.
- Now building a real Quran application, starting with the **Mushaf** (Quran text display) feature.
- Everything runs locally — no cloud deployment in scope for now.
- Has a written plan for the project (partially complete) and will share it incrementally.
- Working directory: `c:\Users\wael\Desktop\Quran`
```

---

# FILE: .claude/shared-context.md

```
# SHARED CONTEXT - QURANIC CLINIC

## ⚠ HIGHEST PRIORITY — READ FIRST
The rules in `.claude/prompt-rules.md` take precedence over EVERYTHING in this repo
(this file included). Read and obey them before doing any work.

## PROJECT IDENTITY
Name: Quranic Clinic (Al-Mashfa Al-Qurani)
Components: Backend (Laravel) + Mobile (React Native Expo)
Root Path: C:\Users\wael\Desktop\Quran
Database: MariaDB 10.4.32

## CURRENT DEVELOPMENT STATUS
The Mushaf feature is fully implemented and seeded. Development is ongoing.

## ⚠ GOOGLE AUTH — BYPASSED FOR DEVELOPMENT
Google OAuth is intentionally commented out in `mobile/app/_layout.tsx` so the app can be used without signing in during development.
- `RootLayoutNav` goes directly to `(tabs)` — no login redirect
- `AuthProvider` wrapper is kept so auth can be restored by un-commenting the guard inside `RootLayoutNav`
- **Do NOT re-enable auth** unless the user explicitly asks
- The login screen (`app/login.tsx`) exists but is unreachable while bypass is active

## ⚠ PRODUCTION / SERVER LIVE REFLECTION
Local edits are NOT live until shipped. See `.claude/server-production.md` for the full runbook.
- **Backend / CMS / API** (one Laravel app at https://mashfa.odooclick.com): push to Azure `master`, then run `bash /var/www/mashfa/app/deploy.sh` on the server. No build step.
- **Mobile**: a code change is live only after an **EAS Update** (JS-only) or a **new APK/AAB build** (native). The API base URL is fixed to production in `mobile/src/services/api.ts` via `app.json` → `extra.API_BASE_URL` — never hardcode a tunnel/localhost URL.
- **Do NOT** run `migrate:fresh` on production (it drops data); production uses additive `migrate --force`.

## ⚠ NO COMMENTS IN CODE
Do NOT add comments to code files (PHP, TS/TSX, Blade, etc.). Write self-explanatory code with clear names instead. This applies to docblocks, inline `//` / `#` notes, and `{{-- --}}` Blade comments alike.
- Exceptions (keep these): functional/tooling directives that change behavior — e.g. `// eslint-disable-*`, `@ts-expect-error`, PHPStan/Psalm annotations, `@var` hints required by tooling, and license/copyright headers where mandated.
- When editing an existing file, strip explanatory comments you encounter as part of the change.

## ⚠ FILE SIZE LIMIT
Max 450 lines per file. Migrations are exempt.
If a file exceeds 450 lines, split it into smaller files automatically — no permission needed. For Filament resources, split into separate Form, Table, and Actions files.
This is the single source of truth for the line limit. It is not repeated in any other plan file.

## ⚠ DATABASE MIGRATION RULE
When a table needs a column added, renamed, or removed, amend the existing create_*_table migration file directly.
Do NOT create a new migration file for any schema change.
After amending a migration, run: php artisan migrate:fresh --seed

## DIRECTORY STRUCTURE
C:\Users\wael\Desktop\Quran\
├── .claude/                    # Claude files ONLY here
│   ├── shared-context.md
│   ├── server-production.md     # Live deployment / update runbook (backend, CMS, API, APK)
│   ├── mobile/
│   │   └── CLAUDE.md           # Mobile-specific rules
│   └── backend/                # Backend instructions
│       ├── project.md
│       ├── rules.md
│       ├── scan-instructions.md
│       ├── phase-modes.md
│       ├── amendment-rules.md
│       ├── validation-checklist.md
│       ├── error-handling-patterns.md
│       ├── cache-strategy.md
│       ├── deployment-checklist.md
│       ├── phase-assignment.md
│       ├── system-prompt.md
│       ├── roles/
│       │   ├── parent.md
│       │   ├── researcher.md
│       │   ├── qa.md
│       │   ├── executor-laravel.md
│       │   ├── executor-filament.md
│       │   ├── executor-api.md
│       │   └── executor-security.md
│       ├── agents/
│       │   ├── database-architect.md
│       │   ├── repository-generator.md
│       │   ├── helper-generator.md
│       │   ├── service-generator.md
│       │   ├── model-generator.md
│       │   ├── filament-cms-builder.md
│       │   ├── api-engineer.md
│       │   ├── seeder-generator.md
│       │   └── security-auditor.md
│       ├── mcp/
│       │   ├── filesystem-config.json
│       │   ├── database-config.json
│       │   └── mcp-instructions.md
│       ├── messages/
│       │   ├── initial-message.md
│       │   └── phase-complete.md
│       └── prompts/
│           ├── phase-1-database.md
│           ├── phase-2-repositories.md
│           ├── phase-3-models-services.md
│           ├── phase-4-filament.md
│           ├── phase-5-api.md
│           └── phase-6-security.md
├── backend/                    # Laravel (Claude writes code here)
├── mobile/                     # React Native Expo
└── docs/                       # Documentation

## ⚠ RECORDING TYPES (SINGLE SOURCE OF TRUTH)
Every recording owner (category, subcategory, or disease) can have AT MOST TWO recordings:
- `summarized` (مختصرة) → ALWAYS FREE, playable by everyone including guests
- `detailed` (مطولة) → PAID, requires active subscription OR trial (trial: 7 days, max 2 per user)
Stored in `recordings.type` enum('summarized','detailed'), default 'summarized'. The old `is_free` column is REMOVED — free access is derived from `type = summarized` (Recording::isFreeSession()). One recording per type per owner, enforced at the model level (LogicException on save, surfaced as a validation error in Filament). Recordings still belong to exactly one of disease/subcategory/category — ownership and access-gating logic are otherwise unchanged. The API still returns `is_free` and `requires_subscription` (derived) plus the new `type` field.

## CATEGORY TYPES
- `standard`: Category → Subcategories → Diseases → Recordings (normal flow).
- `disease_direct`: Category → Diseases directly (no subcategory layer) → Recordings. Disease has `category_id` set, `subcategory_id` is null.
- `direct`: Category → Recordings directly (no diseases or subcategories). Used for general ruqyah playlists.
A category cannot mix types: having direct diseases blocks adding subcategories, and vice versa. This is enforced at the model level (LogicException on save).

## BACKEND TABLES
users, roles, permissions, model_has_roles, role_has_permissions, model_has_permissions, media, surahs, verses, categories, subcategories, diseases, disease_aliases, recordings, favorites, adhkar_categories, adhkar_items, adhkar_sections, tahsinat_categories, tahsinat_items, courses, sponsors, sponsor_screen_config, feedback, feature_flags, notification_preferences, push_notifications

## BACKEND API ENDPOINTS
POST /api/register, POST /api/login, POST /api/google, POST /api/logout, GET /api/me, GET /api/surahs, GET /api/surahs/{id}, GET /api/verses/search, GET /api/categories, GET /api/categories/{slug}, GET /api/subcategories/{slug}, GET /api/diseases, GET /api/diseases/{slug}, GET /api/diseases/search, GET /api/recordings, GET /api/recordings/{id}/stream, POST /api/recordings/{id}/play, POST /api/favorites/toggle, GET /api/favorites, GET /api/general-ruqyah, GET /api/adhkar/categories, GET /api/adhkar/categories/{slug}/items, GET /api/adhkar/today, GET /api/adhkar/waking, GET /api/tahsinat/categories, GET /api/tahsinat/categories/{slug}/items, GET /api/courses, GET /api/sponsors, GET /api/sponsor-screen, POST /api/feedback, GET /api/features, POST /api/notifications/preferences, GET /api/notifications/preferences, POST /api/notifications/token

## RESPONSE FORMAT
{ "success": true, "data": {}, "message": null, "meta": {}, "errors": null }

## HTTP STATUS CODES
200 Success, 201 Created, 400 Bad Request, 401 Unauthenticated, 403 Forbidden, 404 Not Found, 422 Validation Error, 429 Too Many Requests, 500 Server Error

## RATE LIMITING
60 requests per minute
```

---

# FILE: .claude/server-production.md

```
# SERVER PRODUCTION — LIVE REFLECTION GUIDE

Single source of truth for how local changes reach the **live** environment for every
component: backend, CMS, API, and the mobile app. Referenced from `shared-context.md`.

---

## 1. PRODUCTION INFRASTRUCTURE

| Item | Value |
|---|---|
| Server | Ubuntu 24.04 — `ssh -i <key> -p 2222 root@185.55.243.191` |
| SSH key | `id_ed25519_MashfaQurani_pro` |
| Domain | https://mashfa.odooclick.com (Let's Encrypt SSL via Certbot, Nginx) |
| Backend path | `/var/www/mashfa/app` (git repo, `origin` = Azure DevOps `Core-Click/Almashfa`) |
| Web root | `/var/www/mashfa/app/public` (Nginx → PHP-FPM 8.4 socket) |
| Stack | PHP **8.4** (ondrej PPA — Symfony 8 needs 8.4), Composer, MySQL 8 |
| Database | `quranic_clinic`, user `quranic`@localhost (password in app `.env` + `/root/.mashfa_dbpass`) |
| CMS | Filament at `/admin` (admin: `admin@quran.local`) |
| Code repos | Backend → Azure `Almashfa` (branch `master`); Mobile → local git repo (EAS builds) |

The **backend, CMS, and API are one Laravel app** — deploying the backend updates all three at once.

---

## 2. THE GENERAL RULE — SERVER LIVE REFLECTION

> A change is only "live" once it is **(a) committed, (b) shipped to the server, and (c) the
> server has rebuilt its caches / the client has the new bundle.** Editing local files alone
> never changes production.

- **Backend / CMS / API** → push to Azure, then run `deploy.sh` on the server. Code is interpreted, so the change is live immediately after `git pull` + cache rebuild + FPM reload. **No build step.**
- **Mobile app** → JS lives inside an installed binary. A code change is live only after either an **OTA update** (JS-only) or a **new APK/AAB build** (native changes). **There is a build step.**

Whenever you change config that affects the live app (API URL, env, Nginx, `.env`), update both the running config **and** this doc.

---

## 3. BACKEND / CMS / API — UPDATE FLOW (no build)

Your loop, every time you change backend code:

```powershell
# 1. LOCAL — commit & push your changes to Azure
cd C:\Users\wael\Desktop\Quran\backend
git add -A
git commit -m "..."
git push origin master
```

```bash
# 2. SERVER — pull & apply (one command)
ssh -i C:\Users\wael\Downloads\id_ed25519_MashfaQurani_pro -p 2222 root@185.55.243.191
bash /var/www/mashfa/app/deploy.sh
```

`deploy.sh` does: `git pull` → `composer install --no-dev` → `migrate --force` →
`config/route/view:cache` → fix permissions → reload PHP-FPM.

### Auth for `git pull` on the server
The server uses git's credential **store** so pulls are non-interactive. The Azure PAT is saved
at `/root/.git-credentials` (chmod 600). To rotate the token:

```bash
git config --global credential.helper store
printf 'https://Core-Click:<NEW_PAT>@dev.azure.com\n' > /root/.git-credentials
chmod 600 /root/.git-credentials
```
PAT scope needed: **Code → Read**. Create at https://dev.azure.com/Core-Click/_usersSettings/tokens.

### ⚠ Migrations on production
The dev rule "amend the original migration + `migrate:fresh`" **must NOT be used on production** —
`migrate:fresh` **drops all data**. On production, `deploy.sh` runs `migrate --force`, which only
applies *new* migration files. For a schema change that must reach production without data loss,
add a dedicated migration file for it.

---

## 4. MOBILE APP — UPDATE FLOW (build step)

The app's API base URL is resolved in `mobile/src/services/api.ts` → `getApiUrl()`, which reads
`app.json` → `expo.extra.API_BASE_URL` (**= https://mashfa.odooclick.com/api**). Never hardcode a
tunnel/localhost URL there again.

### Do I need a new APK every time? — Two cases
- **JS / TS / asset only** (screens, logic, styles, strings): can ship as an **OTA update** — no rebuild, testers get it on next app launch. *(Requires EAS Update set up once — see §4.2.)*
- **Native change** (new native module, app.json plugins, permissions, icon/splash, SDK bump): **must build a new APK/AAB**.

### 4.1 Build a new APK (from the server — local network blocks EAS uploads)
The local machine cannot reach EAS over IPv4; builds are launched from the server instead.

```bash
# LOCAL — package the committed mobile source and ship it to the server
cd C:\Users\wael\Desktop\Quran\mobile
git add -A && git commit -m "..."
git archive --format=tar.gz -o C:/Users/wael/Downloads/mobile-build.tgz HEAD
scp -i <key> -P 2222 C:/Users/wael/Downloads/mobile-build.tgz root@185.55.243.191:/root/mobile-build.tgz

# SERVER — extract over the existing build dir (keeps node_modules) and build
ssh -i <key> -p 2222 root@185.55.243.191
cd /root/mobile-build && tar xzf /root/mobile-build.tgz
export EXPO_TOKEN='<expo-access-token>'   # https://expo.dev/settings/access-tokens
export EAS_NO_VCS=1
npx eas-cli build --platform android --profile preview --non-interactive --no-wait
# poll:  npx eas-cli build:view <id>   → "Application Archive URL" is the .apk link
```

- Profile `preview` → installable **APK** (`eas.json`). Profile `production` → **AAB** for Play Store.
- First run on a clean server also needs `npm install` once inside `/root/mobile-build`.
- Distribute the `Application Archive URL` (`https://expo.dev/artifacts/eas/<id>.apk`) to testers.
- EAS project: `@wael_hamwi/quranic-clinic`.

### 4.2 OTA updates (recommended next step — skip rebuilds for JS changes)
Set up once: `npx eas-cli update:configure` (adds `expo-updates`), then rebuild **one** APK that
contains the updates runtime. After that, JS-only changes ship with:
`eas update --branch preview --message "..."` — no new APK, testers get it on relaunch.

---

## 5. QUICK REFERENCE

| Change type | Action | Live when |
|---|---|---|
| Backend code / API / CMS | push to Azure → `deploy.sh` | after FPM reload |
| Backend `.env` | edit on server → `php artisan config:cache` + reload FPM | immediately |
| Nginx config | edit → `nginx -t && systemctl reload nginx` | immediately |
| Mobile JS/asset (with EAS Update) | `eas update` | next app launch |
| Mobile JS/asset (no EAS Update) | rebuild APK (§4.1) | after reinstall |
| Mobile native change | rebuild APK/AAB (§4.1) | after reinstall |
```

---

# FILE: .claude/settings.json

```
{
  "permissions": {
    "allow": [
      "Bash(node -e ' *)",
      "mcp__figma__get_design_context",
      "mcp__figma__get_metadata",
      "mcp__figma__get_screenshot",
      "mcp__figma__get_variable_defs",
      "Bash(dir \"c:\\\\Users\\\\wael\\\\Desktop\\\\Quran\\\\mobile\\\\src\\\\components\")",
      "Read(//c/temp/**)",
      "Bash(php -r \"echo 'upload_max_filesize: ' . ini_get\\('upload_max_filesize'\\) . PHP_EOL; echo 'post_max_size: ' . ini_get\\('post_max_size'\\) . PHP_EOL; echo 'memory_limit: ' . ini_get\\('memory_limit'\\) . PHP_EOL; echo 'max_execution_time: ' . ini_get\\('max_execution_time'\\) . PHP_EOL;\")",
      "Bash(php -r \"echo php_ini_loaded_file\\(\\) . PHP_EOL; echo php_ini_scanned_files\\(\\) . PHP_EOL;\")",
      "Bash(Select-String -Path \"C:\\\\php\\\\php.ini\" -Pattern \"upload_max_filesize|post_max_size\")",
      "Bash(Select-Object -First 10)",
      "Bash(grep -n \"upload_max_filesize\\\\|post_max_size\" /c/php/php.ini)",
      "Read(//c/php/**)",
      "Bash(findstr \"\\\\\"version\\\\\"\")",
      "Bash(scp -i \"C:/Users/wael/Downloads/id_ed25519_MashfaQurani_pro\" -P 2222 -o BatchMode=yes \"c:/Users/wael/Desktop/Quran/backend/deploy/nginx-mashfa.conf\" root@185.55.243.191:/etc/nginx/sites-available/mashfa)",
      "Bash(ssh -i \"C:/Users/wael/Downloads/id_ed25519_MashfaQurani_pro\" -o BatchMode=yes -p 2222 root@185.55.243.191 \"nginx -t 2>&1 && systemctl reload nginx && echo 'NGINX_RELOADED'\")",
      "Bash(npx eas-cli *)",
      "Bash(curl -s \"https://mashfa.odooclick.com/api/categories\" -H \"Accept: application/json\")",
      "Bash(python3 -c \"import sys,json; d=json.load\\(sys.stdin\\); [print\\(c['name'], c.get\\('subcategories_count'\\), c.get\\('recordings_count'\\)\\) for c in d['data']]\")"
    ],
    "additionalDirectories": [
      "C:\\php"
    ]
  }
}
```

---

# FILE: .claude/settings.local.json

```
{
  "permissions": {
    "allow": [
      "PowerShell(Get-Command claude.cmd, claude.exe, claude.ps1 -ErrorAction SilentlyContinue)",
      "mcp__figma__get_metadata",
      "mcp__figma__get_design_context",
      "mcp__figma__get_screenshot",
      "Bash(Select-String \"CLAUDE\")",
      "Bash(xargs grep -l \"reader\\\\|Reader\\\\|mushaf\\\\|Mushaf\\\\|SurahReader\\\\|ReaderScreen\")",
      "Bash(xargs grep -l \"ReaderScreen\\\\|MushafScreen\\\\|SurahScreen\\\\|VerseList\\\\|verseArabic\\\\|reader\\\\.styles\")",
      "Bash(Get-ChildItem -Path \"c:\\\\Users\\\\wael\\\\Desktop\\\\Quran\\\\mobile\" -Recurse -Directory)",
      "Bash(Select-Object -ExpandProperty FullName)",
      "Bash(node -e ' *)",
      "Read(//c/Users/wael/AppData/Local/Temp/**)",
      "Bash(echo \"exit $?\")",
      "Bash(grep -E '\\(^|/\\)\\(\\\\.env|eas\\\\.json|app\\\\.json\\)$')",
      "Bash(curl -s -o /dev/null -w \"expo api: HTTP %{http_code}, time %{time_total}s\\\\n\" --max-time 20 https://api.expo.dev/graphql)",
      "Bash(curl -s -o /dev/null -w \"expo home: HTTP %{http_code}, time %{time_total}s\\\\n\" --max-time 20 https://expo.dev)",
      "Bash(curl -s -o /dev/null -w \"google: HTTP %{http_code}\\\\n\" --max-time 20 https://www.google.com)",
      "Bash(eas whoami *)",
      "Bash(ssh -i \"C:/Users/wael/Downloads/id_ed25519_MashfaQurani_pro\" -o BatchMode=yes -p 2222 root@185.55.243.191 *)",
      "Bash(ipconfig)",
      "Bash(ssh -i \"C:/Users/wael/Downloads/id_ed25519_MashfaQurani_pro\" -o BatchMode=yes -p 2222 root@185.55.243.191 \"cd /root/mobile-build && echo '===== app.json =====' && cat app.json && echo '===== eas.json =====' && cat eas.json && echo '===== expo-updates version =====' && grep 'expo-updates' package.json\")",
      "Skill(update-config)",
      "Skill(update-config:*)"
    ],
    "additionalDirectories": [
      "C:\\Users\\wael"
    ]
  }
}
```

---

# FILE: .claude/backend/agents/api-engineer.md

```
# API ENDPOINT DESIGNER

TRAIT: ApiResponse (success, error, executeWithTryCatch)

CONTROLLERS:
AuthController, CategoryController, SubcategoryController, DiseaseController, RecordingController, FavoriteController, AdhkarController, TahsinatController, CourseController, SponsorController, FeedbackController, FeatureFlagController, NotificationController, SubscriptionController

AUTH ENDPOINTS:
POST /api/register, POST /api/login, POST /api/google, POST /api/logout, GET /api/me

QURAN ENDPOINTS:
GET /api/surahs, GET /api/surahs/{id}, GET /api/verses/search

HOSPITAL ENDPOINTS:
GET /api/categories, GET /api/categories/{slug}, GET /api/subcategories/{slug}, GET /api/diseases, GET /api/diseases/{slug}, GET /api/diseases/search, GET /api/recordings, GET /api/recordings/{id}/stream, POST /api/recordings/{id}/play, POST /api/favorites/toggle, GET /api/favorites, GET /api/general-ruqyah

ADHKAR ENDPOINTS:
GET /api/adhkar/categories, GET /api/adhkar/categories/{slug}/items, GET /api/adhkar/today, GET /api/adhkar/waking

TAHSINAT ENDPOINTS:
GET /api/tahsinat/categories, GET /api/tahsinat/categories/{slug}/items

COURSES: GET /api/courses
SPONSORS: GET /api/sponsors, GET /api/sponsor-screen
FEEDBACK: POST /api/feedback
FEATURES: GET /api/features
NOTIFICATIONS: POST /api/notifications/preferences, GET /api/notifications/preferences, POST /api/notifications/token

RATE LIMITING: 60 requests per minute
OUTPUT: ```php <?php [code with no comments] ```
```

---

# FILE: .claude/backend/agents/database-architect.md

```
# DATABASE SCHEMA DESIGNER

MIGRATION 1: users - id,name,email(u),phone(u),country,gender,google_id(null),is_subscribed(0),subscription_expires_at(null),trial_used_count(0),last_active_at(null),password,remember_token,ts,softDeletes

MIGRATION 2-7: roles,permissions,model_has_roles,role_has_permissions,model_has_permissions,media

MIGRATION 8: surahs - id,name,transliteration,type,total_verses,ts

MIGRATION 9: verses - id,surah_id(fk),verse_number,text_uthmani,ts

MIGRATION 10: categories - id,name,slug,icon,display_order,is_active,softDeletes,ts

MIGRATION 11: subcategories - id,category_id(fk),name,slug,display_order,is_active,softDeletes,ts

MIGRATION 12: diseases - id,subcategory_id(fk),name,slug,description,is_general(0),display_order,is_active,softDeletes,ts

MIGRATION 13: disease_aliases - id,disease_id(fk),alias,ts

MIGRATION 14: recordings - id,disease_id(fk),session_number,title,audio_path,duration_seconds,type(enum summarized|detailed, default summarized),plays_count(0),created_by(fk),softDeletes,ts

MIGRATION 15: favorites - id,user_id(fk),disease_id(fk),ts,UNIQUE(user_id,disease_id)

MIGRATION 16: adhkar_categories - id,name,slug,day_number,display_order,is_active,ts

MIGRATION 17: adhkar_items - id,category_id(fk),text,repetitions,daleel,is_for_morning(0),is_for_evening(0),is_for_sleep(0),is_for_waking(0),display_order,ts

MIGRATION 18: adhkar_sections - id,name,adhkar_category_id,display_order,ts

MIGRATION 19: tahsinat_categories - id,name,is_self(0),is_for_others(0),random_order(0),display_order,is_active,ts

MIGRATION 20: tahsinat_items - id,category_id(fk),label,text,repetitions,hint,display_order,ts

MIGRATION 21: courses - id,title,description,instructor_name,price,start_date,whatsapp_link,is_coming_soon(0),is_active,display_order,ts

MIGRATION 22: sponsors - id,name,logo_path,website_url,target_countries,target_genders,is_featured(0),display_on_launch(0),display_order,is_active,ts

MIGRATION 23: sponsor_screen_config - id,is_enabled(1),display_duration_seconds(3),selected_sponsor_id,ts

MIGRATION 24: feedback - id,user_id(fk),service_type,service_id,was_beneficial,likes,dislikes,comment,ts

MIGRATION 25: feature_flags - id,feature_key,is_visible(1),ts

MIGRATION 26: notification_preferences - id,user_id(fk),adhkar_morning_enabled(1),adhkar_evening_enabled(1),adhkar_sleep_enabled(1),adhkar_waking_enabled(1),waking_start_time,waking_end_time,ts

MIGRATION 27: push_notifications - id,user_id(fk),title,body,type,data,read_at,sent_at,ts
```

---

# FILE: .claude/backend/agents/filament-cms-builder.md

```
# FILAMENT 5 CMS DESIGNER

REUSABLE TRAITS:
ReusableFormFields: getNameFields, getActiveToggle, getDisplayOrderField
ReusableTableColumns: getNameColumns, getActiveIconColumn, getDisplayOrderColumn

RESOURCES:
UserResource (Super Admin only)
CategoryResource (Admin only)
SubcategoryResource (Admin only)
DiseaseResource (Admin only) - with is_general checkbox, aliases management
RecordingResource (Admin only) - session_number, type (summarized=free / detailed=paid, max one of each per owner)
FavoriteResource (Admin only, read-only)
AdhkarCategoryResource (Admin only)
AdhkarItemResource (Admin only) - morning/evening/sleep/waking flags
TahsinatCategoryResource (Admin only) - self/others, random_order
TahsinatItemResource (Admin only)
CourseResource (Admin only) - is_coming_soon toggle
SponsorResource (Admin only) - logo upload, display_on_launch
FeedbackResource (Admin only, read-only) - filter by was_beneficial
FeatureFlagResource (Admin only) - toggle feature visibility

PAGES: StatisticsDashboard
WIDGETS: StatsOverviewWidget, FeedbackChartWidget, ExpiringSubscriptionsWidget, PopularDiseasesWidget

OUTPUT: ```php <?php [code with no comments] ```
```

---

# FILE: .claude/backend/agents/helper-generator.md

```
# HELPER FUNCTIONS DESIGNER

FILE: app/Helpers/Helpers.php

FUNCTIONS:
formatDuration($seconds) -> MM:SS or HH:MM:SS
generateSignedUrl($filePath, $expiryMinutes) -> signed URL
getPaginationMeta($paginator) -> pagination meta array
canAccessRecording($user, $recording) -> business rule check
hasActiveTrial($user) -> checks trial_used_count and subscription_expires_at
grantTrial($user) -> increments trial_used_count, sets subscription_expires_at +7 days
highlightSearchTerm($text, $query) -> highlighted text
logBuildMessage($message, $level) -> logs to build channel

AUTOLOAD: composer.json: "autoload": { "files": ["app/Helpers/Helpers.php"] }
```

---

# FILE: .claude/backend/agents/model-generator.md

```
# ELOQUENT MODEL DESIGNER

USER: app/Models/User.php - HasApiTokens, SoftDeletes, HasRoles
Methods: isSubscribed(), isSuperAdmin(), isAdmin(), hasActiveTrial(), canGrantTrial(), grantTrial()
Relations: belongsToMany(Disease::class, 'favorites'), hasMany(Feedback::class), hasOne(NotificationPreference::class)

CATEGORY: app/Models/Category.php - SoftDeletes
Relations: hasMany(Subcategory::class)

SUBCATEGORY: app/Models/Subcategory.php - SoftDeletes
Relations: belongsTo(Category::class), hasMany(Disease::class)

DISEASE: app/Models/Disease.php - SoftDeletes
Relations: belongsTo(Subcategory::class), hasMany(Recording::class), belongsToMany(User::class, 'favorites')
Methods: isGeneral(), getAliasesAttribute()

RECORDING: app/Models/Recording.php - SoftDeletes
Relations: belongsTo(Disease::class), belongsTo(User::class, 'created_by')
Scopes: free(session=1), premium(session>1)
Methods: canBeAccessedBy(User $user), getStreamUrl()

FAVORITE: app/Models/Favorite.php
Relations: belongsTo(User::class), belongsTo(Disease::class)
Methods: toggle($userId, $diseaseId) - uses firstOrCreate

ADHKAR_ITEM: app/Models/AdhkarItem.php
Relations: belongsTo(AdhkarCategory::class)
Scopes: morning(), evening(), sleep(), waking()

TAHSINAT_ITEM: app/Models/TahsinatItem.php
Relations: belongsTo(TahsinatCategory::class)
Scopes: self(), forOthers()

COURSE: app/Models/Course.php - SoftDeletes
$fillable: title, description, instructor_name, price, start_date, whatsapp_link, is_coming_soon, is_active, display_order

SPONSOR: app/Models/Sponsor.php - SoftDeletes
$fillable: name, logo_path, website_url, target_countries, target_genders, is_featured, display_on_launch, display_order, is_active

SPONSOR_SCREEN_CONFIG: app/Models/SponsorScreenConfig.php
$fillable: is_enabled, display_duration_seconds, selected_sponsor_id

FEEDBACK: app/Models/Feedback.php
$fillable: user_id, service_type, service_id, was_beneficial, likes, dislikes, comment

FEATURE_FLAG: app/Models/FeatureFlag.php
$fillable: feature_key, is_visible

NOTIFICATION_PREFERENCE: app/Models/NotificationPreference.php
$fillable: user_id, adhkar_morning_enabled, adhkar_evening_enabled, adhkar_sleep_enabled, adhkar_waking_enabled, waking_start_time, waking_end_time
```

---

# FILE: .claude/backend/agents/repository-generator.md

```
# REPOSITORY PATTERN DESIGNER

BASE REPOSITORY INTERFACE: RepositoryInterface.php
Methods: all, paginate, findById, findBySlug, create, update, delete, with, withCount

BASE REPOSITORY: BaseRepository.php
Properties: $model, $with = [], $withCount = []

SURAH REPOSITORY: getAllSurahs(), getSurahWithVerses($id)
VERSE REPOSITORY: getVersesBySurah($surahId), searchVerses($query)
CATEGORY REPOSITORY: getHierarchy(), getSubcategories($categoryId)
SUBCATEGORY REPOSITORY: getDiseases($subcategoryId)
DISEASE REPOSITORY: getBySubcategory($subcategoryId), searchByAlias($query), getGeneralRuqyah()
RECORDING REPOSITORY: getByDisease($diseaseId), getFree(), getPremium(), incrementPlaysCount(), canAccess($user, $recording)
FAVORITE REPOSITORY: getByUser($userId), toggle($userId, $diseaseId), isFavorited($userId, $diseaseId)
ADHKAR REPOSITORY: getTodayAdhkar(), getWakingAdhkar()
TAHSINAT REPOSITORY: getSelfTahsinat(), getForOthersTahsinat()
FEATURE_FLAG REPOSITORY: getVisibleFeatures()
NOTIFICATION_REPOSITORY: getPreferences($userId), updatePreferences($userId, $data)

REPOSITORY SERVICE PROVIDER: RepositoryServiceProvider.php
```

---

# FILE: .claude/backend/agents/security-auditor.md

```
# SECURITY AUDITOR

SCOPE: Diseases, Recordings, Favorites, Categories, Users

POLICIES:
DiseasePolicy: view(true), manage(admin or super_admin)
RecordingPolicy: view(true), stream(recording), favorite(logged in)
FavoritePolicy: manage(owner only)
CategoryPolicy: manage(admin or super_admin)
UserPolicy: viewAny(super_admin only), delete(super_admin only)

RECORDING POLICY STREAM METHOD:
public function stream(User $user, Recording $recording)
{
    if ($recording->type === 'summarized') { return true; }
    if ($user->is_subscribed || $user->hasActiveTrial()) { return true; }
    if ($user->canGrantTrial()) { $user->grantTrial(); return true; }
    return false;
}

MIDDLEWARE:
SetLocale: Accept-Language header
CheckSubscription: premium routes require active subscription
LogUserActivity: update last_active_at once per hour

CONFIGURATIONS:
sanctum.php: expiration = 1440
cors.php: allowed_origins = mobile app URL
Kernel.php: register middleware

SPATIE PERMISSION SEEDER:
Roles: super_admin, admin, regular_user
Permissions: view_users, manage_categories, manage_diseases, manage_recordings, manage_favorites, manage_sponsors, manage_adhkar, manage_tahsinat, manage_courses, manage_feature_flags

SECURITY AUDIT COMMANDS:
grep -r "DB::raw" app/ --exclude-dir=vendor
grep -r "../mobile/" app/ --exclude-dir=vendor

OUTPUT: ```php <?php [code with no comments] ```
```

---

# FILE: .claude/backend/agents/seeder-generator.md

```
# SEEDER DESIGNER

QURAN SEEDER: QuranSeeder.php
SOURCE: https://cdn.jsdelivr.net/npm/quran-cloud@1.0.0/dist/quran.json
IMPLEMENTATION: fetch JSON, parse 114 surahs, insert into surahs, loop verses insert into verses (6,236 total)

DISEASE_SEEDER: inserts categories, subcategories, diseases, disease_aliases, recordings (1st, 2nd, 3rd sessions)

ADHKAR_SEEDER: inserts adhkar_categories (Morning, Evening, Sleep, Waking), adhkar_items with repetitions and daleel

TAHSINAT_SEEDER: inserts tahsinat_categories (Self, Others), tahsinat_items with labels, text, repetitions, hints

SPONSOR_SEEDER: inserts sponsors with logos, sponsor_screen_config

FEATURE_FLAG_SEEDER: inserts feature_flags for all top-level features (hospital, adhkar, tahsinat, mushaf, courses, ask_me)

RUN COMMAND: php artisan db:seed --class=QuranSeeder && php artisan db:seed --class=DiseaseSeeder && php artisan db:seed --class=AdhkarSeeder && php artisan db:seed --class=TahsinatSeeder && php artisan db:seed --class=SponsorSeeder && php artisan db:seed --class=FeatureFlagSeeder

OUTPUT: ```php <?php [code with no comments] ```
```

---

# FILE: .claude/backend/agents/service-generator.md

```
# SERVICE LAYER DESIGNER

BASESERVICE: executeInTransaction(callable)

CATEGORY_SERVICE: getHierarchy(Cache TTL 300), getBySlug
DISEASE_SERVICE: getBySubcategory, searchByAlias, getGeneralRuqyah
RECORDING_SERVICE: getByDisease, getStreamUrl (uses canAccessRecording), incrementPlays
FAVORITE_SERVICE: toggle (uses firstOrCreate), getUserFavorites
ADHKAR_SERVICE: getCategories, getItemsByCategory, getToday, getWaking
TAHSINAT_SERVICE: getSelf, getForOthers
COURSE_SERVICE: getAll
SPONSOR_SERVICE: getAll, getSponsorScreen
FEEDBACK_SERVICE: store
FEATURE_FLAG_SERVICE: getVisibleFeatures
NOTIFICATION_SERVICE: getPreferences, updatePreferences, sendPushNotification
TRIAL_SERVICE: canGrantTrial, grantSevenDayTrial, getRemainingTrialDays, hasActiveTrial
SUBSCRIPTION_SERVICE: getStatus
GOOGLE_AUTH_SERVICE: verifyToken, findOrCreateUser, generateSanctumToken
```

---

# FILE: .claude/backend/amendment-rules.md

```
# AMENDMENT RULES

DELETION PROTOCOL (MANDATORY):
1. Parent: "Found [file]. User, may I remove it? (YES/NO)"
2. Wait for user response
3. If YES: Executor removes file
4. If NO: Preserve file
5. NEVER delete without approval

DEBUG PROCESS:
1. Analyze root cause
2. Document in log
3. Propose solution to Parent
4. Parent approves
5. No blind fixes

LOGGING: Log each attempt with role, log analysis before implementation, log success or failure

PARALLEL AMENDMENTS: 3 workers, 75% consensus required
```

---

# FILE: .claude/backend/cache-strategy.md

```
# CACHE STRATEGY

CACHED ENDPOINTS:
GET /api/categories: TTL 300s, tags ['hierarchy']
GET /api/adhkar/today: TTL 300s
GET /api/features: TTL 300s
GET /api/sponsor-screen: TTL 300s

NOT CACHED:
User-specific endpoints (favorites, notifications), POST/PUT/DELETE

BACKEND CACHE PATTERN:
For Eloquent data, use App\Support\ModelCache ONLY — see caching.md (MANDATORY).
ModelCache::rememberMany($key, 300, fn() => $this->repository->findAll());
Never cache live models directly (500s on cache hit). Plain scalars/arrays may
use Cache::remember directly.

BACKEND INVALIDATION PATTERN:
protected static function booted()
{
    static::saved(function () {
        Cache::tags(['hierarchy'])->flush();
        Cache::tags(['features'])->flush();
    });
}

PARALLEL CACHE WARMING: Fan-out to 4 workers
```

---

# FILE: .claude/backend/caching.md

```
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
```

---

# FILE: .claude/backend/deployment-checklist.md

```
# DEPLOYMENT CHECKLIST

ENVIRONMENT:
- APP_ENV=production, APP_DEBUG=false

OPTIMIZATION:
- php artisan config:cache, route:cache, view:cache, storage:link

SECURITY:
- Rate limiting (60/min), Sanctum expiry 24h, CORS for mobile, no web routes

CACHE:
- Cache driver configured (redis recommended)

CODE QUALITY:
- No inline comments, no deletions without approval

INTEGRITY:
- ../mobile/ untouched, favorites.disease_id, is_general flag, search aliases
```

---

# FILE: .claude/backend/error-handling-patterns.md

```
# ERROR HANDLING PATTERNS

CONTROLLER PATTERN:
try {
    return $this->success($result);
} catch (ModelNotFoundException $e) {
    Log::channel('build')->error('Not found', ['exception' => $e]);
    return $this->error('Not found', 404);
} catch (ValidationException $e) {
    Log::channel('build')->error('Validation failed', ['errors' => $e->errors()]);
    return $this->error('Validation failed', 422, $e->errors());
} catch (AuthorizationException $e) {
    Log::channel('build')->error('Unauthorized', ['exception' => $e]);
    return $this->error('Unauthorized', 403);
} catch (QueryException $e) {
    if ($e->errorInfo[1] == 1062) { return $this->error('Already exists', 409); }
    Log::channel('build')->error('Database error', ['exception' => $e]);
    return $this->error('Database error', 500);
} catch (Throwable $e) {
    Log::channel('build')->error('Server error', ['exception' => $e]);
    return $this->error('Server error', 500);
}

SERVICE TRANSACTION PATTERN:
DB::transaction(function() use ($data) {
    Log::channel('build')->info('Transaction started');
    $result = $this->repository->create($data);
    Log::channel('build')->info('Transaction completed');
    return $result;
}, 3);

DELETION ERROR:
Awaiting user response for [file] deletion
User declined deletion, preserving [file]
```

---

# FILE: .claude/backend/mcp/database-config.json

```
{
  "mcpServers": {
    "database": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-mysql"],
      "env": {
        "MYSQL_HOST": "127.0.0.1",
        "MYSQL_PORT": "3306",
        "MYSQL_USER": "homestead",
        "MYSQL_PASSWORD": "secret",
        "MYSQL_DATABASE": "quranic_clinic"
      }
    }
  }
}
```

---

# FILE: .claude/backend/mcp/filesystem-config.json

```
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "C:/Users/wael/Desktop/Quran/backend"],
      "env": {
        "ALLOWED_PATHS": "C:/Users/wael/Desktop/Quran/backend/app,C:/Users/wael/Desktop/Quran/backend/database,C:/Users/wael/Desktop/Quran/backend/routes,C:/Users/wael/Desktop/Quran/backend/tests,C:/Users/wael/Desktop/Quran/backend/config,C:/Users/wael/Desktop/Quran/backend/storage/logs"
      }
    }
  }
}
```

---

# FILE: .claude/backend/mcp/mcp-instructions.md

```
# MCP INSTRUCTIONS - QURAN ONLY

FILESYSTEM MCP:
- Write all generated files directly to C:/Users/wael/Desktop/Quran/backend
- Never ask user to create files manually
- Log all file operations to build.log
- NEVER read or write to ../mobile/ directory

DATABASE MCP:
- After Phase 1: Verify 9 tables exist
- Verify surahs table exists
- Verify verses table exists

BROWSER MCP:
- After Phase 5: Test GET /api/surahs
- After Phase 5: Test GET /api/surahs/1
- After Phase 5: Test GET /api/verses/search?q=الله

CODE QUALITY MCP:
- Verify no inline comments
- Verify ../mobile/ never accessed
- Verify QURAN ONLY - no other features

SCAN MCP:
- Execute all scan commands in scan-instructions.md
- Save scan results to build.log
- Do NOT proceed to Phase 1 until scan completes
```

---

# FILE: .claude/backend/messages/initial-message.md

```
# INITIAL MESSAGE TO CLAUDE

Read all files in order from .claude/backend/

MANDATORY FIRST STEP - PROJECT SCAN:
1. Read .claude/backend/scan-instructions.md
2. Execute ALL scan commands
3. Produce PROJECT SCAN REPORT
4. Log all findings
5. Confirm ../mobile/ directory IGNORED

Only after scan complete, say:
"BACKEND PROJECT SCAN COMPLETE. ../mobile/ IGNORED. Ready for Phase 1."

CRITICAL RULES:
- SCAN FIRST, IGNORE ../mobile/
- No inline comments, Debug-first, Read before modifying
- Never delete without user approval
- Recordings belong to deepest level (Disease > Subcategory > Category)
- Recording types: summarized (مختصرة) free, detailed (مطولة) requires subscription/trial, max one of each per owner, trial max 2 (see ../../shared-context.md → RECORDING TYPES)
- Favorites store disease_id, General ruqyah flag

Then user will say "Execute Phase 1. Create migration 1" and respond "✓ Next" after each file.
```

---

# FILE: .claude/backend/messages/phase-complete.md

```
# PHASE COMPLETION TEMPLATE

COMMANDS:
- "✓ Next" → Create next file
- "PHASE X complete. Proceed to Phase X+1" → Run verification, start next phase

BEFORE EACH PHASE:
- SCAN existing relevant directories (Researcher)
- Report findings to Parent, confirm no conflicts, confirm ../mobile/ not in scope

ON FAILURE:
1. Researcher SCANs relevant files (DEBUG mode)
2. Analyzes root cause, documents analysis
3. Parent reviews and approves
4. Executor fixes
5. QA re-validates, checks regression, confirms ../mobile/ untouched
6. If debate fails: stop execution

PHASE COMPLETION LOG:
[YYYY-MM-DD HH:MM:SS] [PARENT] [PHASE X] [COMPLETE] Phase X finished
[YYYY-MM-DD HH:MM:SS] [QA] [PHASE X] [VERIFICATION] No inline comments
[YYYY-MM-DD HH:MM:SS] [QA] [PHASE X] [VERIFICATION] ../mobile/ untouched
```

---

# FILE: .claude/backend/phase-assignment.md

```
# PHASE ASSIGNMENT

PHASE 0: Backend Scan - SCAN - Researcher, Parent

PHASE 1: Database Migrations - EXECUTION - Laravel Expert - 4 workers

PHASE 2: Repositories - EXECUTION - Laravel Expert - 3 workers

PHASE 3: Models + Services + Tests + Seeders - EXECUTION - Laravel Expert - 5 workers

PHASE 4: Filament CMS - EXECUTION - Filament Expert - 4 workers

PHASE 5: API Controllers - EXECUTION - API Engineer - 4 workers

PHASE 6: Security + Middleware - EXECUTION - Security Expert - 3 workers
```

---

# FILE: .claude/backend/phase-modes.md

```
# PHASE MODES

SCAN: Read existing structure - NO code
DETECTIVE: Analyze, validate, research - NO code
PLAN: Design architecture - NO code
BYPASS: Skip phase - NO code
EXECUTION: Write code - YES code
DEBUG: Analyze root cause before fix - NO code
SPLIT: Split a file into multiple files - YES code

## PHASE ASSIGNMENT
Phase 0: Backend Scan - SCAN - Researcher, Parent

Phase 1: Database Migrations - EXECUTION - Laravel Expert - 4 workers

Phase 2: Repositories - EXECUTION - Laravel Expert - 3 workers

Phase 3: Models + Services + Tests + Seeders - EXECUTION - Laravel Expert - 5 workers

Phase 4: Filament CMS - EXECUTION - Filament Expert - 4 workers

Phase 5: API Controllers - EXECUTION - API Engineer - 4 workers

Phase 6: Security + Middleware - EXECUTION - Security Expert - 3 workers
```

---

# FILE: .claude/backend/project.md

```
# QURANIC CLINIC BACKEND

## PROJECT IDENTITY
Path: C:\Users\wael\Desktop\Quran\backend
Stack: Laravel 13 + Filament 5 + MySQL 8.0
PHP: 8.4.6
Mode: DEVELOPMENT (direct migration editing)

## EXISTING PACKAGES
laravel/framework:13.4.0, laravel/sanctum:4.3.1, laravel/socialite:5.26.1, filament/filament:5.4.5, spatie/laravel-permission, spatie/laravel-medialibrary, livewire/livewire:4.2.4

## DATABASE HIERARCHY
Level 1: CATEGORIES
Level 2: SUBCATEGORIES (belongs to category)
Level 3: DISEASES (belongs to subcategory or directly to category)
Level 4: RECORDINGS (polymorphic — may belong to Disease, Subcategory, or Category)

TERMINAL NODE RULE: Whichever level has recordings attached directly is the terminal level for that branch. No children may be added below a terminal node, and a node with children cannot become terminal. The Filament CMS enforces this as a hard validation error in both directions:
  • Category + recordings → cannot add subcategories (and vice versa)
  • Subcategory + recordings → cannot add diseases (and vice versa)

## BUSINESS RULES
Recording types (single source: ../shared-context.md → RECORDING TYPES):
type=summarized (مختصرة) → ALWAYS FREE
type=detailed (مطولة) → REQUIRES subscription OR trial
Max two recordings per owner (one summarized + one detailed)
Trial: 7 days, max 2 per user
Favorites: DISEASES only
Free users: access summarized recordings only
Paid users: access summarized + detailed recordings
General Ruqyah: is_general flag

## USER ROLES
Super_Admin: Full Filament access
Admin: Manage content
Regular_User: API only

## DEVELOPMENT RULES
NO inline comments, NO doc comments, NO version markers
Direct migration editing, Debug-first
NEVER delete without user approval

## IGNORED DIRECTORIES
../mobile/, node_modules/, vendor/, resources/js/, resources/css/

## READY SIGNAL
BACKEND CONTEXT LOADED. Ready for Phase 1.
```

---

# FILE: .claude/backend/prompts/phase-1-database.md

```
# PHASE 1: DATABASE MIGRATIONS

Workers: 4 | Mode: EXECUTION | Executor: Laravel Expert

FILES (27 migrations):
1_users,2_roles,3_permissions,4_model_has_roles,5_role_has_permissions,6_model_has_permissions,7_media,8_surahs,9_verses,10_categories,11_subcategories,12_diseases,13_disease_aliases,14_recordings,15_favorites,16_adhkar_categories,17_adhkar_items,18_adhkar_sections,19_tahsinat_categories,20_tahsinat_items,21_courses,22_sponsors,23_sponsor_screen_config,24_feedback,25_feature_flags,26_notification_preferences,27_push_notifications

See .claude/backend/agents/database-architect.md

RULES: No comments, ../mobile/ never referenced
favorites: disease_id (not recording_id), diseases: is_general flag

AFTER: php artisan migrate:fresh
VERIFY: 27 tables exist, favorites.disease_id, diseases.is_general

OUTPUT: ✓ Migration 1 created by Laravel Executor. Next?
```

---

# FILE: .claude/backend/prompts/phase-2-repositories.md

```
# PHASE 2: REPOSITORIES

Workers: 3 | Mode: EXECUTION | Executor: Laravel Expert

FILES:
RepositoryInterface.php, BaseRepository.php
SurahRepositoryInterface.php, SurahRepository.php
VerseRepositoryInterface.php, VerseRepository.php
CategoryRepositoryInterface.php, CategoryRepository.php
SubcategoryRepositoryInterface.php, SubcategoryRepository.php
DiseaseRepositoryInterface.php, DiseaseRepository.php
RecordingRepositoryInterface.php, RecordingRepository.php
FavoriteRepositoryInterface.php, FavoriteRepository.php
AdhkarRepositoryInterface.php, AdhkarRepository.php
TahsinatRepositoryInterface.php, TahsinatRepository.php
CourseRepositoryInterface.php, CourseRepository.php
SponsorRepositoryInterface.php, SponsorRepository.php
FeedbackRepositoryInterface.php, FeedbackRepository.php
FeatureFlagRepositoryInterface.php, FeatureFlagRepository.php
NotificationRepositoryInterface.php, NotificationRepository.php
RepositoryServiceProvider.php

See .claude/backend/agents/repository-generator.md

RULES: No comments, ../mobile/ never referenced
RecordingRepository must include canAccess() method checking business rules
FavoriteRepository must include toggle() method using firstOrCreate

AFTER: php artisan optimize

OUTPUT: ✓ RepositoryInterface.php created by Laravel Executor. Next?
```

---

# FILE: .claude/backend/prompts/phase-3-models-services.md

```
# PHASE 3: MODELS + SERVICES + TESTS + SEEDERS

Workers: 5 | Mode: EXECUTION | Executor: Laravel Expert

FILES:
Models: User, Category, Subcategory, Disease, Recording, Favorite, AdhkarCategory, AdhkarItem, AdhkarSection, TahsinatCategory, TahsinatItem, Course, Sponsor, SponsorScreenConfig, Feedback, FeatureFlag, NotificationPreference, PushNotification
Services: CategoryService, DiseaseService, RecordingService, FavoriteService, AdhkarService, TahsinatService, CourseService, SponsorService, FeedbackService, FeatureFlagService, NotificationService, TrialService, SubscriptionService, GoogleAuthService
Helpers: Helpers.php
Seeders: QuranSeeder, DiseaseSeeder, AdhkarSeeder, TahsinatSeeder, SponsorSeeder, FeatureFlagSeeder
Tests: RepositoryTest, ServiceTest, SeederTest

See .claude/backend/agents/model-generator.md, service-generator.md, seeder-generator.md

RULES: No comments, ../mobile/ never referenced
User model: methods isSubscribed(), hasActiveTrial(), canGrantTrial(), grantTrial()
Recording model: method canBeAccessedBy(User $user) implementing business rules
Favorite model: method toggle($userId, $diseaseId) using firstOrCreate

AFTER: php artisan test --filter=Unit

OUTPUT: ✓ Model User.php created by Laravel Executor. Next?
```

---

# FILE: .claude/backend/prompts/phase-4-filament.md

```
# PHASE 4: FILAMENT CMS

Workers: 4 | Mode: EXECUTION | Executor: Filament Expert

FILES:
ReusableFormFields.php, ReusableTableColumns.php
UserResource.php
CategoryResource.php, SubcategoryResource.php
DiseaseResource.php (with is_general checkbox and aliases management)
RecordingResource.php (session_number, type: summarized/detailed)
FavoriteResource.php (read-only)
AdhkarCategoryResource.php, AdhkarItemResource.php
TahsinatCategoryResource.php (self/others, random_order), TahsinatItemResource.php
CourseResource.php (is_coming_soon toggle)
SponsorResource.php (logo upload, display_on_launch)
FeedbackResource.php (read-only, filter by was_beneficial)
FeatureFlagResource.php (toggle feature visibility)
StatisticsDashboard.php, StatsOverviewWidget.php, FeedbackChartWidget.php, ExpiringSubscriptionsWidget.php, PopularDiseasesWidget.php

See .claude/backend/agents/filament-cms-builder.md

RULES: No comments, ../mobile/ never referenced

AFTER: php artisan filament:cache-components

OUTPUT: ✓ ReusableFormFields.php created by Filament Executor. Next?
```

---

# FILE: .claude/backend/prompts/phase-5-api.md

```
# PHASE 5: API CONTROLLERS

Workers: 4 | Mode: EXECUTION | Executor: API Engineer

FILES:
ApiResponse.php, BaseController.php
AuthController.php
CategoryController.php, SubcategoryController.php
DiseaseController.php
RecordingController.php
FavoriteController.php (toggle uses firstOrCreate)
AdhkarController.php (today, waking endpoints)
TahsinatController.php
CourseController.php
SponsorController.php
FeedbackController.php
FeatureFlagController.php
NotificationController.php (preferences, token)
SubscriptionController.php
routes/api.php

See .claude/backend/agents/api-engineer.md

RULES: No comments, ../mobile/ never referenced
FavoriteController: toggle() method must use firstOrCreate pattern
RecordingController: stream() method must implement business rules (type=summarized free, type=detailed requires subscription/trial — see ../../shared-context.md → RECORDING TYPES)

AFTER: php artisan test --filter=Feature

OUTPUT: ✓ ApiResponse.php created by API Executor. Next?
```

---

# FILE: .claude/backend/prompts/phase-6-security.md

```
# PHASE 6: SECURITY + MIDDLEWARE

Workers: 3 | Mode: EXECUTION | Executor: Security Expert

FILES:
DiseasePolicy.php, RecordingPolicy.php, FavoritePolicy.php, CategoryPolicy.php, UserPolicy.php
SetLocale.php, CheckSubscription.php, LogUserActivity.php
Kernel.php update, sanctum.php update, cors.php update
RoleTest.php, PolicyTest.php

See .claude/backend/agents/security-auditor.md

RULES: No comments, ../mobile/ never referenced
RecordingPolicy: stream() method must implement: type=summarized free, type=detailed requires subscription or trial, trial max 2 per user

KERNEL UPDATE: add 'locale', 'subscription' middleware
SANCTUM UPDATE: expiration = 1440
CORS: allow mobile app origin

AFTER: php artisan test --filter=Security

SECURITY AUDIT COMMANDS:
grep -r "DB::raw" app/ --exclude-dir=vendor
grep -r "../mobile/" app/ --exclude-dir=vendor

FINAL SUCCESS MESSAGE:

✅ BACKEND BUILD COMPLETE

Summary:
- 27 migrations
- 18 models
- 16 Repository Interfaces + Implementations
- 15 Filament Resources
- 14 API Controllers
- 3 Middleware
- 5 Policies

Business Rules Implemented:
- type = summarized (مختصرة) → ALWAYS FREE for ALL users
- type = detailed (مطولة) → REQUIRES active subscription OR active trial
- Max two recordings per owner (one summarized + one detailed)
- Trial: 7 days, max 2 per user lifetime

Recordings: Belongs to Disease (Disease > Subcategory > Category)
Favorites: DISEASES only, UNIQUE constraint, firstOrCreate pattern
General Ruqyah: is_general flag for quick-launch button

Code Quality:
- No inline comments
- Debug-first process enforced
- ../mobile/ directory completely IGNORED

Admin Panel: http://localhost:8000/admin
API Base: http://localhost:8000/api/v1
Default Admin: admin@example.com / password

Build log: storage/logs/build.log

OUTPUT: ✓ DiseasePolicy.php created by Security Executor. Next?
```

---

# FILE: .claude/backend/roles/executor-api.md

```
# ROLE: EXECUTOR - API ENGINEER

EXECUTION MODE:
- One file per response, No inline comments
- NEVER touch ../mobile/
- Http::withOptions(['verify' => false]) for Windows 10 SSL

CONTROLLERS:
AuthController, CategoryController, SubcategoryController, DiseaseController
RecordingController, FavoriteController, AdhkarController, TahsinatController
CourseController, SponsorController, FeedbackController, FeatureFlagController
NotificationController, SubscriptionController

RATE LIMITING: 60 requests per minute

OUTPUT: ```php <?php [code with no comments] ```

LOGGING: [YYYY-MM-DD HH:MM:SS] [API] [PHASE X] [EXECUTION] message
```

---

# FILE: .claude/backend/roles/executor-filament.md

```
# ROLE: EXECUTOR - FILAMENT EXPERT

EXECUTION MODE:
- One file per response, No inline comments
- NEVER touch ../mobile/

FILAMENT 5 NAMESPACE RULES:
- Section: Filament\Schemas\Components\Section (NOT Filament\Forms\Components\Section)
- Row actions: Filament\Actions\Action (NOT Filament\Tables\Actions\Action)
- Placeholder is DEPRECATED, do not use

RESOURCES:
UserResource (Super Admin only)
CategoryResource, SubcategoryResource, DiseaseResource, RecordingResource
FavoriteResource (read-only), FeedbackResource (read-only)
AdhkarCategoryResource, AdhkarItemResource
TahsinatCategoryResource, TahsinatItemResource
CourseResource, SponsorResource, FeatureFlagResource

OUTPUT: ```php <?php [code with no comments] ```

LOGGING: [YYYY-MM-DD HH:MM:SS] [FILAMENT] [PHASE X] [EXECUTION] message
```

---

# FILE: .claude/backend/roles/executor-laravel.md

```
# ROLE: EXECUTOR - LARAVEL EXPERT

EXECUTION MODE:
- One file per response, No inline comments
- NEVER touch ../mobile/

MODEL RELATIONSHIPS:
Category: hasMany(Subcategory::class), hasMany(Disease::class)
Subcategory: belongsTo(Category::class), hasMany(Disease::class)
Disease: belongsTo(Subcategory::class), hasMany(Recording::class), belongsToMany(User::class, 'favorites')
Recording: belongsTo(Disease::class), belongsTo(User::class, 'created_by')

BUSINESS RULE IMPLEMENTATION:
if ($recording->type === 'summarized') { return true; }
if ($user && ($user->is_subscribed || $user->hasActiveTrial())) { return true; }
if ($user && $user->trial_used_count < 2 && !$user->is_subscribed) { return $user->grantTrial(); }
return false;

OUTPUT: ```php <?php [code with no comments] ```

LOGGING: [YYYY-MM-DD HH:MM:SS] [LARAVEL] [PHASE X] [EXECUTION] message
```

---

# FILE: .claude/backend/roles/executor-security.md

```
# ROLE: EXECUTOR - SECURITY EXPERT

EXECUTION MODE:
- One file per response, No inline comments
- NEVER touch ../mobile/

POLICIES:
DiseasePolicy, RecordingPolicy, FavoritePolicy, CategoryPolicy, UserPolicy

MIDDLEWARE:
SetLocale, CheckSubscription, LogUserActivity

CONFIGURATIONS:
sanctum.php: expiration = 1440
cors.php: allowed_origins = mobile app URL
Kernel.php: register middleware

OUTPUT: ```php <?php [code with no comments] ```

LOGGING: [YYYY-MM-DD HH:MM:SS] [SECURITY] [PHASE X] [EXECUTION] message
```

---

# FILE: .claude/backend/roles/parent.md

```
# ROLE: PARENT (ORCHESTRATOR)

Path: C:\Users\wael\Desktop\Quran\backend

RESPONSIBILITIES:
- SCAN existing backend structure FIRST (ignore ../mobile/)
- Verify hierarchy (Disease > Subcategory > Category)
- Assign phases to executors, monitor quality gates
- Request user approval before any file deletion

DELETION REQUEST: "Found [file path]. User, may I remove this file? (YES/NO)"

LOGGING: [YYYY-MM-DD HH:MM:SS] [PARENT] [PHASE X] [ACTION] message

READY SIGNAL: "PARENT READY. ../mobile/ IGNORED. Hierarchy: Disease > Subcategory > Category."
```

---

# FILE: .claude/backend/roles/qa.md

```
# ROLE: QUALITY ASSURANCE (QA)

VALIDATION CHECKLIST:
- No raw SQL, No N+1 queries, Repository pattern, Service pattern
- Transactions, Try-catch, Cache TTL <= 300s
- type=summarized always free, type=detailed requires subscription/trial, trial max 2, max one recording per type per owner
- Recordings polymorphic, Hierarchy: Disease > Subcategory > Category
- No inline comments, ../mobile/ untouched
- Favorites store disease_id, is_general flag, search aliases work

QUALITY SCORE: Base 100, violation -5, min passing 75

LOGGING: [YYYY-MM-DD HH:MM:SS] [QA] [PHASE X] [VALIDATION] message
```

---

# FILE: .claude/backend/roles/researcher.md

```
# ROLE: RESEARCHER

RESPONSIBILITIES:
- SCAN existing backend structure (ignore ../mobile/)
- VERIFY hierarchy (Disease > Subcategory > Category)
- Debug-first: analyze before fixes
- Research concurrency solutions (unique constraints, firstOrCreate, lockForUpdate)
- Research cache invalidation strategies (version endpoint)
- Never writes code, never deletes files

LOGGING: [YYYY-MM-DD HH:MM:SS] [RESEARCHER] [PHASE X] [TOPIC] message
```

---

# FILE: .claude/backend/rules.md

```
# BACKEND GOLDEN RULES

RULE_1: NO_RAW_SQL
RULE_2: NO_N_PLUS_ONE
RULE_3: REPOSITORY_PATTERN
RULE_4: SERVICE_PATTERN
RULE_5: TRANSACTIONS
RULE_6: TRY_CATCH
RULE_7: SHORT_CACHE - Max TTL 300 seconds
RULE_8: RECORDING_TYPES - max two recordings per owner: type=summarized (مختصرة) free, type=detailed (مطولة) requires subscription/trial (trial max 2). See "RECORDING TYPES" in ../shared-context.md (single source of truth).
RULE_9: FLEXIBLE_HIERARCHY - Recordings may be attached at any level (Category, Subcategory, or Disease) via the polymorphic relation. Whichever level holds recordings directly becomes a TERMINAL node and cannot have children. Rules enforced by the Filament CMS as hard validation errors:
  • Category with direct recordings → CANNOT have subcategories
  • Subcategory with direct recordings → CANNOT have diseases
  • Category that already has subcategories → CANNOT receive direct recordings
  • Subcategory that already has diseases → CANNOT receive direct recordings
  • Disease is always terminal (recordings only — no further children)
  • Disease must have exactly one of subcategory_id or category_id (never both, never neither)
RULE_10: POLYMORPHIC_RECORDINGS - recordable_id + recordable_type. Before allowing a child node to be created, verify recordings_count = 0 on the parent. Before allowing a recording to be attached to a parent, verify children_count = 0 on that parent.
RULE_11: FAVORITES_DISEASES_ONLY - store disease_id
RULE_12: GENERAL_RUQYAH - is_general flag
RULE_13: PAGINATION - 15 default, max 100
RULE_14: CLEAN_CODE - No doc comments, no version markers
RULE_16: NO_COMMENTS - No inline comments
RULE_17: DEBUG_FIRST
RULE_18: READ_EXISTING
RULE_20: NO_DELETE - NEVER delete without approval
RULE_21: LOG_SUCCESS
RULE_22: LOG_FAILURE
RULE_23: LOG_PHASE
RULE_24: PARENT_FINAL
RULE_25: RESEARCHER_NO_CODE
RULE_26: QA_NO_CODE
RULE_27: EXECUTOR_ONE_FILE
```

---

# FILE: .claude/backend/scan-instructions.md

```
# BACKEND SCAN INSTRUCTIONS (FIRST STEP)

## IGNORED DIRECTORIES
../mobile/, node_modules/, vendor/, resources/js/, resources/css/

## SCAN COMMANDS
dir /b
dir /b app\Models
dir /b app\Http\Controllers\Api 2>nul
dir /b app\Http\Middleware 2>nul
dir /b app\Http\Requests\Api 2>nul
dir /b app\Http\Resources\Api 2>nul
dir /b app\Filament\Resources 2>nul
dir /b database\migrations
type routes\api.php
type routes\web.php 2>nul
dir /b app\Repositories 2>nul
dir /b app\Services 2>nul
dir /b app\Policies 2>nul

## AFTER SCAN COMPLETE
Say: "BACKEND SCAN COMPLETE. ../mobile/ IGNORED. Ready for Phase 1."
```

---

# FILE: .claude/backend/system-prompt.md

```
# SYSTEM PROMPT

ROLE: Parent Orchestrator

CORE RULES:
- No inline comments
- Debug-first: analyze before implementation
- IGNORE ../mobile/ directory
- Recordings belong to deepest level (Disease > Subcategory > Category)
- Recording types: summarized (مختصرة) free, detailed (مطولة) requires subscription/trial, max one of each per owner, trial max 2 (see ../shared-context.md → RECORDING TYPES)
- Favorites store disease_id, General ruqyah flag

PHASE EXECUTION FLOW:
1. SCAN existing backend structure
2. Ask user before deleting any file
3. Execute phase with appropriate Executor
4. QA validates outputs
5. Parent passes/fails

OUTPUT FORMAT: ✓ [filename] created. Next?

LOGGING: [YYYY-MM-DD HH:MM:SS] [ROLE] [PHASE X] [MODE] message

READY SIGNAL: "SYSTEM READY. Path: C:\Users\wael\Desktop\Quran\backend. ../mobile/ IGNORED. Hierarchy: Disease > Subcategory > Category. Business rule: summarized (مختصرة) recording free, detailed (مطولة) recording requires subscription/trial (max 2 trials); max one of each per owner. Favorites store disease_id. Awaiting Phase 1."
```

---

# FILE: .claude/backend/testing.md

```
# Backend Testing Conventions

Runner: **PHPUnit 12, class-style** (NOT Pest — do not write `test()` closures).
Config: `phpunit.xml` runs against SQLite `:memory:`, `array` cache, `sync` queue, `array` mail.

## Run

```bash
php artisan test                         # everything
php artisan test --testsuite=Feature     # one suite
php artisan test --filter=DiseaseSearch  # one class/method
```

## Layout & naming

```
tests/
├── Feature/
│   ├── Api/        # HTTP endpoint tests (one class per controller/feature)
│   └── Console/    # artisan command tests
└── Unit/           # pure classes/helpers, no framework boot where possible
```

- Class extends `Tests\TestCase`. Methods are `public function test_snake_case_description(): void`.
- Add `use RefreshDatabase;` to any test that touches the database.
- A pure unit test (no DB/container) may extend `PHPUnit\Framework\TestCase` directly — see
  `tests/Unit/DiseaseSearchHelperTest.php` (reflection on a private helper).

## Factories

- Every model under test has `use HasFactory;` and a `database/factories/<Model>Factory.php`.
- Translatable (`name`/`bio`) fields are arrays: `['ar' => '…', 'en' => '…']`.
- Encode domain rules as factory **states**, not ad-hoc test setup. Examples:
  - `CategoryFactory::diseaseDirect()` — diseases can only attach to a `disease_direct` category.
  - `RecitationFactory::localFile($path)` / `->remote($url)` — drives the audio branch under test.
  - `DiseaseFactory` leaves `slug` unset (the model's saving hook derives it).

## Faking infrastructure (don't hit the network/disk/queue)

| Concern | Use |
|---------|-----|
| Local storage | `Storage::fake('public')` then `Storage::disk('public')->put(...)` |
| Outbound HTTP / CDN | `Http::fake([...])` |
| Queue size / dispatch | `Queue::fake()` or `Queue::shouldReceive('size')->andReturn(n)` |
| Mail | `Mail::fake()` |

## Gotchas

- **Audio X-Accel test** asserts the `X-Accel-Redirect` header — it does NOT read the file, so
  `Storage::fake` is enough. Do **not** try to assert `response()->file()` byte-serving with
  `Storage::fake`: the controller serves via `storage_path()` (real FS) while the fake disk lives
  in a temp dir, so they diverge. That path is core framework behavior — don't test it here.
- **FULLTEXT search** is MySQL/MariaDB-only and guarded in the migration. On the SQLite test DB the
  repository falls back to LIKE; `DiseaseSearchTest::test_fulltext_toggle_falls_back_to_like_on_sqlite`
  pins that fallback.
- Scalability flags are plain config — override per test with `config(['scalability.audio.use_x_accel' => true])`.

## What to cover first

Riskiest custom logic, in order: controller branches (auth/validation/error codes), service
outcomes (e.g. Google OTP `verifyOtp` states), repository queries, artisan commands. Skip
framework behavior and trivial getters.
```

---

# FILE: .claude/backend/validation-checklist.md

```
# VALIDATION CHECKLIST

PRE-BUILD:
- SCAN complete, ../mobile/ ignored, approvals obtained

POST-MIGRATION:
- All tables exist, favorites.disease_id, diseases.is_general, ../mobile/ untouched

POST-REPOSITORY:
- All models have RepositoryInterface, no comments

POST-FILAMENT:
- Super Admin sees all, Admin sees content

POST-API:
- GET /api/categories works, GET /api/diseases/search works, GET /api/general-ruqyah works
- POST /api/favorites/toggle stores disease_id, type=summarized free
- type=detailed requires subscription/trial, trial max 2, no comments

POST-SECURITY:
- Policies enforce roles, middleware registered, ../mobile/ untouched

CODE QUALITY:
- No inline comments, no deletion without approval
```

---

# FILE: .claude/mobile/CLAUDE.md

```
# Quranic Clinic — Mobile (React Native Expo)

## Stack
- Expo SDK 54 · Expo Router v6 · React Native 0.81
- TypeScript 5.7 (strict mode)
- React Query v5 (`@tanstack/react-query`)
- expo-av ~16 · expo-sqlite ~16 · expo-file-system ~19
- Client/app state: Redux Toolkit + redux-persist (AsyncStorage) · Server state: React Query v5
- UI: custom `StyleSheet` + Theme system (no component library)

---

## Plan Documents

The full mobile build plan lives in `.claude/mobile/`. Read the relevant doc before
working on a feature:

| File | Covers |
|---|---|
| `project.md` | Identity, stack decisions, directory map, business rules, Figma reference |
| `rules.md` | Mobile golden rules |
| `hierarchy-navigation.md` | Content hierarchy + Expo Router routing map |
| `store-design.md` | Redux Toolkit store — 11 slices, persistence, Context bridge |
| `services-design.md` | API service layer + verified backend endpoints |
| `hooks-design.md` | Custom hooks (React Query vs Redux) |
| `components-design.md` | Custom `StyleSheet` UI components |
| `screens-design.md` | Screen-by-screen spec |
| `offline-sync.md` | Offline behaviour + download manager + action queue |
| `notifications.md` | Adhkar reminders + wake detection |
| `optimization.md` | Performance practices |
| `phase-assignment.md` | Phased build roadmap + status |

**Mushaf is already built — restyle to the Figma only, never change its behaviour.**

---

## ⚠ Figma MCP — Connection & Extraction Rules

- Config file: `C:\Users\wael\Desktop\Quran\.vscode\mcp.json`
- SSE endpoint: `http://127.0.0.1:3845/sse`
- **Make exactly ONE connection attempt.** If it succeeds, extract ALL required styles in a single call. Never reconnect or retry in a loop.
- **Extract everything in one pass** — node metadata, colors, spacing, typography, and any variables — to avoid token waste from repeated round-trips.
- If the first connection attempt fails, stop and tell the user; do not loop or retry automatically.

---

⚠ API URL Priority — Local Always First in DEV, No Startup Probe

**Resolution order** (see `src/services/api.ts` + `src/services/apiClient.ts`):
1. `EXPO_PUBLIC_API_URL` in `.env` → hard override, skips everything
2. Release build → always production
3. Dev build → `API_URL` is **always** set to `LOCAL_API_URL` — no reachability probe. The startup probe was removed because it returned false negatives on Android where `localhost` resolves to the device itself, not the host machine.
4. Per-request fallback → if local returns a network error or 404, that single request retries against production (Mashfa). Auth/validation errors are NOT retried.

**`LOCAL_API_URL` auto-detection (native):**
- Android emulator: `localhost`/`127.0.0.1` remapped to `10.0.2.2`
- Physical device: host IP from Expo `hostUri` / `linkingUri`
- Override: set `EXPO_PUBLIC_API_URL_LOCAL=http://192.168.x.x:8000/api` in `.env` when auto-detection is insufficient

**Rules:**
- Never hardcode any URL in a service file. Always read `api.API_URL`.
- Never add a startup probe — removed intentionally.
- Do not uncomment `EXPO_PUBLIC_API_URL` in `.env` permanently — disables local dev.
- `backend/.env` → `APP_URL` must match whatever host the device uses to reach Laravel so that `audio_url` fields in API responses resolve correctly on the device.

---


## ⚠ Directory Rules — Read Before Touching Any File

Expo Router turns **every file inside `app/`** into a route. Only screen components (files with a `default` React component export) belong there.

| What | Correct location | Import alias |
|---|---|---|
| Screen components | `app/(tabs)/`, `app/mushaf/`, etc. | — |
| Hooks | `src/hooks/` | `@/hooks/hookName` |
| Types / interfaces | `src/types/` | `@/types/typeName` |
| Services (API, storage, audio) | `src/services/` | `@/services/name` |
| Context providers | `src/context/` | `@/context/name` |
| TypeScript declarations | project root `mobile/` | — |

**Rule:** If a file has no `export default function Screen()`, it must NOT be in `app/`.  
**Import rule — applies to ALL files in the project (not just `app/`):** always use `@/hooks/...`, `@/types/...`, `@/services/...`, `@/context/...` — never `../`, `../../`, or `./` relative paths for cross-directory imports. The `@` alias maps to `src/` (configured in `tsconfig.json`). This rule is enforced everywhere: inside `src/hooks/`, `src/services/`, `src/types/`, etc.

---

## ⚠ Package API Versions

| Package | Version | Rule |
|---|---|---|
| `expo-file-system` | ~19 | Import from `expo-file-system/legacy` — the top-level API deprecated `getInfoAsync`, `makeDirectoryAsync`, `createDownloadResumable` and will throw at runtime |
| `expo-sqlite` | ~16 | Async API only: `openDatabaseAsync`, `getAllAsync`, `runAsync`, `execAsync`, `withTransactionAsync`. The legacy `.transaction()` callback API is removed. |
| `expo-av` | ~16 | Deprecated in SDK 54, will be removed in SDK 55. Migration target: `expo-audio` + `expo-video`. Do not add new usages. |
| `app.json` plugins | — | Only packages with an Expo config plugin go here. `expo-av` and `expo-file-system` do NOT have config plugins — omit them. |

---

## ⚠ Google Auth — Bypassed for Development

Auth is intentionally disabled in `app/_layout.tsx`:
- `RootLayoutNav` renders directly to `(tabs)` — no login redirect
- `AuthProvider` wrapper is kept; restore the guard inside `RootLayoutNav` when auth is needed
- Do **not** re-enable auth unless the user explicitly asks
- Login screen (`app/login.tsx`) exists but is unreachable while bypass is active

---

## ⚠ Offline Mode

There is **no manual offline toggle**. Offline works automatically:

- **Quran text**: `useSurahs` and `useSurah` always try the API first, then fall back to SQLite if the network call fails. SQLite is populated on every successful online fetch.
- **Audio**: user presses the ↓ Download button on a surah screen → file saved to `{documentDirectory}/audio/surah_{id}_reciter_{id}.mp3`. On play, `audioService.isAudioCached` checks for the local file and plays it; streams from the API otherwise.

---

## Key Files

| File | Purpose |
|---|---|
| `src/context/MushafContext.tsx` | Shared state: `selectedSurahId`, `selectedReciterId` (persisted to AsyncStorage) |
| `src/services/quranService.ts` | All API calls (surahs, reciters, recitations) |
| `src/services/offlineStorage.ts` | expo-sqlite v16 — text caching (surahs + verses) |
| `src/services/audioService.ts` | expo-file-system/legacy — audio download + cache check |
| `src/hooks/useAudio.ts` | expo-av Sound lifecycle (load, play, pause, seek, unload) |
| `app/(tabs)/mushaf.tsx` | Surah list screen with reciter selector |
| `app/mushaf/[id].tsx` | Quran reader + audio player for one surah |
| `app/_layout.tsx` | Root layout — auth bypass is here |
```

---

# FILE: .claude/mobile/components-design.md

```
# COMPONENTS DESIGN

All components are **custom**, built on React Native `StyleSheet` + the Theme system.
No React Native Paper or other component library. Styles come from `StyleSheet.create`
(theme-dependent styles via a `createXStyles(theme)` factory, memoized — matching the
existing `reader.styles.ts` / `mushaf.styles.ts` pattern). List items are `React.memo`.

## EXISTING ✓ (built)
- `src/components/AppSplash.tsx` — splash screen.
- Mushaf-internal components in `app/mushaf/[id].tsx`: `SeekBar`, `VerseRow`
  (already `React.memo`). Restyle to the Figma only; keep behaviour.

## src/components/common/
- **Button** — `title`, `onPress`, `variant` ('primary'|'secondary'|'outline'|'ghost'),
  `loading`, `disabled`, `fullWidth`, `icon`. `React.memo`.
- **Card** — `children`, `onPress?`, `elevation`, `style`. Pressable variant uses
  `useCallback`.
- **Loader** — `size`, `fullScreen`. Themed spinner.
- **EmptyState** — `icon`, `title`, `message`, `actionLabel?`, `onAction?`.
- **ErrorBoundary** — catches render errors, themed fallback + retry.
- **Badge** — small count/lock/status pill (used for locked sessions, download count).
- **IconButton** — circular pressable icon (back, favorite, download, share).
- **ProgressBar** — linear/circular; used by downloads and the audio player.

## src/components/layout/
- **Screen** — safe-area wrapper, optional `KeyboardAvoidingView`, optional scroll,
  themed background. Every screen renders inside it.
- **Header** — back button (`router.back()` — RULE_40), title, right actions
  (favorite/share/download). Custom, not the default Expo Router header.
- **TabBar** — custom bottom tab bar matching the Figma; badge for active downloads.
- **SectionHeader** — titled section divider for Home / More.

## src/components/lists/
List components wrap `FlatList` with the optimizations in `optimization.md`
(`useCallback` `renderItem`/`keyExtractor`, `removeClippedSubviews`,
`maxToRenderPerBatch`, `windowSize`, `getItemLayout`).
- **CategoryGrid / CategoryList** — renders `CategoryCard`.
- **SubcategoryList** — renders `SubcategoryCard`.
- **DiseaseList** — renders `DiseaseCard`; passes `isFavorited` per row.
- **RecordingList** — renders `RecordingCard`.
- **AdhkarList** — renders `AdhkarItemRow`; prev/next navigation.
- **TahsinatList** — renders `TahsinatItemRow`; supports random order.

## Card / row components (all `React.memo`)
- **CategoryCard** — name, icon, background image (`expo-image`). `useCallback` press.
- **SubcategoryCard** — name, disease count.
- **DiseaseCard** — name, short description, favorite icon, recording count.
  Custom `React.memo` comparator on `disease.id` + `isFavorited`.
- **RecordingCard** — session number/title, duration, play button, download button +
  `ProgressBar`; lock badge for sessions 2/3 when the user is free-tier.
- **AdhkarItemRow** — text, repetitions, counter buttons, "daleel" (evidence) button.
- **TahsinatItemRow** — label, text, repetitions, hint.
- **CourseCard** — course info + WhatsApp action.
- **SponsorCard** — sponsor logo + name.

## src/components/forms/
Minimal — the app has few real forms (OAuth login, feedback, notification prefs).
Plain controlled components + small validators; no Formik/Yup unless a complex form
appears later.
- **TextField** — label, value, error, `onChangeText`, themed.
- **Checkbox** — boolean field (terms acceptance, prefs).
- **Toggle** — switch for settings (theme, Wi-Fi-only, notification toggles).
- **SearchBar** — debounced (300 ms via `useDebounce`), Arabic + English, `onSearch`,
  `placeholder`, `autoFocus`.
- **FeedbackControl** — "Was this useful? Yes / No" + optional comment field.

## src/components/players/
- **AudioPlayer** — full player for ruqyah recordings; uses `usePlayer`. Shows
  progress bar, time labels, play/pause, ±skip, speed control.
- **MiniPlayer** — floating bar pinned above the tab bar while audio plays
  (`playerSlice.miniPlayerVisible`); title, play/pause, close.
- **GeneralRuqyahButton** — prominent quick-launch control on Home; uses
  `useGeneralRuqyah`; plays immediately, no navigation.
- **DownloadButton** — per-recording download trigger with progress/cancel/retry;
  uses `useDownloadManager`.

## src/components/quran/ (Mushaf — restyle only)
The Mushaf is built. Treat these as **restyle targets**, not new builds. Do not
introduce the obsolete 604-page viewer.
- Reader header, `VerseRow`, `SeekBar`, reciter selector, download/cached badge —
  all already exist inside `app/mushaf/*` and `app/(tabs)/mushaf.tsx`. Restyle to
  match the Figma; keep all behaviour and props.

## src/components/onboarding/
- **OnboardingPager** — Welcome / Teaser / Description / Explanatory screens;
  auto-transition, no nav buttons; first launch only (`onboardingSlice`).
- **SponsorScreen** — shown at every launch when the admin flag is on; sponsor logo;
  auto-dismiss after the configured duration (default 3 s).

## COMPONENT RULES
- Presentational only — no direct service/Redux calls in dumb components; receive
  data + callbacks via props. Container logic lives in screens/hooks.
- No inline styles/objects/functions in props (RULE_11, RULE_16).
- Theme tokens only — no hard-coded colours (RULE_12).
- Keep files under 450 lines; split when larger.
```

---

# FILE: .claude/mobile/hierarchy-navigation.md

```
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
```

---

# FILE: .claude/mobile/hooks-design.md

```
# CUSTOM HOOKS DESIGN

Hooks hold logic; components render. Each hook below is tagged with its data layer:
**[RQ]** React Query (server state) · **[RX]** Redux (app state) · **[L]** local.

## EXISTING HOOKS ✓ (built — do not change behaviour)
- `useAudio` — `expo-av` Sound lifecycle for the Mushaf player (load/play/pause/seek/
  unload). Stays on `expo-av`.
- `useSurahs` — surah list; API-first with SQLite fallback.
- `useSurah` — one surah with verses; API-first with SQLite fallback.
- `useReciters` — reciter list.
- `useVerseTiming` — per-verse timestamps from Quran.com v4 for verse highlighting.

## SERVER-STATE HOOKS (React Query)

### useCategories [RQ]
Categories list. `staleTime: Infinity` (static). Returns `{ categories, isLoading,
error, refetch }`.

### useCategory [RQ]
`useCategory(slug)` — one category with its subcategories.

### useSubcategory [RQ]
`useSubcategory(slug)` — one subcategory with its diseases.

### useDiseases [RQ]
`useDiseases(params)` — diseases for a subcategory/category. `staleTime: 5 min`.

### useDiseaseSearch [RQ + L]
Debounced search (`useDebounce`, 300 ms) over `/diseases/search`; synonym/alias
tolerant; Arabic + English. Returns `{ results, isSearching, query, setQuery }`.

### useDisease [RQ]
`useDisease(slug)` — disease detail (name, description, recordings).

### useRecordings [RQ + RX]
`useRecordings(diseaseId)` — recordings for a disease (max two: summarized + detailed).
Combines with `authSlice` `selectIsPaid` to mark each recording accessible/locked
(summarized free, detailed paid). Returns `{ recordings, accessibleRecordings, isLoading }`.

### useAdhkar [RQ + RX]
Fetches Morning/Evening/Sleep/Waking items. Per-item repeat counters live in
`uiSlice`/local + persisted. Returns grouped items, counters, `incrementCounter`,
`navigatePrev`, `navigateNext`.

### useTahsinat [RQ]
Self / For-Others items; honours `random_order`; repeat counters. Returns
`{ selfItems, othersItems, counters, incrementCounter }`.

### useCourses [RQ] · useSponsors [RQ] · useFeatures [RQ + RX]
List fetches. `useFeatures` writes flags into `featuresSlice` and caches for offline.

## APP-STATE HOOKS (Redux)

### useAuth [RX]
Wraps `authSlice`. Returns `user`, `isAuthenticated`, `isPaid`, `login`, `logout`.
Backed by the existing `AuthContext` bridge (see `store-design.md`).

### usePlayer [RX + L]
The global ruqyah audio player. Drives the `expo-audio` engine, dispatches
progress/state into `playerSlice`. Returns `play`, `pause`, `resume`, `seek`, `stop`,
`setRate`, `currentRecording`, `isPlaying`, `position`, `duration`, `isLoading`.
Separate from the Mushaf `useAudio` — do not merge them.

### useGeneralRuqyah [RX + RQ]
Fetches the `is_general` disease and plays its recording immediately via `usePlayer`
— no intermediate screens. Returns `{ playGeneralRuqyah, isLoading }`.

### useFavorites [RX]
Wraps `favoritesSlice`. Returns `favorites`, `isFavorited(diseaseId)`,
`toggleFavorite`, `syncStatus`. Offline toggles queue via `offlineQueueSlice`.

### useDownloadManager [RX]
Wraps `downloadsSlice` + `audioService`. Returns `download`, `cancel`, `retry`,
`deleteDownload`, `getProgress`, `downloads`, `storageUsage`, `clearAll`. Enforces
Wi-Fi-only and the free-tier session-1-only download limit.

### useSettings [RX] · useTheme [RX] · useLanguage [RX]
Wrap `settingsSlice`. `useTheme`/`useLanguage` keep their **current return shape**
(Context bridge) so existing Mushaf code is untouched.

### useNotificationPreferences [RX]
Wraps `notificationsSlice`. Returns prefs + `updatePreference`,
`scheduleNotifications`.

### useOfflineQueue [RX]
Wraps `offlineQueueSlice`. Returns `enqueue`, `processQueue`, `queueSize`.

### useNetworkStatus [RX + L]
Tracks connectivity, dispatches `uiSlice.setNetworkOnline`, triggers
`processQueue` on reconnect.

## UTILITY HOOKS

### useDebounce [L]
`useDebounce(value, delay = 300)` — delays a value; used by all search inputs.

### useMushafReader [RX] (target)
Optional future hook fronting `mushafSlice`. Only introduced as a behaviour-preserving
replacement for `MushafContext` — see `store-design.md` → Context bridge.

## HOOK RULES
- Server fetches go through React Query with keys from `src/utils/cacheKeys.ts`.
- App state mutations dispatch Redux actions; never mutate state directly.
- Memoize returned objects/callbacks (`useMemo`/`useCallback`) so consumers don't
  re-render needlessly.
- Audio hooks clean up (`unload`/stop) on unmount.
```

---

# FILE: .claude/mobile/notifications.md

```
# NOTIFICATIONS DESIGN

⚠ Expo Go limitation: since SDK 53, **remote push notifications do not work in Expo
Go** — a development build is needed for push. **Local/scheduled notifications still
work in Expo Go.** Build the adhkar reminders on local scheduled notifications; gate
push-token registration behind a dev-build check. `expo-notifications` and
`expo-sensors` are not yet installed — add them in this phase.

## NOTIFICATION TYPES
- `adhkar_morning` — scheduled after Fajr.
- `adhkar_evening` — scheduled after Asr.
- `adhkar_sleep` — scheduled before bedtime (user-defined time).
- `adhkar_waking` — triggered when the motion sensor detects wake-up within the
  user's waking-hours window.

## PRAYER TIMES
- Compute Fajr/Dhuhr/Asr/Maghrib/Isha from the device location, or fetch from a
  prayer-times API. Confirm the chosen source before building.
- Recompute daily; reschedule morning/evening notifications accordingly.

## WAKE DETECTION
- `expo-sensors` accelerometer; detect significant motion (magnitude over a threshold).
- Only act within `wakingStartTime`–`wakingEndTime` (`notificationsSlice`).
- Fire the waking-adhkar notification at most once per day.
- Tapping it deep-links into `/adhkar` on the Waking tab.

## USER PREFERENCES
Stored in `notificationsSlice` (persisted) and synced with the backend
(`GET/POST /notifications/preferences`):
`adhkarMorning`, `adhkarEvening`, `adhkarSleep`, `adhkarWaking` (booleans),
`wakingStartTime`, `wakingEndTime`, `pushToken`.

## notificationService.ts (device side)
- `scheduleAdhkarNotification(type, trigger)` — schedule a local notification.
- `cancelAllAdhkarNotifications()` — cancel all scheduled.
- `rescheduleAll(preferences, prayerTimes)` — recompute and reschedule.
- `registerForPushNotifications()` — dev build only; obtains a token, posts it via
  `POST /notifications/token`.
- `handleNotificationResponse(response)` — routes a tap to the right `/adhkar` tab.
- `startWakeDetection()` / `stopWakeDetection()` — accelerometer listener lifecycle.

## INTEGRATION
- On launch / when preferences change: `useNotificationPreferences` calls
  `rescheduleAll`.
- Permissions requested on first enable of any reminder, not at startup.
- Clean up sensor and notification listeners on unmount.
- Respect feature-visibility flags — if notifications are disabled for the app, skip
  scheduling entirely.
```

---

# FILE: .claude/mobile/offline-sync.md

```
# OFFLINE BEHAVIOUR & SYNC

Builds on the existing offline model documented in `.claude/mobile/CLAUDE.md`
("Offline Mode"): there is **no manual offline toggle** — offline works automatically.

## EXISTING MODEL ✓ (keep)
- **Quran text** — `useSurahs`/`useSurah` try the API first, fall back to SQLite on
  failure; SQLite is refilled on every successful online fetch.
- **Mushaf audio** — user taps the download button on a surah; file saved to
  `{documentDirectory}/audio/surah_{id}_reciter_{id}.mp3`; on play, `audioService`
  checks for the local file and plays it, else streams.

## EXTEND TO NEW FEATURES (same pattern)
- **Adhkar / Tahsinat text** — cache into SQLite on successful fetch; serve from cache
  when offline.
- **Categories / diseases** — React Query cache + (optional) SQLite mirror for offline
  browsing; show a "showing saved data" hint when serving stale offline data.
- **Ruqyah audio** — downloaded recordings saved as `recording_{id}.mp3`; play from
  cache when present.

## DOWNLOAD MANAGER
State lives in `downloadsSlice` (`store-design.md`); device work in `audioService`.

### Status lifecycle
`pending → downloading → completed` | `→ failed` | `→ cancelled`.
Each task tracks `progress`, `totalBytes`, `localPath`, `error`.

### Constraints
- Free users: download the **summarized recording only**. Paid users: both types.
- Wi-Fi-only toggle in settings, **default on** — block downloads on cellular unless
  the user allows it.
- On logout: clear all downloads (`clearAll`).

### Download UI
- Dedicated `DownloadButton` per recording: idle ↓ / progress / cancel / retry.
- "My Downloads" screen in `/more`: list with per-item size, total used / free space,
  remove item, clear all, search within downloads.

## OFFLINE ACTION QUEUE
`offlineQueueSlice` queues actions that need the server while offline:
- Types: `favorite` toggle, `feedback` submit, `playCount` increment.
- Each item: `id`, `type`, `payload`, `timestamp`, `retryCount`.
- `useNetworkStatus` detects reconnect → dispatches `processQueue`.
- Retry up to 3 times; drop and log after that.
- Optimistic UI: the favorite/feedback updates locally immediately; the queue
  reconciles with the server later.

## GRACEFUL DEGRADATION
- **Ask Me** — show "No internet connection"; no offline mode.
- **Search** — search the local cache only; show a "searching saved content" notice.
- **Courses / sponsors** — show cached data, or a "connect to the internet" message.
- **Feedback** — accept input, queue for sync, confirm to the user.

## PERSISTENCE BOUNDARIES
- SQLite (`expo-sqlite`) — large/relational text content (surahs, verses, adhkar).
- File system (`expo-file-system/legacy`) — audio binaries.
- `redux-persist` + `AsyncStorage` — app state (favorites, settings, downloads index,
  queue, feature-flag cache). See `store-design.md`.
- `expo-secure-store` — auth token only.
```

---

# FILE: .claude/mobile/optimization.md

```
# PERFORMANCE OPTIMIZATIONS

## MEMOIZATION
- **useMemo** — derived data (filtered/grouped/sorted lists, search results,
  shuffled tahsinat, theme-dependent style objects).
- **useCallback** — handlers passed to children, `FlatList` `renderItem`/
  `keyExtractor`, navigation callbacks.
- **React.memo** — pure list rows: `CategoryCard`, `DiseaseCard`, `RecordingCard`,
  `AdhkarItemRow`, `TahsinatItemRow`, `SurahRow`, `VerseRow`. Use a custom comparator
  where a prop is an object (e.g. `DiseaseCard` on `disease.id` + `isFavorited`).

## REDUX PERFORMANCE
- Derived state via `createSelector` — never compute in the component body.
- `useAppSelector` returns the **narrowest** slice needed; avoid selecting whole
  slices. Use `shallowEqual` / memoized selectors for object/array returns.
- Keep `playerSlice` progress updates throttled (~4/sec) so high-frequency audio
  position updates don't thrash subscribed components.
- Never dispatch inside render.

## FLATLIST
- `useCallback` for `renderItem` and `keyExtractor`.
- `removeClippedSubviews={true}`, `maxToRenderPerBatch={10}`, `windowSize={5}`,
  `initialNumToRender={8}`.
- `getItemLayout` for fixed-height rows (the existing reader handles variable rows
  via `onScrollToIndexFailed` — keep that pattern).
- `extraData` only the primitives that affect rows (mirror `mushaf/[id].tsx`).

## IMAGES
- `expo-image` for category/sponsor imagery and any WebP assets; placeholder while
  loading; `priority` for above-the-fold images only.

## REACT QUERY CONFIG
- Static (categories, surahs, reciters): `staleTime: Infinity`.
- Semi-static (diseases, adhkar, tahsinat): `staleTime: 5 min`.
- User-specific (favorites): `staleTime: 0`, refetch on focus.
- `gcTime: 10 min`, retry 2×. Keys centralized in `src/utils/cacheKeys.ts`.

## AVOID RERENDERS
- No inline arrow functions, objects, or arrays in props — `useCallback`/`useMemo` or
  module-level constants.
- Stable `StyleSheet.create` objects; for theme-dependent styles use a memoized
  `createXStyles(theme)` factory (existing pattern).
- Correct dependency arrays in every `useEffect`/`useMemo`/`useCallback`.

## LAZY LOADING
- Adhkar/Tahsinat: render a tab's content only when selected.
- Audio player / heavy screens: lean on Expo Router's route-level lazy loading.
- Mushaf reader: load the current verse range; the existing windowed `FlatList`
  already handles this — do not regress it.

## MEMORY MANAGEMENT
- Unload audio (`expo-av` Sound for Mushaf, `expo-audio` for ruqyah) on unmount.
- Remove accelerometer and notification listeners on unmount.
- On logout: clear the React Query cache, clear downloaded audio, purge persisted
  user state.
```

---

# FILE: .claude/mobile/phase-assignment.md

```
# PHASE ASSIGNMENT — MOBILE

Status as of 2026-05-19. Legend: ✅ done · 🟡 partial · ⬜ not started.

## PHASE 0 — Project Scan ✅
Existing structure, dependencies, and the shipped Mushaf have been scanned.
Findings are captured in `project.md` (directory map) and `services-design.md`
(verified backend endpoints). No further action.

## PHASE 1 — Core Infrastructure 🟡
- ✅ Expo Router, React Query (`QueryProvider`), `api.ts`, base types, Theme +
  Language contexts already exist.
- ⬜ Install Redux Toolkit + react-redux + redux-persist.
- ⬜ Build `src/store/` — store, typed hooks, root reducer, the 11 slices
  (`store-design.md`). Add `StoreProvider`.
- ⬜ `src/services/apiClient.ts` — axios instance + interceptors.
- ⬜ `src/utils/` — `cacheKeys`, formatters, validators.
- ⬜ Extend the Theme system with spacing/typography tokens for the Figma.
- ⬜ Custom `Header` / `TabBar` / `Screen` layout components.

## PHASE 2 — Authentication & Onboarding ⬜
- Auth slice + flows (Google OAuth, register, login, `me`). Auth stays **bypassed**
  in `_layout.tsx` until the user asks otherwise (CLAUDE.md).
- Onboarding pager (first launch only, auto-transition).
- Sponsor screen (every launch when enabled).
- Medical disclaimer + Terms & Conditions.

## PHASE 3 — Hospital (Ruqyah) Module ⬜
- Categories, Subcategories, Diseases screens.
- Disease detail screen with recordings (NOT in Figma — build per `project.md`).
- General Ruqyah quick-launch.
- Debounced, synonym-tolerant search.
- Favorites (diseases only).

## PHASE 4 — Adhkar & Tahsinat Modules ⬜
- Adhkar tabs (Morning, Evening, Sleep, Waking) with counters, daleel, prev/next.
- Tahsinat tabs (Self, For Others) with repeats, hints, random-order support.

## PHASE 5 — Quran (Mushaf) Module ✅ functionality / 🟡 styling
Functionality is **complete and shipped** (surah list, reader, audio player, verse
highlighting, offline text + audio). Remaining work: **restyle to the Figma only**
(RULE_41). Do not change behaviour, hooks, or service contracts. Do not build the
obsolete 604-page image reader.

## PHASE 6 — Audio & Offline Features ⬜
- `AudioPlayer` + `MiniPlayer` for ruqyah recordings (`expo-audio`, `playerSlice`).
- Download manager with progress/cancel/retry, Wi-Fi-only, tier limits.
- Offline action queue + reconnect processing.
- "My Downloads" screen.

## PHASE 7 — Additional Features ⬜
- Ask Me AI chat (confirm backend endpoint first — not in current `api.php`).
- Courses listing with WhatsApp action.
- Sponsors list.
- Feedback ("Was this useful? Yes/No" + comment).
- Feature visibility (fetch on launch, cache offline, hide disabled).
- Notifications: prayer-time scheduling + wake detection (`notifications.md`).

## PHASE 8 — Settings & Polish ⬜
- "More" screen: settings, downloads, sponsors, courses.
- Theme + language toggles (via `settingsSlice` bridge).
- Notification preferences.
- Mushaf settings (font size, translation).
- Wi-Fi-only downloads toggle, logout, version info.

## EXECUTION NOTES
- Phases 2–8 each follow: types → service → slice → hooks → components → screen →
  wire navigation → verify against the Figma.
- The Mushaf restyle (Phase 5) can run in parallel and independently — it touches
  only styling.
- Building Figma-accurate screens needs the Figma MCP connector or exported
  screenshots; raw URLs are not readable by Claude.
- Confirm request/response shapes against the backend controllers at the start of
  each feature phase, then record them in `src/types/`.
```

---

# FILE: .claude/mobile/project.md

```
# QURANIC CLINIC — MOBILE (React Native Expo)

> Plan document. Cross-component rules live in `.claude/shared-context.md`.
> Mobile environment rules (ngrok, `app/` vs `src/` layout, package API versions,
> auth bypass, offline mode, existing Mushaf key files) live in
> `.claude/mobile/CLAUDE.md` — **read it before touching any file**.

## PROJECT IDENTITY
- Name: Quranic Clinic (Al-Mashfa Al-Qurani)
- Path: `C:\Users\wael\Desktop\Quran\mobile`
- Stack: React Native 0.81.5 · Expo SDK 54 · Expo Router v6 · TypeScript 5.7 (strict)
- Server state: TanStack React Query v5
- Client / app state: Redux Toolkit + redux-persist
- UI: Custom components on React Native `StyleSheet` + in-house Theme system — **no component library**
- Navigation: Expo Router v6 (file-based)
- Storage: `expo-sqlite` ~16 (offline text cache) · `expo-file-system` ~19 legacy (audio files) · `AsyncStorage` (key-value persistence) · `expo-secure-store` (auth token)
- Audio: existing Mushaf uses `expo-av`; new audio uses `expo-audio` (see CLAUDE.md package rules)
- Test runtime: Expo Go on physical Android devices, backend tunnelled via ngrok

## ⚠ ARCHITECTURE DECISIONS (supersede the original draft)
The original draft plan named Redux + React Native Paper + MMKV + Formik. Confirmed:

1. **STATE** — Redux Toolkit is the **primary client/app-state layer**. React Query
   handles **server state only** (fetching, caching, mutations, pagination,
   background refetch). Do not push app-wide business state into React Query.
   See `store-design.md`.
2. **UI** — Custom `StyleSheet` components + the existing Theme system.
   React Native Paper is **not** used. See `components-design.md`.
3. **PERSISTENCE** — `redux-persist` backed by `AsyncStorage`.
   `react-native-mmkv` is **not** used — it cannot run in Expo Go (the test runtime).
4. **FORMS** — Few real forms exist (OAuth login, feedback, notification prefs).
   Use controlled components + small validators. Formik/Yup optional, only if a
   genuinely complex form appears; they are not installed.
5. **MUSHAF** — already built and shipped. **Do not change its behaviour.**
   Only restyle it to the Figma. See "Existing Mushaf" below and `screens-design.md`.

## FIGMA DESIGN REFERENCE (single source for visual design)
Figma: https://www.figma.com/design/Yp5TOhLhIxZZmCRu3N0EfV/%D8%A7%D9%84%D9%85%D8%B4%D9%81%D9%89-%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86%D9%8A?node-id=12317-1780&p=f&t=c77LA8yKwWxlNZkZ-0

- Every screen's layout, colours, spacing, and typography must match the Figma.
- **Disease detail page (3rd level) is NOT prototyped in the Figma.** Implement it as:
  disease name + full description, favorite button, recordings list (1st / 2nd / 3rd
  session), audio player, per-recording download button, feedback section
  ("Was this useful? Yes / No" + optional comment). Recordings belong to the
  **disease** level — not the subcategory.
- To build screens accurately, Claude needs either the Figma MCP connector enabled
  or exported screenshots/specs per screen. Plain URLs are not readable by Claude.

## CONTENT HIERARCHY (from SRS)
`Category → Subcategory → Disease → Recording (1st / 2nd / 3rd session)`
A Category may also hold Diseases directly (no Subcategory).
Any level (Category, Subcategory, or Disease) can be TERMINAL by holding recordings directly.
A terminal node has no children — the CMS enforces this constraint.
When navigating, check `has_direct_recordings` on the current node: if true, redirect
immediately to the Ruqyah recordings page and skip the next drill-down level.
Full routing and terminal-redirect rules in `hierarchy-navigation.md`.

## BUSINESS RULES (from SRS)
- **General Ruqyah** — quick-launch button plays the `is_general` disease audio
  immediately, with no intermediate screens.
- **Favorites** — DISEASES only. Not adhkar, not Quran, not courses. Store `disease_id`.
- **Recording access** — each disease/subcategory/category has at most TWO recordings:
  `type=summarized` (مختصرة) free for everyone; `type=detailed` (مطوّلة) requires an active
  subscription or trial. The record screen switches types ONLY via the segmented type tabs
  (Figma 19214:3234) — no wird numbering and no swapping inside the reader area.
  Single source: `.claude/shared-context.md` → RECORDING TYPES.
- **Search** — tolerant of synonyms/aliases, supports Arabic and English.
- **Adhkar** — categories: Morning, Evening, Sleep, Waking.
- **Tahsinat** — categories: Self-fortification, Fortification for others.
- **Quran (Mushaf)** — see "Existing Mushaf" — already implemented, restyle only.
- **Offline** — downloaded ruqyah audio plays from cache; no silent auto-cache;
  a dedicated download button per recording.
- **Sponsor screen** — shown at every app launch when enabled by an admin flag.
- **Feature visibility** — admin flags fetched on launch decide which features show.
- **Onboarding** — welcome screens appear on first launch only, auto-transition.

## EXISTING MUSHAF — ALREADY BUILT (do not corrupt)
The original draft described a 604-page WebP image reader. **That is not what was
built.** The shipped Mushaf is **surah + audio-recitation** based:

- `app/(tabs)/mushaf.tsx` — surah list with a reciter selector.
- `app/mushaf/[id].tsx` — one surah: verse list (Arabic, EN toggle), audio player
  with seek bar, per-verse highlight synced to recitation timing, prev/next surah,
  per-reciter download button.
- State via `MushafContext` (`selectedSurahId`, `selectedReciterId`).
- Services: `quranService`, `offlineStorage` (SQLite text cache), `audioService`.
- Hooks: `useSurahs`, `useSurah`, `useReciters`, `useAudio`, `useVerseTiming`.

**Scope of allowed Mushaf work: restyle to the Figma only.** Keep all functionality,
hook APIs, and service contracts identical. Any state migration to Redux must be
behaviour-preserving (see `store-design.md` → "Existing Context bridge").

## DIRECTORY STRUCTURE — current (✓) and target (＋)
```
mobile/
├── app/                          # Expo Router — screen components ONLY
│   ├── (tabs)/
│   │   ├── _layout.tsx           ✓ tab navigator (Home, Mushaf today)
│   │   ├── index.tsx             ✓ Home
│   │   ├── mushaf.tsx            ✓ Surah list
│   │   ├── hospital.tsx          ＋ Categories / Ruqyah
│   │   ├── adhkar.tsx            ＋ Adhkar tabs
│   │   ├── tahsinat.tsx          ＋ Tahsinat tabs
│   │   ├── favorites.tsx         ＋ Favorited diseases
│   │   └── more.tsx              ＋ Settings / downloads / sponsors / courses
│   ├── mushaf/[id].tsx           ✓ Quran reader
│   ├── hospital/                 ＋ subcategories/[slug], diseases/[slug], disease/[slug]
│   ├── ask-me.tsx                ＋ AI chat
│   ├── _layout.tsx               ✓ root layout (auth bypass lives here)
│   └── login.tsx                 ✓ login (unreachable while auth bypassed)
├── src/
│   ├── auth/                     ✓ AuthProvider
│   ├── components/               ✓ AppSplash — ＋ common/ forms/ lists/ players/ quran/ layout/ onboarding/
│   ├── context/                  ✓ Auth, Language, Mushaf, Theme (bridged to Redux — see store-design.md)
│   ├── hooks/                    ✓ useAudio, useReciters, useSurah, useSurahs, useVerseTiming — ＋ feature hooks
│   ├── i18n/                     ✓ ar.ts, en.ts
│   ├── lib/                      ✓ tokenManager
│   ├── navigation/               ✓ navigation.styles
│   ├── providers/                ✓ QueryProvider, config — ＋ StoreProvider
│   ├── services/                 ✓ api, audioService, googleAuth, offlineStorage, quranService — ＋ feature services
│   ├── store/                    ＋ store.ts, hooks.ts, slices/
│   ├── styles/                   ✓ home, mushaf, reader — ＋ per-screen styles
│   ├── theme/                    ✓ colors — ＋ spacing, typography tokens
│   ├── types/                    ✓ recitation, reciter, surah, translatable, verse — ＋ feature types
│   └── utils/                    ＋ cacheKeys, formatters, validators
└── assets/                       ✓ app icons (no 604-page mushaf images — not used)
```

## CORE ARCHITECTURE RULES (summary — full list in `rules.md`)
- Separate logic from UI: hooks/selectors hold logic, components render.
- Server state → React Query. App/client/UI state → Redux Toolkit slices.
- Memoize: `useMemo`, `useCallback`, `React.memo`, `createSelector`.
- Optimized `FlatList` for every list. No inline styles/objects/functions in props.
- Strict TypeScript — no `any`. Cross-directory imports use the `@/` alias.
- Every backend request sends `Accept: application/json` + `ngrok-skip-browser-warning: true`.

## READY SIGNAL
Mobile plan loaded. Stack reconciled to the real codebase. Mushaf = restyle only.
Build roadmap and status in `phase-assignment.md`.
```

---

# FILE: .claude/mobile/rules.md

```
# MOBILE GOLDEN RULES

Reconciled with the real codebase and the confirmed architecture decisions
(`project.md` → "Architecture Decisions"). Environment rules that are not repeated
here: see `.claude/mobile/CLAUDE.md` (ngrok, directory layout, package API
versions, auth bypass, offline mode) and `.claude/shared-context.md` (API response
envelope, HTTP status codes, rate limiting, file-size limit).

## ARCHITECTURE

- RULE_1 SEPARATE_LOGIC_FROM_UI — hooks/selectors hold logic, components render.
- RULE_2 REACT_QUERY_FOR_SERVER — all API fetching/caching/mutations via React Query.
- RULE_3 REDUX_FOR_APP_STATE — Redux Toolkit owns auth/session, subscription, audio
  player, downloads/offline, feature flags, onboarding/sponsor, favorites, settings,
  notifications, Mushaf reader state, global UI state. See `store-design.md`.
- RULE_4 NO_BUSINESS_STATE_IN_REACT_QUERY — React Query is server cache only; do not
  store app-wide business state in it.
- RULE_5 STATE_SEPARATION — keep three layers distinct: (1) server state = React
  Query, (2) application state = Redux slices, (3) ephemeral UI state = local
  component state or `uiSlice`.
- RULE_6 MODULAR_SLICES — one slice per domain, colocated selectors, typed hooks.
- RULE_7 REDUX_THUNK — use `createAsyncThunk` for async flows that touch multiple
  slices or coordinate with React Query.
- RULE_8 SELECTOR_MEMOIZATION — derived data via `createSelector`; never compute in
  `mapState`/inline.
- RULE_9 REDUX_PERSIST — persist auth, favorites, settings, onboarding, feature-flag
  cache, downloads index, notification prefs, Mushaf reader state via `redux-persist`
  + `AsyncStorage`. The auth **token** stays in `expo-secure-store`, not persisted state.

## UI & STYLING

- RULE_10 CUSTOM_UI_ONLY — build components with `StyleSheet`. No React Native Paper
  or other component library.
- RULE_11 NO_INLINE_STYLES — styles come from `StyleSheet.create`, defined outside
  the component or memoized when theme-dependent.
- RULE_11a SEPARATE_STYLES_FILE — every component with styles MUST have a sibling
  `ComponentName.styles.ts` file. Never put `StyleSheet.create` inside a `.tsx` file.
  Export as `export const myComponentStyles = StyleSheet.create({...})` and import as
  `import { myComponentStyles as s } from './MyComponent.styles'`.
- RULE_11b COLOR_CONSTANTS — in `.styles.ts` files, declare each color as a standalone
  `const BRAND_500 = '#hex'` (SCREAMING_SNAKE_CASE). Never group colors into an object
  (`const FIGMA = {}`, `const F = {}`, etc.).
- RULE_11c LAYOUT_FILES_THIN — files under `app/**/_layout.tsx` must be pure
  re-exports with zero logic, zero styles, and zero JSX. Move all navigation/screen
  config into a named component in `src/components/layout/`, then re-export it:
  `export { MyLayout as default } from '@/components/layout/MyLayout'`.
- RULE_12 THEME_SYSTEM — colours/spacing/typography come from the Theme system
  (`src/theme/`), consumed via `useTheme`. No hard-coded hex in components.
- RULE_13 FIGMA_FIDELITY — layout, colours, spacing, typography match the Figma
  (`project.md` → Figma reference).
- RULE_14 RTL_AND_I18N — Arabic/English supported; respect RTL where the Figma does;
  text comes from `src/i18n/`.

## PERFORMANCE

- RULE_15 MEMOIZE — `useMemo` for derived data, `useCallback` for handlers passed to
  children, `React.memo` for pure list items.
- RULE_16 NO_INLINE_PROPS — no inline arrow functions, objects, or arrays in props.
- RULE_17 OPTIMIZED_LISTS — `FlatList` with `useCallback` `renderItem`/`keyExtractor`,
  `removeClippedSubviews`, `maxToRenderPerBatch`, `windowSize`, `getItemLayout` for
  fixed-height rows.
- RULE_18 DEBOUNCE_SEARCH — `useDebounce` (300 ms) on all search inputs.
- RULE_19 LAZY_MEDIA — `expo-image` with placeholders; load only visible/adjacent
  heavy content; clean up audio resources on unmount.

## CODE QUALITY

- RULE_20 TYPE_SAFETY — strict TypeScript, no `any`, explicit interfaces in `src/types/`.
- RULE_21 IMPORT_ALIAS — ALL cross-directory imports MUST use `@/` alias; NEVER use `../` or `./` for imports outside the current directory. Example: `import { styles } from '@/styles/components/Button.styles'` not `import { styles } from '../../styles/components/Button.styles'`.
- RULE_22 SCREENS_ONLY_IN_APP — only files with `export default function Screen()` go
  in `app/`. Hooks/services/types/components live in `src/`.
- RULE_23 CACHE_KEYS — centralized React Query keys in `src/utils/cacheKeys.ts`.
- RULE_24 CUSTOM_HOOKS — extract reusable logic into hooks (`src/hooks/`).
- RULE_25 FILE_SIZE — honour the 450-line limit (see `shared-context.md`); split
  large files.

## BACKEND INTEGRATION

- RULE_26 BACKEND_HEADERS — every request includes `Accept: application/json` and
  `ngrok-skip-browser-warning: true`.
- RULE_27 RESPONSE_ENVELOPE — backend returns `{ success, data, message, meta, errors }`
  (see `shared-context.md`); services unwrap `data`.
- RULE_28 AUTH_TOKEN — request interceptor adds the bearer token from
  `expo-secure-store`; 401 → clear auth, 403 → subscription-required handling.

## DOMAIN

- RULE_29 HIERARCHY — Category → Subcategory → Disease → Recording.
- RULE_30 FAVORITES_DISEASES_ONLY — favorites store `disease_id` only.
- RULE_31 GENERAL_RUQYAH — quick-launch button plays the `is_general` disease audio
  directly, no intermediate screens.
- RULE_32 RECORDING_TYPES — max two recordings per owner: `summarized` (مختصرة) free;
  `detailed` (مطوّلة) requires subscription or trial. The wird screen switches types ONLY
  via the segmented type tabs (Figma 19214:3234) — no wird numbering, no swapping inside
  the reader area. Single source: `../shared-context.md` → RECORDING TYPES.
- RULE_33 ADHKAR_CATEGORIES — Morning, Evening, Sleep, Waking.
- RULE_34 TAHSINAT_CATEGORIES — Self, For Others; honour `random_order` when set.
- RULE_35 OFFLINE_FIRST — downloaded audio plays from cache; SQLite caches Quran/adhkar
  text; queue offline actions and retry on reconnect (see `offline-sync.md`).
- RULE_36 DOWNLOAD_MANAGER — dedicated per-recording download button, progress,
  cancel, retry, Wi-Fi-only default; free users may download the summarized recording only.
- RULE_37 SPONSOR_SCREEN — show at every launch when the admin flag is on.
- RULE_38 FEATURE_VISIBILITY — fetch flags on launch, cache offline, hide disabled.
- RULE_39 ONBOARDING_ONCE — welcome screens on first launch only, auto-transition.
- RULE_40 BACK_BUTTON — `router.back()` returns to the previous screen, never forces Home.

## FIGMA

- RULE_44 FIGMA_URL — https://www.figma.com/design/Yp5TOhLhIxZZmCRu3N0EfV/%D8%A7%D9%84%D9%85%D8%B4%D9%81%D9%89-%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86%D9%8A?node-id=12317-1780&p=f&t=c77LA8yKwWxlNZkZ-0

- RULE_45 DISEASE_PAGE_NOT_IN_FIGMA — the disease detail page is not prototyped;
  implement per `project.md` (name, description, favorite, recordings, player,
  download, feedback).

- RULE_46 FIGMA_ACCESS_PROTOCOL — When implementing from Figma, follow this exact sequence:

  1. **FIRST** — Verify MCP server is running at `http://127.0.0.1:3845/sse` using config file `C:\Users\wael\Desktop\Quran\.vscode\mcp.json`

  2. **SECOND** — Make exactly ONE attempt to fetch node data via MCP metadata tool with node_id parameter

  3. **THIRD** — If MCP metadata tool rejects the node_id parameter OR connection fails, immediately abort MCP and switch to direct Figma REST API:
     - Endpoint: `https://api.figma.com/v1/files/{FILE_KEY}/nodes?ids={NODE_ID}`
     - Headers: `{ "X-Figma-Token": "YOUR_PERSONAL_ACCESS_TOKEN" }`
     - Extract FILE_KEY and NODE_ID from RULE_44 FIGMA_URL

  4. **FOURTH** — Extract ALL styling in that single REST API call (colors, typography, spacing, layout, fills, effects)

  5. **FIFTH** — Cache extracted styles locally before writing any component code

  6. **NEVER** — Use screenshot tool (`get_screenshot`) as fallback

  7. **NEVER** — Retry failed connections more than once

  8. **NEVER** — Waste tokens on polling, reconnection loops, or repeated metadata tool calls
```

---

# FILE: .claude/mobile/screens-design.md

```
# SCREENS DESIGN

Each screen is a container: it calls hooks, wires Redux, and composes presentational
components. Every screen renders inside `<Screen>` (`components/layout`). Layouts,
colours, and spacing come from the Figma (`project.md`).

## ✓ BUILT — RESTYLE ONLY

### app/(tabs)/index.tsx — Home
Built. Restyle to the Figma. Target content: General Ruqyah quick-launch button,
categories entry, Mushaf entry, sponsor banner. Confirm exact composition from the
Figma before changing structure.

### app/(tabs)/mushaf.tsx — Surah list
Built. Surah list + reciter selector + bookmark/search affordances. **Restyle only** —
keep functionality, hooks, and `MushafContext` usage intact.

### app/mushaf/[id].tsx — Quran reader
Built. Verse list (AR + EN toggle), audio player with seek bar, per-verse highlight
synced to recitation timing, prev/next surah, per-reciter download. **Restyle only.**

### app/login.tsx — Login
Built; unreachable while auth is bypassed. Restyle when auth is re-enabled.

## ＋ TO BUILD

### app/(tabs)/hospital.tsx — Hospital / Ruqyah
Category grid/list + debounced `SearchBar` (disease search). Tapping a category →
`/hospital/subcategories/[slug]`. Hooks: `useCategories`, `useDiseaseSearch`.

### app/hospital/subcategories/[slug].tsx
Subcategory list for a category, with disease counts. Hook: `useCategory(slug)`.

### app/hospital/diseases/[slug].tsx
Disease list for a subcategory: name, short description, recording count, favorite
icon. Hooks: `useSubcategory(slug)`, `useFavorites`.

### app/hospital/disease/[slug].tsx — Disease detail (NOT IN FIGMA — implement per spec)
Disease name + full description, favorite button, recordings list (1st free; 2nd & 3rd
locked for free users), `AudioPlayer`, per-recording `DownloadButton`, share, feedback
section. Hooks: `useDisease`, `useRecordings`, `useFavorites`, `usePlayer`,
`useDownloadManager`.

### app/(tabs)/adhkar.tsx — Adhkar
Tab view: Morning, Evening, Sleep, Waking. Items with repeat counters, daleel button,
prev/next navigation. Lazy-load each tab on selection. Hook: `useAdhkar`.

### app/(tabs)/tahsinat.tsx — Tahsinat
Tab view: Self, For Others. Items with label, text, repetitions, hint; random-order
support; repeat counter. Hook: `useTahsinat`.

### app/(tabs)/favorites.tsx — Favorites
List of favorited diseases; tap to open detail (or play per Figma); swipe to remove;
sync-status indicator. Hook: `useFavorites`.

### app/(tabs)/more.tsx — More
My Downloads (list, storage usage, remove, clear all), sponsors list, courses
(WhatsApp button), notification preferences, theme toggle, language toggle, Mushaf
settings, Wi-Fi-only downloads toggle, logout, version info, Ask Me entry. Hooks:
`useDownloadManager`, `useSponsors`, `useCourses`, `useNotificationPreferences`,
`useSettings`.

### app/ask-me.tsx — Ask Me (AI chat)
Conversational interface that routes users to app sections or gives written guidance.
Graceful offline degradation ("No internet connection"). Backend AI endpoint TBD —
confirm before building (not in the current `api.php`).

## ONBOARDING & SPONSOR (overlays, not tabs)
- Onboarding pager — first launch only, auto-transition (`onboardingSlice`).
- Sponsor screen — every launch when enabled by admin; auto-dismiss after duration.
Both rendered from the root layout before `(tabs)`.

## SCREEN RULES
- Use `Header` with a working back button (`router.back()` — RULE_40).
- Loading → `Loader`; empty → `EmptyState`; error → `ErrorBoundary` / error view.
- Screens hold container logic; visual pieces are presentational components.
- Respect feature-visibility flags — hide a screen's entry point if its flag is off.
```

---

# FILE: .claude/mobile/services-design.md

```
# SERVICES DESIGN

Services are the only layer that talks to the backend or device storage. Hooks call
services; components never call services directly. Response envelope is
`{ success, data, message, meta, errors }` — services return the unwrapped `data`.

## BACKEND ENDPOINTS (verified from `backend/routes/api.php`)
Base path `/api`. Public unless marked 🔒 (requires `auth:sanctum`).

| Method | Endpoint | Used by |
|---|---|---|
| POST | `/auth/google/callback` | authService |
| POST | `/register` · `/login` | authService |
| GET | `/surahs` · `/surahs/{id}` | quranService ✓ |
| GET | `/surahs/{surahId}/recitations` | quranService ✓ |
| GET | `/verses/search` | quranService |
| GET | `/reciters` · `/reciters/{id}` | quranService ✓ |
| GET | `/recitations/{id}/audio` · `/recitations/{id}/download` | quranService ✓ |
| GET | `/categories` · `/categories/{slug}` | ruqyahService |
| GET | `/subcategories/{slug}` | ruqyahService |
| GET | `/diseases` · `/diseases/search` · `/diseases/{slug}` | ruqyahService |
| GET | `/general-ruqyah` | ruqyahService |
| GET | `/recordings` · `/recordings/{id}/stream` | ruqyahService |
| POST | `/recordings/{id}/play` | ruqyahService |
| GET | `/adhkar/categories` · `/adhkar/categories/{slug}/items` | adhkarService |
| GET | `/adhkar/today` · `/adhkar/waking` | adhkarService |
| GET | `/tahsinat/categories` · `/tahsinat/categories/{slug}/items` | tahsinatService |
| GET | `/courses` | courseService |
| GET | `/sponsors` · `/sponsor-screen` | sponsorService |
| GET | `/features` | featureService |
| 🔒 GET | `/me` · POST `/logout` | authService |
| 🔒 GET | `/favorites` · POST `/favorites/toggle` | favoriteService |
| 🔒 POST | `/feedback` | feedbackService |
| 🔒 GET/POST | `/notifications/preferences` · POST `/notifications/token` | notificationService |

Request/response field shapes must be confirmed against the backend controllers
and API Resources during Phase 1, then captured in `src/types/`.

## HTTP CLIENT
- `src/services/api.ts` — ✓ exists: exports `API_URL` and `API_HEADERS`
  (`Accept: application/json` + `ngrok-skip-browser-warning: true`).
- `src/services/apiClient.ts` — ＋ new: an `axios` instance for all new services.
  - `baseURL = API_URL`, default headers from `API_HEADERS`.
  - Request interceptor: attach `Authorization: Bearer <token>` from `expo-secure-store`.
  - Response interceptor: unwrap `data`; on 401 → dispatch `clearAuth`; on 403 →
    surface a subscription-required error; on network error → let offline fallbacks run.
- `quranService.ts` (✓ existing) uses native `fetch` and **stays as-is** to avoid
  touching the Mushaf. Optionally migrate it to `apiClient` later, behaviour-preserving.

## SERVICE MODULES

### authService.ts ＋
`loginWithGoogle(idToken)` · `register(payload)` · `login(payload)` · `getMe()` ·
`logout()`. Token persisted via `src/lib/tokenManager.ts` (secure-store).

### quranService.ts ✓ (exists — do not change contract)
`getSurahs(page,perPage)` · `getSurah(id)` · `getReciters(page,perPage)` ·
`getReciter(id)` · `getSurahRecitations(surahId)`.

### ruqyahService.ts ＋
`getCategories()` · `getCategory(slug)` (includes subcategories) ·
`getSubcategory(slug)` (includes diseases) · `getDiseases(params)` ·
`searchDiseases(query)` · `getDisease(slug)` · `getGeneralRuqyah()` ·
`getRecordings(diseaseId)` · `getRecordingStreamUrl(id)` · `incrementPlayCount(id)`.

### adhkarService.ts ＋
`getAdhkarCategories()` · `getAdhkarItems(slug)` · `getTodayAdhkar()` ·
`getWakingAdhkar()`.

### tahsinatService.ts ＋
`getTahsinatCategories()` · `getTahsinatItems(slug)`.

### courseService.ts ＋
`getCourses()`.

### sponsorService.ts ＋
`getSponsors()` · `getSponsorScreen()` (config: enabled, sponsor, durationMs).

### featureService.ts ＋
`getFeatures()` → flag map; result cached into `featuresSlice` / persist.

### favoriteService.ts ＋
`getFavorites()` · `toggleFavorite(diseaseId)`.

### feedbackService.ts ＋
`submitFeedback({ diseaseId, recordingId?, useful, comment? })`.

### notificationService.ts ＋ (API portion)
`getPreferences()` · `savePreferences(payload)` · `registerPushToken(token)`.
Device-side scheduling/wake-detection is covered in `notifications.md`.

## STORAGE & DEVICE SERVICES

### offlineStorage.ts ✓ (exists — extend, don't break)
`expo-sqlite` ~16 async API. Currently caches surahs, verses, recitations.
Extend with adhkar/tahsinat text caching and downloaded-audio index as needed.

### audioService.ts ✓ (exists — extend, don't break)
`expo-file-system/legacy`. Currently: download + cache-check for Mushaf recitations
keyed by `surah_{id}_reciter_{id}.mp3`. Extend for ruqyah recordings keyed by
`recording_{id}.mp3`: `downloadAudio`, `isAudioCached`, `getLocalPath`,
`deleteAudio`, `cancelDownload`, `getStorageUsage`, `clearAllDownloads`.

### googleAuth.ts ✓ (exists)
Google OAuth helper — currently unused while auth is bypassed.

## SERVICE RULES
- Services are pure async functions — no React, no Redux imports.
- Hooks own caching policy (React Query) and dispatch results into Redux.
- Every service request carries the two backend headers (RULE_26).
- Offline fallbacks (SQLite, cached audio) live in the hook layer, not the service —
  matching the existing `useSurah`/`mushaf/[id]` pattern.
```

---

# FILE: .claude/mobile/store-design.md

```
# REDUX TOOLKIT STORE DESIGN

Redux Toolkit is the **primary client/app-state layer**. React Query owns server
state only. Keep three layers strictly separate:

| Layer | Owner | Examples |
|---|---|---|
| Server state | React Query | categories, diseases, recordings, adhkar, surahs, courses |
| Application state | Redux slices | auth, subscription, player, downloads, favorites, settings |
| Ephemeral UI state | local `useState` / `uiSlice` | input focus, expanded rows, toasts |

We use **TanStack React Query** (already in the project) for server state — **not**
RTK Query — to avoid two competing data layers.

## STORE LAYOUT
```
src/store/
├── store.ts          # configureStore + redux-persist + middleware
├── hooks.ts          # useAppDispatch, useAppSelector (typed)
├── rootReducer.ts    # combineReducers
└── slices/
    ├── authSlice.ts
    ├── playerSlice.ts
    ├── downloadsSlice.ts
    ├── favoritesSlice.ts
    ├── featuresSlice.ts
    ├── onboardingSlice.ts
    ├── settingsSlice.ts
    ├── notificationsSlice.ts
    ├── mushafSlice.ts
    ├── offlineQueueSlice.ts
    └── uiSlice.ts
```
`StoreProvider` (`src/providers/StoreProvider.tsx`) wraps the app with `<Provider>`
+ `<PersistGate>`, nested inside the existing `QueryProvider`.

## SLICES

### authSlice — authentication / session / subscription
- State: `user`, `token` (mirror only — source of truth is secure-store),
  `status` ('idle'|'authenticating'|'authenticated'|'error'), `error`,
  `subscriptionTier` ('free'|'paid'), `trialActive`, `trialUsedCount`.
- Reducers: `setUser`, `clearAuth`, `setSubscription`, `setStatus`.
- Thunks: `loginWithGoogle`, `register`, `login`, `logout`, `fetchMe`.
- Selectors: `selectIsAuthenticated`, `selectIsPaid`, `selectCanAccessSession(n)`
  (summarized recording → true; detailed → paid or trial).
- Note: auth is **bypassed for development** (see CLAUDE.md). The slice exists and is
  wired, but `_layout.tsx` does not gate on it. Do not re-enable the guard unasked.

### playerSlice — global audio player (ruqyah recordings)
- State: `currentRecording`, `diseaseId`, `isPlaying`, `positionMillis`,
  `durationMillis`, `playbackRate`, `volume`, `source` ('stream'|'local'),
  `isLoading`, `miniPlayerVisible`.
- Reducers: `setRecording`, `play`, `pause`, `stop`, `setProgress`, `seek`,
  `setRate`, `setVolume`, `showMiniPlayer`, `hideMiniPlayer`.
- Thunks: `loadAndPlayRecording`, `playGeneralRuqyah`.
- The audio engine (`expo-audio`) is driven by the `usePlayer` hook, which dispatches
  progress/state into this slice. The existing Mushaf player is separate (see below).

### downloadsSlice — offline downloads
- State: `tasks` (record by `recordingId`: status, progress, totalBytes, error),
  `completed` (record of downloaded items: localPath, size, downloadedAt),
  `storageUsed`, `wifiOnly` (default `true`).
- Reducers: `startTask`, `updateProgress`, `completeTask`, `failTask`,
  `cancelTask`, `removeDownload`, `setWifiOnly`, `setStorageUsed`, `clearAll`.
- Thunks: `downloadRecording`, `deleteDownload`, `recomputeStorage`.
- `completed` + `wifiOnly` are persisted; live `tasks` are not.

### favoritesSlice — favorited diseases (diseases only)
- State: `diseaseIds` (number[]), `syncStatus` ('idle'|'syncing'|'synced'|'error').
- Reducers: `setFavorites`, `addFavorite`, `removeFavorite`, `toggleFavorite`,
  `clearFavorites`.
- Thunks: `fetchFavorites`, `syncFavorites` (POST `/favorites/toggle`; queues to
  `offlineQueueSlice` when offline).
- Selectors: `selectIsFavorited(diseaseId)` via `createSelector`.

### featuresSlice — feature visibility flags
- State: `flags` (record<string, boolean>), `fetchedAt`, `status`.
- Reducers: `setFlags`.
- Thunks: `fetchFeatures` (GET `/features` on launch; result cached/persisted for
  offline). Selector `selectIsFeatureVisible(key)`.

### onboardingSlice — onboarding & sponsor flow
- State: `hasCompletedOnboarding` (persisted), `sponsorShownThisSession` (not
  persisted), `currentStep`.
- Reducers: `completeOnboarding`, `markSponsorShown`, `setStep`, `resetSession`.

### settingsSlice — app settings / preferences
- State: `theme` ('light'|'dark'|'system'), `language` ('ar'|'en').
- Reducers: `setTheme`, `setLanguage`.
- Fully persisted. Backs the Theme/Language context bridge (see below).

### notificationsSlice — notification preferences
- State: `adhkarMorning`, `adhkarEvening`, `adhkarSleep`, `adhkarWaking` (booleans),
  `wakingStartTime`, `wakingEndTime`, `pushToken`.
- Reducers: `setAdhkarPref`, `setWakingHours`, `setPushToken`.
- Thunks: `fetchPreferences`, `savePreferences` (sync with backend).

### mushafSlice — Mushaf reader state
- State: `selectedSurahId`, `selectedReciterId`, `fontSize`, `showTranslation`.
- Reducers: `setSelectedSurah`, `setSelectedReciter`, `setFontSize`,
  `toggleTranslation`.
- ⚠ The shipped Mushaf currently keeps this in `MushafContext`. This slice is the
  **target**. Migration is optional and must be behaviour-preserving — see below.

### offlineQueueSlice — queued offline actions
- State: `queue` (items: id, type 'favorite'|'feedback'|'playCount', payload,
  timestamp, retryCount), `processing`.
- Reducers: `enqueue`, `dequeue`, `incrementRetry`, `setProcessing`, `clearQueue`.
- Thunks: `processQueue` (runs on reconnect; drops after 3 failed retries).

### uiSlice — global UI state
- State: `networkOnline`, `activeToast`, `activeModal`, per-tab selections for
  Adhkar/Tahsinat tab views.
- Reducers: `setNetworkOnline`, `showToast`, `dismissToast`, `setModal`,
  `setAdhkarTab`, `setTahsinatTab`.
- Not persisted.

## PERSISTENCE (`redux-persist` + `AsyncStorage`)
- Persisted slices: `auth` (without `token`), `favorites`, `settings`, `onboarding`
  (`hasCompletedOnboarding` only), `features`, `downloads` (`completed` + `wifiOnly`),
  `notifications`, `mushaf`, `offlineQueue`.
- Not persisted: `player`, `ui`, live `downloads.tasks`.
- The auth **token** lives in `expo-secure-store` (`src/lib/tokenManager.ts`), never
  in persisted Redux state. On launch, `authSlice` rehydrates the token from
  secure-store and validates it via `fetchMe`.
- `configureStore` middleware: ignore `redux-persist` action types in
  `serializableCheck`.

## TYPED HOOKS & SELECTORS
- `src/store/hooks.ts` exports `useAppDispatch` and `useAppSelector` typed against
  `AppDispatch` / `RootState`.
- All derived data uses `createSelector`. Co-locate selectors with their slice.
- Components never compute derived data inline — they read memoized selectors.

## EXISTING CONTEXT BRIDGE (preserve the Mushaf)
The shipped app uses `AuthContext`, `ThemeContext`, `LanguageContext`,
`MushafContext`. To make Redux the source of truth **without editing Mushaf screens**:

1. Keep the public hook APIs stable — `useTheme()`, `useLanguage()`,
   `useMushafContext()`, `useAuth()` keep the same return shape.
2. Re-implement each provider as a **thin adapter** that reads from the matching
   Redux slice and dispatches on change. Existing call sites compile unchanged.
3. Migrate one context at a time; after each, verify the Mushaf behaves identically.
4. If migrating a context is risky, leave it as plain Context — Redux primacy applies
   to **new** features; a working Mushaf outranks architectural uniformity.

This honours both goals: Redux Toolkit as the primary architecture, and an untouched,
non-corrupted Mushaf feature.
```

---

# FILE: .claude/mobile/styling-convention.md

```
# STYLING CONVENTION & CSS FILE STRUCTURE

## STYLING APPROACH
- Use React Native StyleSheet.create for all styles
- NO inline styles (performance and maintainability)
- NO global CSS files (component-scoped styles only)
- NEVER mix styles inside .tsx component files
- ALWAYS create separate .styles.ts file for each component
- Use BEM-like naming convention for style keys: component__element--modifier
- Export styles object from .styles.ts and import into .tsx

## FILE STRUCTURE
Each component SHALL have a dedicated adjacent stylesheet file:

```
src/components/onboarding/OnboardingPager.tsx        ← JSX only, no StyleSheet
src/components/onboarding/OnboardingPager.styles.ts  ← StyleSheet.create + color constants
```

Export pattern:
```ts
// *.styles.ts
export const myComponentStyles = StyleSheet.create({ ... });

// *.tsx
import { myComponentStyles as s } from './MyComponent.styles';
```

## COLOR CONSTANTS

- Declare each color as a standalone `const` at the top of the `.styles.ts` file.
- Names must be descriptive and SCREAMING_SNAKE_CASE: `BRAND_500`, `TEXT_PRIMARY`, `WHITE`.
- **NEVER** group colors into an object (`const FIGMA = {}`, `const F = {}`, `const C = {}`).
  These collapse distinct semantic colors into an opaque bag and make searching harder.

Correct:
```ts
const BRAND_500 = '#135452';
const TEXT_PRIMARY = '#181d27';
const WHITE = '#ffffff';
```

Wrong:
```ts
const FIGMA = { brand500: '#135452', textPrimary: '#181d27' }; // ❌
const F = { bgPrimary: '#ffffff' };                            // ❌
```

## LAYOUT FILES (app/**/_layout.tsx)

Layout files in `app/` are Expo Router entry points — they must be pure re-exports with
zero logic, zero styles, and zero comments.

```tsx
// app/(tabs)/_layout.tsx  ✅
export { TabsLayout as default } from '@/components/layout/TabsLayout';
```

All navigation logic (hooks, screen options, tab configuration) belongs in the
corresponding component inside `src/components/layout/`.
```

---

# FILE: .claude/prompt-rules.md

```
# ⚠⚠⚠ PROMPT RULES — HIGHEST PRIORITY ⚠⚠⚠

These rules OVERRIDE every other instruction, plan file, agent prompt, and default
behavior in this repository. When any other file conflicts with this one, THIS FILE WINS.

---

## SYSTEM RULES — DO NOT VIOLATE

1. Never modify, refactor, rename, or delete any existing file, function, class, or logic unless I explicitly request it.
2. Never assume intent. If anything is unclear, ask clarifying questions before acting.
3. Only work inside the specific files or code blocks I provide. Do not touch anything else.
4. Preserve all existing business logic, architecture, naming conventions, and data structures exactly as they are.
5. When generating new code, ensure it integrates without breaking existing Laravel backend or React frontend behavior.
6. Never introduce new dependencies, libraries, or architectural patterns unless I explicitly approve them.
7. Never run or suggest destructive commands (migrations that drop data, file deletions, DB wipes, etc.).
8. If you are less than 90% certain about my intent, stop and ask.
9. Always explain the impact of any code you generate on the current system.
10. Your default behavior is: minimal changes, maximum safety.

---

## OUTPUT RULES

- Only produce the code I ask for.
- Do not rewrite unrelated parts.
- Do not optimize or "improve" anything unless I explicitly request optimization.
- Keep responses concise and scoped to the task.
```

---

# FILE: mobile/CLAUDE.md

```
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

### Theme tokens vs. palette — light/dark mode

**Every surface/text/border colour must come from the active `theme` (light/dark aware), NOT from `palette` directly.** `palette` is the raw colour atlas (single source of truth for values); `theme` is the semantic, mode-aware layer built from it in `colors.ts` (`lightTheme` / `darkTheme`, type `Theme`).

- A `.styles.ts` file exports a **factory**: `export const createStyles = (theme: Theme) => StyleSheet.create({ ... })`. Reference `theme.card`, `theme.text`, `theme.primary`, `theme.cardBorder`, etc. — never `palette.*` for a normal surface/text colour.
- The component consumes it with the **`useStyles` hook**: `const s = useStyles(createStyles);` (from `@/hooks/useStyles`). Colours used as JSX props (icon `color=`, `placeholderTextColor=`) come from `const { theme } = useTheme();`.
- Light values of every `theme` token equal the original Figma `palette` colour, so light mode is unchanged; dark values live in `darkTheme`.

**When is a direct `palette.*` ref still correct?** Only for colours that are intentionally **constant across light & dark** — decorative/brand accents (category tile fallbacks `palette.tileFallback`, flag fills `palette.flags`, sponsor logo box, AI mint avatar), semantic warning/error *tints* with no theme token, shadow colour (`palette.shadow`), and the Mushaf **reader** parchment canvas (`reader.styles.ts` is a deliberately preserved fixed surface). Document each such ref inline.

### Rules

1. **All raw colour values live in `src/theme/colors.ts`** (`palette`). Semantic light/dark tokens live in the same file (`lightTheme`/`darkTheme`, `Theme` type).
2. **Themed surfaces/text/borders → `theme.*` via `createStyles(theme)`.** Do **not** create local `FIGMA`, `BRAND_500`, `TEXT_PRIMARY`, `WHITE` constants, and do not reach for `palette.*` when a `theme` token exists.
3. **To add a new semantic colour**, add a token to the `Theme` type + `lightTheme` + `darkTheme` (light value = exact Figma colour). To add a new raw value, add it to `palette`.
4. **Component-specific opacity tints** (e.g. `rgba(255,255,255,0.18)`) and fixed scrims/shadows may remain as local constants when they are not part of the global design system, but they must be documented inline.
5. **No exported colour constants** like `export const ICON_ACTIVE` from a `.styles.ts` — pass `theme.*` from the component instead (the old pattern of exporting `ICON_*`/`*_COLOR` consts has been removed).

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

## Style File Convention — TOP PRIORITY, NON-NEGOTIABLE

**Never mix CSS (styles) with TSX. Styles ALWAYS live in their own file.** This rule
overrides convenience — if a component has an inline `StyleSheet.create`, extract it
before doing anything else, and never introduce a new one.

- Component styles live in a `ComponentName.styles.ts` file **beside** the component file.
- Screen-level styles live in `src/styles/screenName.styles.ts`.
- **Never** place a `StyleSheet.create` block inside a `.tsx` file. The only inline styles
  allowed are trivial one-liners (`{ flex: 1 }`) or values that MUST be dynamic at runtime
  (e.g. a computed `marginTop` from safe-area insets) — and even those stay minimal.

### Themed-factory pattern (the one and only way to define styles)

Every `.styles.ts` exports a **factory** keyed on the active theme, and the component
consumes it with the `useStyles` hook. This is what makes light/dark mode work everywhere.

```ts
// Foo.styles.ts
import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: { backgroundColor: theme.card, borderColor: theme.cardBorder, padding: spacing.lg },
  });
```

```tsx
// Foo.tsx
import { useStyles } from '@/hooks/useStyles';
import { createStyles } from './Foo.styles';

function Foo() {
  const s = useStyles(createStyles);          // memoized, re-themes on toggle
  // const { theme } = useTheme();             // only if a colour is needed as a JSX prop
  return <View style={s.card} />;
}
```

- A themeless factory still takes the param: `(_theme: Theme) => StyleSheet.create({ ... })`.
- Use spacing/typography/radius **tokens** (`spacing.lg`, `fontSize.sm`, `radius.md`), not raw
  numbers, whenever an exact token exists.
- Do **not** export a plain style object (`export const fooStyles = StyleSheet.create(...)`)
  or colour constants — that pattern was fully removed in the theming migration.
- When touching any `.tsx`/`.styles.ts` still on the old static pattern, migrate it to the
  factory as part of the change — do not leave new code that violates this rule.

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

## Type Definition Convention

**Shared, exported types live in `src/types/`; single-use component prop types stay co-located.**

The goal is one obvious home for every type without churning the codebase with needless files.

### What belongs in `src/types/<domain>.ts`

- **Data models** — the shape of anything from the API (`Disease`, `Recording`, `Category`, …).
- **Cross-module contracts** — any `type`/`interface` that is imported by **more than one module**, or
  that is exported from one module and consumed in another (e.g. the `Wird*` source contract in
  `src/types/wird.ts`, consumed by both the hook and the screen).
- One domain per file, named after the domain (`wird.ts`, `disease.ts`). Import via the `@/types/*` alias.
- A type is defined **once**. Do not re-export it from the hook/component that happens to use it —
  point every consumer at `@/types/*` so there is a single source of truth.

### What stays co-located (do NOT move)

- **Component / hook prop types** used by a single file — keep the `type Props = { … }` at the top of
  that `.tsx`/`.ts`. Moving single-use prop shapes into `src/types/` adds import noise for zero benefit
  and is **not** wanted.
- A prop shape only graduates to `src/types/` once a **second** module needs it.

### Rules for Claude

1. New shared/data/contract type → add it to `src/types/<domain>.ts` (create the domain file if absent).
2. Never duplicate a type definition; never re-export it as a convenience — fix the import instead.
3. Leave single-use `Props` types where they are. Don't refactor them into `src/types/` "for tidiness."
4. When a co-located type gains a second consumer, promote it to `src/types/` and update both imports.

## Commenting Convention — Don't Narrate Code

**Do not write comments that describe *what* the code does. Code is the source of truth; let it speak.**

When writing or editing any file, **do not add** a comment unless it carries information the code
cannot. Default to **no comment**. Never add a JSDoc/prose block that just summarizes a function,
hook, or component's behaviour — that is exactly the noise to avoid.

### Remove / never write (useless)

- Prose blocks narrating what a function/hook/component does or returns
  (`/** Recordings metadata for a disease, sorted by session… */`).
- Restatements of the line below them (`// loop over recordings`, `// set loading to true`).
- Decorative section labels that add no information (`// ── Main content area ──`).
- Refactor/history meta (`// behaviour preserved exactly`, `// moved from X`).

### Keep / allowed to write (carries real information)

- **Why**, not what — a non-obvious decision or trade-off
  (`// The summarized (مختصرة) recording is free for all; the detailed (مطولة) one needs a subscription`).
- **Business rules** and edge-case reasoning that aren't evident from the code.
- **Traceability** — Figma node IDs (`Figma node 18032:3119`), ticket refs, spec links.
- **Mandated inline notes** required by other rules in this file — e.g. the Color Convention's
  documentation of each intentional `palette.*` exception. These take precedence; keep them.
- **Concise contract docs on a shared/exported type** in `src/types/*` that explain a field's
  non-obvious meaning (`/** False when the recording is a paid session and the user lacks access. */`).

### Rule of thumb

If deleting the comment loses **no** information a competent reader couldn't get from the code in
~5 seconds, the comment is useless — don't write it (and remove it if you're already editing the
file). When in doubt, prefer a clearer name or smaller function over a comment.

## Linting

ESLint is configured with **Expo's official flat config** (`eslint.config.js`, `eslint-config-expo`).

```bash
npm run lint         # fails on errors only (warnings allowed) — use in CI
npm run lint:strict  # fails on any warning too (use when ratcheting)
npm run lint:fix     # auto-fix
```

- Pin **ESLint to v9** — v10 breaks `eslint-plugin-react-hooks` (`getFilename` removed).
- `eslint-config-expo` enables `eslint-plugin-react-hooks` v6's experimental React-Compiler rules
  (`refs`, `set-state-in-effect`, `immutability`, `preserve-manual-memoization`) as **errors**.
  These flag many correct patterns, so they're downgraded to **warnings** in `eslint.config.js`.
  Don't rewrite app hooks just to satisfy them — that's a React Compiler migration, do it
  deliberately. The codebase currently has 0 errors / ~70 warnings; ratchet warnings down over time.

## Testing Convention

Runner: **Jest + `jest-expo` preset** (`jest.config.js`). The `@/` alias maps to `src/`; tests are
`src/**/*.test.{ts,tsx}`.

```bash
npm test            # run once
npm run test:watch  # watch mode
```

- **Co-locate** tests in a `__tests__/` folder next to the code (e.g.
  `src/store/slices/__tests__/authSlice.test.ts`).
- **Reliable, no-native layers (write these freely):** pure utils (`src/utils/*`), Redux slice
  reducers + selectors (test `reducer(state, action)` and pass a partial `RootState` to selectors),
  and services (mock `@/services/apiClient`).
- A module importing `@/services/api`, `expo-*`, or native modules must be **mocked**
  (`jest.mock('@/services/api', () => ({ API_URL: 'http://test/api' }))`). `jest-expo` mocks most
  Expo native modules already.
- **Hooks** → `renderHook` from `@testing-library/react-native` (+ `jest.useFakeTimers()` for
  time-based hooks). **Components** → `render`/`fireEvent`; mock `@/context/ThemeContext` and
  `@/hooks/useStyles` so the test targets behavior, not styling.
- **Pin `@testing-library/react-native` to v13** — v14 fails to resolve its renderer under this
  jest-expo/React 19 setup (`Cannot find module 'test-renderer'`).
- `jest.config.js` extends the preset's `transformIgnorePatterns` to also transform
  `@reduxjs/toolkit` & the redux ecosystem (jest-expo resolves them to their TS source).
- Never start Expo to run tests; Jest runs standalone.
- Bilingual/locale logic: when testing a locale selector, assert **both** `ar` and `en` paths.

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
```
