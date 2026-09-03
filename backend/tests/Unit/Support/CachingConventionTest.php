<?php

namespace Tests\Unit\Support;

use Tests\TestCase;

/**
 * Enforces the rule in .claude/backend/caching.md: ModelCache is the ONLY
 * allowed way to cache Eloquent data. Fails if any service hand-rolls
 * snapshot/rehydration or caches live models/paginators.
 */
class CachingConventionTest extends TestCase
{
    private string $servicesDir;

    protected function setUp(): void
    {
        parent::setUp();
        $this->servicesDir = app_path('Services');
    }

    /** Every service that caches Eloquent query results must route through ModelCache. */
    public function test_eloquent_caching_services_use_modelcache(): void
    {
        // Every service that caches an Eloquent *aggregate* (a list/collection).
        $mustUseModelCache = [
            'AdhkarService', 'TahsinatService', 'SponsorService',
            'CourseService', 'RecitationService', 'ReciterService', 'SurahService',
            'CategoryService',
        ];

        foreach ($mustUseModelCache as $service) {
            $src = file_get_contents("{$this->servicesDir}/{$service}.php");
            $this->assertStringContainsString(
                'ModelCache',
                $src,
                "{$service} caches Eloquent data and MUST use App\\Support\\ModelCache (see caching.md)."
            );
        }
    }

    /**
     * No service may hand-roll snapshot/rehydration or keep the old
     * live-object caching workarounds. That logic belongs in ModelCache only.
     */
    public function test_no_service_hand_rolls_model_caching(): void
    {
        $banned = [
            '::hydrate('                       => 'use ModelCache::rememberMany instead of Model::hydrate()',
            '->setRawAttributes('              => 'use ModelCache instead of manual rehydration',
            'newFromBuilder('                  => 'use ModelCache instead of manual rehydration',
            'instanceof LengthAwarePaginator'  => 'do not cache live paginators; use ModelCache::rememberPaginated()',
        ];

        foreach (glob("{$this->servicesDir}/*.php") as $file) {
            $src = file_get_contents($file);
            foreach ($banned as $needle => $why) {
                $this->assertStringNotContainsString(
                    $needle,
                    $src,
                    basename($file) . " violates caching rule: {$why}"
                );
            }
        }
    }
}
