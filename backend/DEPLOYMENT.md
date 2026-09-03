# Deployment & Scalability Runbook

All scalability features are **opt-in via env flags** and default to the current behavior, so
deploying these changes with no env edits changes nothing. Enable each feature only after the
matching infrastructure step below is done. Central config: `config/scalability.php`.

Feature flags (in `.env`):

| Flag | Default | Effect |
|------|---------|--------|
| `CACHE_STORE` | `database` | `redis` for shared, fast cache + rate limiting |
| `SESSION_DRIVER` | `database` | `redis` for shared sessions |
| `QUEUE_CONNECTION` | `database` | `redis` for the job queue |
| `REDIS_AUTO_FALLBACK` | `true` | If a redis driver is set but unreachable, fall back to file/database |
| `AUDIO_DRIVER` | `local` | `cloud` = future S3/CDN (placeholder, no SDK bundled) |
| `AUDIO_X_ACCEL` | `false` | Offload local audio delivery to Nginx via `X-Accel-Redirect` |
| `AUDIO_X_ACCEL_PREFIX` | `/__audio_internal` | Internal Nginx location mapping to `storage/app/public` |
| `SEARCH_USE_FULLTEXT` | `false` | Disease search uses MySQL FULLTEXT instead of LIKE |
| `SCALABILITY_CACHE_WARN` | `true` | Log a warning if `CACHE_STORE=file` in production |

---

## 1. Audio delivery — Nginx X-Accel-Redirect (local storage)

Without this, `GET /api/recitations/{id}/audio` serves local files through PHP (`response()->file`),
tying up a PHP-FPM worker per stream. `X-Accel-Redirect` hands the byte transfer to Nginx and frees
the worker immediately. Remote/CDN audio is still proxied unchanged (the mobile never hits the CDN
directly — that contract is preserved).

**Nginx** — add the internal locations that map the X-Accel prefixes to the storage paths.
There are **two**: one for public recitations (`storage/app/public`) and one for **private,
gated recordings** (`storage/app/private`, which must NOT be web-served any other way):

```nginx
server {
    # … existing config …

    # Internal-only: public recitations. App emits `X-Accel-Redirect: /__audio_internal/<path>`.
    location /__audio_internal/ {
        internal;
        alias /var/www/mashfa/app/storage/app/public/;
        add_header Accept-Ranges bytes;
    }

    # Internal-only: gated premium recordings. App emits `X-Accel-Redirect: /__protected_audio/<path>`
    # ONLY after RecordingController::audio() passes the subscription check.
    location /__protected_audio/ {
        internal;
        alias /var/www/mashfa/app/storage/app/private/;
        add_header Accept-Ranges bytes;
    }

    # Make sure nothing serves the private dir directly (it is outside the web root by
    # default; this is just a belt-and-suspenders guard if you ever symlink it).
    location ~ ^/storage/recordings/ { return 404; }
}
```

Then enable it:

```env
AUDIO_X_ACCEL=true
AUDIO_X_ACCEL_PREFIX=/__audio_internal
AUDIO_PROTECTED_X_ACCEL_PREFIX=/__protected_audio
```

### Premium-audio paywall (one-time relocation)

Recording audio now lives on the **private** disk and is reachable only through the gated
`GET /api/recordings/{id}/audio` endpoint (subscription/trial enforced server-side, then served
via `X-Accel-Redirect`). To migrate audio that currently sits in `storage/app/public/recordings`:

```bash
php artisan recordings:relocate-audio --dry-run   # preview
php artisan recordings:relocate-audio             # move public → private (idempotent)
# add --keep to retain the public copies until you've verified playback
```

After relocating, confirm nothing remains publicly served under `/storage/recordings/`. The mobile
app already sends the bearer token to this endpoint (only to our origin); free sessions remain
playable by guests.

Keep `AUDIO_X_ACCEL=false` anywhere Nginx isn't fronting PHP (e.g. `php artisan serve`), or the
file won't be served. The app falls back to `response()->file()` when the flag is off.

> CLOUD MIGRATION POINT: when `AUDIO_DRIVER=cloud`, the local block in
> `RecitationController::audio()` is where a signed S3/CDN URL redirect plugs in. No AWS SDK is
> bundled — that integration is intentionally left as a placeholder.

---

## 2. Redis (cache, sessions, queue, rate limiting) — optional

Install:

```bash
sudo apt-get update && sudo apt-get install -y redis-server
sudo systemctl enable --now redis-server
# PHP extension (one of):
sudo apt-get install -y php8.4-redis        # phpredis  (REDIS_CLIENT=phpredis)
# or:  composer require predis/predis        # pure-PHP  (REDIS_CLIENT=predis)
redis-cli ping   # -> PONG
```

Enable in `.env`:

```env
CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=null
```

**Rate limiting** automatically uses `CACHE_STORE`, so setting it to `redis` makes the limiter
Redis-backed and accurate across multiple app servers.

**Graceful fallback:** if any of those is `redis` but Redis is unreachable at boot, the app logs a
warning and falls back to file/database (`AppServiceProvider::applyRedisFallbacks`). Disable with
`REDIS_AUTO_FALLBACK=false`. With the defaults (`database`/`file`) Redis is never contacted.

After changing env: `php artisan config:clear` (and `config:cache` in production).

---

## 3. Queue worker — Supervisor

The default DB queue still needs a running worker (e.g. for `CompressAudioJob`).

```bash
sudo cp /var/www/mashfa/app/deploy/laravel-worker.conf /etc/supervisor/conf.d/laravel-worker.conf
# edit paths/user/numprocs as needed
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-worker:*
```

Restart workers after each deploy so they load new code:

```bash
php artisan queue:restart
```

**Health check** (cron / monitoring — exits non-zero when the backlog looks unhealthy):

```bash
php artisan queue:health --queue=default --max-pending=50
```

`CompressAudioJob` now logs on dispatch (`queued …`), at start (`processing …`), and on
success/failure — `tail -f storage/logs/laravel.log` (or `storage/logs/worker.log`).

---

## 4. Disease search — FULLTEXT index

Default search uses `LIKE` (covers disease names **and** aliases). FULLTEXT is faster on large
datasets but only covers disease names, so it's opt-in and the repository always falls back to
`LIKE` if the index is missing or the driver isn't MySQL/MariaDB.

**Index creation.** Per the project rule the index lives in the existing
`create_diseases_table` migration (guarded to MySQL/MariaDB). In **development** it applies on:

```bash
php artisan migrate:fresh --seed
```

In **production** (where `migrate:fresh` is never run), apply it once with raw SQL — this matches
exactly what the migration runs:

```sql
ALTER TABLE diseases
  ADD COLUMN name_ar VARCHAR(512)
    GENERATED ALWAYS AS (JSON_UNQUOTE(JSON_EXTRACT(name, '$.ar'))) STORED;
ALTER TABLE diseases
  ADD COLUMN name_en VARCHAR(512)
    GENERATED ALWAYS AS (JSON_UNQUOTE(JSON_EXTRACT(name, '$.en'))) STORED;
ALTER TABLE diseases
  ADD FULLTEXT diseases_name_fulltext (name_ar, name_en);
```

Then enable:

```env
SEARCH_USE_FULLTEXT=true
```

> Note: MySQL's default `innodb_ft_min_token_size` (3) means very short tokens won't match. Leave
> the flag off until you've validated results against your data.

---

## 5. Production cache warning

If `CACHE_STORE=file` in production, the app logs a warning on boot (file cache is per-node and
makes rate limiting inaccurate across servers). Use `redis` or `database`. Silence with
`SCALABILITY_CACHE_WARN=false`.

---

## 6. Verse search — normalized column (one-time backfill)

Verse search now matches against a pre-normalized `verses.text_norm` column (plain `LIKE`)
instead of running two `REGEXP_REPLACE` calls per row per request. Fresh databases get the
column from the verses migration and the values from the seeder. **Existing databases upgrade
in place — no migration needed:**

```bash
php artisan verses:normalize        # adds the column if missing + backfills (idempotent)
```

Until the command runs, search still works: the repository catches the missing-column error and
falls back to the legacy per-row scan automatically.

---

## 7. OTP email is queued

`OtpVerificationMail` implements `ShouldQueue`, so the sign-in/resend response no longer waits
for the SMTP round-trip. **The queue worker (`mashfa-queue.service`) must be running or OTP
codes will not be delivered.** Check with `php artisan queue:health`.

---

## Deploy order (summary)

1. Pull code, `composer install --no-dev`, `php artisan config:cache route:cache`.
2. Deploy `deploy/nginx-mashfa.conf` (now includes gzip, the X-Accel internal locations and
   static cache headers), set `AUDIO_X_ACCEL=true`, reload Nginx.
3. (Optional) Install Redis, flip `CACHE_STORE`/`SESSION_DRIVER`/`QUEUE_CONNECTION` to `redis`.
4. Install/refresh the Supervisor worker; `php artisan queue:restart` — **required for OTP mail**.
5. (Optional) Apply the FULLTEXT SQL, set `SEARCH_USE_FULLTEXT=true`.
6. `php artisan verses:normalize` (one-time backfill for verse search).
7. `php artisan config:clear && php artisan config:cache`.
