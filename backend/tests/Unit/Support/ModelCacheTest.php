<?php

namespace Tests\Unit\Support;

use App\Models\AdhkarCategory;
use App\Models\AdhkarItem;
use App\Models\AdhkarSection;
use App\Support\ModelCache;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class ModelCacheTest extends TestCase
{
    /** Build a translatable category with an eager-loaded section→items graph, in memory (no DB). */
    private function category(): AdhkarCategory
    {
        $item = new AdhkarItem();
        $item->setRawAttributes([
            'id'            => 10,
            'text'          => json_encode(['ar' => 'سبحان الله', 'en' => 'subhanallah']),
            'display_order' => 1,
        ], true);
        $item->exists = true;

        $section = new AdhkarSection();
        $section->setRawAttributes(['id' => 5, 'name' => json_encode(['ar' => 'قسم', 'en' => 'Section'])], true);
        $section->exists = true;
        $section->setRelation('items', new EloquentCollection([$item]));

        $category = new AdhkarCategory();
        $category->setRawAttributes([
            'id'          => 1,
            'name'        => json_encode(['ar' => 'الصباح', 'en' => 'Morning']),
            'slug'        => 'morning',
            'icon'        => 'icons/morning.svg',
            'items_count' => 7, // withCount() aggregate lives in attributes
        ], true);
        $category->exists = true;
        $category->setRelation('sections', new EloquentCollection([$section]));

        return $category;
    }

    public function test_remember_many_returns_real_models_with_translations_and_relations(): void
    {
        $result = ModelCache::rememberMany('test.cat', 60, fn () => new EloquentCollection([$this->category()]));

        $this->assertInstanceOf(EloquentCollection::class, $result);
        $first = $result->first();

        $this->assertInstanceOf(AdhkarCategory::class, $first);
        // Translatable accessor must still work after rehydration.
        $this->assertSame('Morning', $first->getTranslation('name', 'en'));
        // Model method that builds the icon URL must still work.
        $this->assertStringContainsString('storage/icons/morning.svg', $first->iconUrl());
        // withCount() aggregate preserved.
        $this->assertSame(7, (int) $first->items_count);
        // Eager-loaded relations preserved (so whenLoaded() in Resources fires).
        $this->assertTrue($first->relationLoaded('sections'));
        $this->assertSame('Section', $first->sections->first()->getTranslation('name', 'en'));
        $this->assertTrue($first->sections->first()->relationLoaded('items'));
        $this->assertSame('subhanallah', $first->sections->first()->items->first()->text);
    }

    public function test_cached_payload_is_primitive_and_serialization_safe(): void
    {
        ModelCache::rememberMany('test.cat2', 60, fn () => new EloquentCollection([$this->category()]));

        $payload = Cache::get('test.cat2');

        // Nothing in the cache may be an object — this is what makes the DB/file
        // cache store round-trip safe (no "Serialization of 'Closure'" 500s).
        $this->assertIsArray($payload);
        $this->assertNoObjects($payload);
        // Must survive PHP serialize()/unserialize() exactly (what every store does).
        $this->assertEquals($payload, unserialize(serialize($payload)));
    }

    public function test_remember_returns_null_when_resolver_yields_null(): void
    {
        $this->assertNull(ModelCache::remember('test.null', 60, fn () => null));
    }

    public function test_remember_returns_single_model_with_nested_relations(): void
    {
        $result = ModelCache::remember('test.single', 60, fn () => $this->category());

        $this->assertInstanceOf(AdhkarCategory::class, $result);
        $this->assertSame('Morning', $result->getTranslation('name', 'en'));
        $this->assertTrue($result->relationLoaded('sections'));
        // nested section → items survives
        $this->assertSame('subhanallah', $result->sections->first()->items->first()->getTranslation('text', 'en'));
    }

    public function test_remember_paginated_rebuilds_paginator_with_real_models(): void
    {
        $paginator = new LengthAwarePaginator(
            [$this->category(), $this->category()], // 2 items on this page
            total: 25,
            perPage: 2,
            currentPage: 1,
            options: ['path' => 'http://app/api/reciters', 'pageName' => 'page'],
        );

        $result = ModelCache::rememberPaginated('test.page', 60, fn () => $paginator);

        $this->assertInstanceOf(LengthAwarePaginator::class, $result);
        $this->assertSame(25, $result->total());
        $this->assertSame(2, $result->perPage());
        $this->assertSame(1, $result->currentPage());
        $this->assertSame(13, $result->lastPage()); // ceil(25/2)
        $this->assertCount(2, $result->items());
        $this->assertInstanceOf(AdhkarCategory::class, $result->items()[0]);
        $this->assertSame('Morning', $result->items()[0]->getTranslation('name', 'en'));
        // pagination links rebuilt from the cached path
        $this->assertStringContainsString('http://app/api/reciters', $result->url(2));
    }

    public function test_paginated_payload_is_primitive_and_serialization_safe(): void
    {
        $paginator = new LengthAwarePaginator([$this->category()], 1, 1, 1, ['path' => '/api/x']);
        ModelCache::rememberPaginated('test.page2', 60, fn () => $paginator);

        $payload = Cache::get('test.page2');

        $this->assertIsArray($payload);
        $this->assertNoObjects($payload);
        $this->assertEquals($payload, unserialize(serialize($payload)));
    }

    private function assertNoObjects(mixed $value): void
    {
        $this->assertFalse(\is_object($value), 'Cached payload must not contain objects.');
        if (\is_array($value)) {
            foreach ($value as $child) {
                $this->assertNoObjects($child);
            }
        }
    }
}
