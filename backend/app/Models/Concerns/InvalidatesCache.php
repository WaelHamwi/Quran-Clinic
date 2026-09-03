<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

/**
 * The single, project-wide mechanism for busting collection-level caches when a
 * cached model is written. Each using model declares the cache keys it owns via
 * cacheKeysToForget(); this trait forgets them on every create / update /
 * delete / restore — so admin edits appear on the next request instead of
 * waiting out the TTL.
 *
 * Pair with App\Support\ModelCache on the read side. Keep keys defined as
 * constants on the owning Service (e.g. AdhkarService::CACHE_KEYS) so the cache
 * and its invalidation can never drift apart.
 *
 * Laravel auto-calls boot{TraitName}() during model boot, so this coexists with
 * a model's own booted().
 */
trait InvalidatesCache
{
    /** @return array<int, string> Static cache keys this model's writes invalidate. */
    abstract protected function cacheKeysToForget(): array;

    public static function bootInvalidatesCache(): void
    {
        $flush = static function (Model $model): void {
            foreach ($model->cacheKeysToForget() as $key) {
                Cache::forget($key);
            }
        };

        // registerModelEvent() (not static::saved()/restored()) so this works on
        // models without SoftDeletes too — 'restored'/'restoring' static helpers
        // only exist on SoftDeletes models, and calling a missing one would hit
        // __callStatic → (new static) → boot recursion. A 'restored' listener
        // simply never fires when the model isn't soft-deletable.
        foreach (['saved', 'deleted', 'restored'] as $event) {
            static::registerModelEvent($event, $flush);
        }
    }
}
