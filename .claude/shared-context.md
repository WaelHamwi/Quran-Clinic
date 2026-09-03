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
