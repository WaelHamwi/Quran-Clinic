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
