<?php

namespace App\Support;

use Closure;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection as SupportCollection;
use Illuminate\Support\Facades\Cache;

/**
 * Caches Eloquent results as a *primitive snapshot* (scalars + nested arrays)
 * and rehydrates real models on read.
 *
 * Why not cache the models directly? Storing a live Eloquent object graph
 * couples cache correctness to PHP's ability to serialize every node (a single
 * closure, resource handle, or media-library conversion anywhere in the graph
 * throws "Serialization of 'Closure' is not allowed" and 500s on the cache HIT,
 * not the miss — so it passes in dev and fails in prod). A primitive snapshot
 * round-trips through *any* store (database, file, redis, memcached) identically.
 *
 * Why not cache `->toArray()` and return that? Because the API Resources call
 * model methods — getTranslations(), iconUrl(), whenLoaded(), whenCounted() —
 * which only exist on real models. Rehydrating preserves them, including
 * eager-loaded relations and withCount() aggregates.
 */
final class ModelCache
{
    /** Cache a query returning a model Collection; returns rehydrated models. */
    public static function rememberMany(string $key, int $ttl, Closure $resolver): EloquentCollection
    {
        $snapshots = Cache::remember($key, $ttl, static function () use ($resolver): array {
            return $resolver()->map(static fn (Model $m): array => self::snapshot($m))->all();
        });

        return new EloquentCollection(
            array_map(static fn (array $snap): Model => self::rehydrate($snap), $snapshots)
        );
    }

    /** Cache a query returning a single model (or null); returns a rehydrated model. */
    public static function remember(string $key, int $ttl, Closure $resolver): ?Model
    {
        $snapshot = Cache::remember($key, $ttl, static function () use ($resolver): ?array {
            $model = $resolver();

            return $model instanceof Model ? self::snapshot($model) : null;
        });

        return $snapshot === null ? null : self::rehydrate($snapshot);
    }

    /**
     * Cache a paginated query (`->paginate()`) and return a rebuilt
     * LengthAwarePaginator whose items are rehydrated models. Only the page
     * items + pagination meta are stored — never the live paginator object.
     */
    public static function rememberPaginated(string $key, int $ttl, Closure $resolver): LengthAwarePaginator
    {
        $payload = Cache::remember($key, $ttl, static function () use ($resolver): array {
            /** @var LengthAwarePaginator $paginator */
            $paginator = $resolver();

            return [
                'items'       => array_map(static fn (Model $m): array => self::snapshot($m), $paginator->items()),
                'total'       => $paginator->total(),
                'perPage'     => $paginator->perPage(),
                'currentPage' => $paginator->currentPage(),
                'path'        => $paginator->path(),
                'pageName'    => $paginator->getPageName(),
            ];
        });

        $items = array_map(static fn (array $snap): Model => self::rehydrate($snap), $payload['items']);

        return new LengthAwarePaginator(
            $items,
            $payload['total'],
            $payload['perPage'],
            $payload['currentPage'],
            ['path' => $payload['path'], 'pageName' => $payload['pageName']],
        );
    }

    /**
     * Reduce a model (and its loaded relations) to a serialization-proof array.
     *
     * @return array{class: class-string<Model>, attributes: array<string, mixed>, relations: array<string, array>}
     */
    private static function snapshot(Model $model): array
    {
        $relations = [];

        foreach ($model->getRelations() as $name => $value) {
            $relations[$name] = match (true) {
                $value instanceof EloquentCollection,
                $value instanceof SupportCollection => [
                    'type'  => 'many',
                    'items' => $value->map(static fn (Model $m): array => self::snapshot($m))->all(),
                ],
                $value instanceof Model => ['type' => 'one', 'model' => self::snapshot($value)],
                default                 => ['type' => 'null'],
            };
        }

        return [
            'class'      => $model::class,
            'attributes' => $model->getAttributes(), // raw DB values incl. withCount() aggregates
            'relations'  => $relations,
        ];
    }

    /** Rebuild a real Eloquent model (with relations) from a snapshot. */
    private static function rehydrate(array $snapshot): Model
    {
        /** @var Model $model */
        $model = new $snapshot['class'];
        $model->setRawAttributes($snapshot['attributes'], true);
        $model->exists = true;

        foreach ($snapshot['relations'] as $name => $relation) {
            $model->setRelation($name, match ($relation['type']) {
                'many'  => new EloquentCollection(
                    array_map(static fn (array $s): Model => self::rehydrate($s), $relation['items'])
                ),
                'one'   => self::rehydrate($relation['model']),
                default => null,
            });
        }

        return $model;
    }
}
