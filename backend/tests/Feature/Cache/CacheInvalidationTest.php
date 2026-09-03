<?php

namespace Tests\Feature\Cache;

use App\Models\AdhkarCategory;
use App\Models\AdhkarItem;
use App\Models\AdhkarSection;
use App\Models\Category;
use App\Models\Concerns\InvalidatesCache;
use App\Models\Course;
use App\Models\Disease;
use App\Models\FeatureFlag;
use App\Models\Reciter;
use App\Models\Recitation;
use App\Models\Sponsor;
use App\Models\SponsorScreenConfig;
use App\Models\Subcategory;
use App\Models\Surah;
use App\Models\TahsinatCategory;
use App\Models\TahsinatItem;
use App\Models\TahsinatSection;
use App\Services\AdhkarService;
use App\Services\CategoryService;
use App\Services\CourseService;
use App\Services\DiseaseService;
use App\Services\FeatureFlagService;
use App\Services\ReciterService;
use App\Services\RecitationService;
use App\Services\SponsorService;
use App\Services\SubcategoryService;
use App\Services\SurahService;
use App\Services\TahsinatService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use PHPUnit\Framework\Attributes\DataProvider;
use ReflectionMethod;
use Tests\TestCase;

class CacheInvalidationTest extends TestCase
{
    use RefreshDatabase;

    /** Every cached model + the exact keys it must bust. */
    public static function cachedModelProvider(): array
    {
        return [
            'Category'           => [Category::class, CategoryService::CACHE_KEYS],
            'Subcategory'        => [Subcategory::class, SubcategoryService::CACHE_KEYS],
            'Disease'            => [Disease::class, DiseaseService::CACHE_KEYS],
            'AdhkarCategory'     => [AdhkarCategory::class, AdhkarService::CACHE_KEYS],
            'AdhkarSection'      => [AdhkarSection::class, AdhkarService::CACHE_KEYS],
            'AdhkarItem'         => [AdhkarItem::class, AdhkarService::CACHE_KEYS],
            'TahsinatCategory'   => [TahsinatCategory::class, TahsinatService::CACHE_KEYS],
            'TahsinatSection'    => [TahsinatSection::class, TahsinatService::CACHE_KEYS],
            'TahsinatItem'       => [TahsinatItem::class, TahsinatService::CACHE_KEYS],
            'Surah'              => [Surah::class, SurahService::CACHE_KEYS],
            // Reciter also busts the recitation aggregate: recitations are cached
            // with their reciter and filtered by reciter activity.
            'Reciter'            => [Reciter::class, array_merge(ReciterService::CACHE_KEYS, RecitationService::CACHE_KEYS)],
            'Recitation'         => [Recitation::class, RecitationService::CACHE_KEYS],
            'Course'             => [Course::class, CourseService::CACHE_KEYS],
            'Sponsor'            => [Sponsor::class, SponsorService::CACHE_KEYS],
            'SponsorScreenConfig' => [SponsorScreenConfig::class, SponsorService::CACHE_KEYS],
            'FeatureFlag'        => [FeatureFlag::class, FeatureFlagService::CACHE_KEYS],
        ];
    }

    /**
     * Wiring guarantee for all 16 cached models: each uses the single
     * InvalidatesCache trait and declares exactly the keys its owning Service
     * caches — so the read and write sides can never drift. No DB needed.
     */
    #[DataProvider('cachedModelProvider')]
    public function test_cached_model_declares_the_correct_invalidation_keys(string $model, array $expectedKeys): void
    {
        $this->assertContains(
            InvalidatesCache::class,
            class_uses_recursive($model),
            "{$model} must use the InvalidatesCache trait."
        );

        $method = new ReflectionMethod($model, 'cacheKeysToForget');
        $method->setAccessible(true);
        $keys = $method->invoke(new $model);

        $this->assertSame($expectedKeys, $keys, "{$model} invalidates the wrong cache keys.");
    }

    public function test_saving_a_category_busts_the_navigation_tree_cache(): void
    {
        Cache::put(CategoryService::CACHE_KEY, 'stale', 600);

        Category::factory()->create();

        $this->assertFalse(Cache::has(CategoryService::CACHE_KEY), 'Saving a Category must bust the tree cache.');
    }

    public function test_saving_a_feature_flag_busts_the_features_cache(): void
    {
        // FeatureFlag also has its own booted() cascade — proves the trait
        // coexists with a model's existing booted().
        Cache::put(FeatureFlagService::CACHE_KEY, 'stale', 600);

        FeatureFlag::create(['feature_key' => 'unit_test_flag', 'is_visible' => true]);

        $this->assertFalse(Cache::has(FeatureFlagService::CACHE_KEY), 'Saving a FeatureFlag must bust the features cache.');
    }

    public function test_deleting_a_cached_model_also_busts_the_cache(): void
    {
        $flag = FeatureFlag::create(['feature_key' => 'temp_flag', 'is_visible' => true]);
        Cache::put(FeatureFlagService::CACHE_KEY, 'stale', 600);

        $flag->delete();

        $this->assertFalse(Cache::has(FeatureFlagService::CACHE_KEY), 'Deleting a FeatureFlag must bust the features cache.');
    }
}
