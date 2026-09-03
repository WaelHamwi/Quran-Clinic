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
