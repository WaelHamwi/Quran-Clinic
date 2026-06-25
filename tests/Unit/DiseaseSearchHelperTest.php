<?php

namespace Tests\Unit;

use App\Repositories\DiseaseRepository;
use PHPUnit\Framework\TestCase;
use ReflectionMethod;

class DiseaseSearchHelperTest extends TestCase
{
    private function toBoolean(string $term): string
    {
        $method = new ReflectionMethod(DiseaseRepository::class, 'toBooleanFulltext');
        $method->setAccessible(true);

        return $method->invoke(new DiseaseRepository(), $term);
    }

    public function test_appends_prefix_wildcard_to_each_word(): void
    {
        $this->assertSame('back* pain*', $this->toBoolean('back pain'));
    }

    public function test_strips_boolean_operators_to_avoid_syntax_errors(): void
    {
        $this->assertSame('back* pain*', $this->toBoolean('+back -pain*'));
    }

    public function test_collapses_extra_whitespace(): void
    {
        $this->assertSame('head*', $this->toBoolean('   head   '));
    }
}
