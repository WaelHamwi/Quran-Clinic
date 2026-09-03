<?php

namespace Tests\Feature;

use App\Models\Recording;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ImportTextCodesTest extends TestCase
{
    use RefreshDatabase;

    private function tsv(string $body): string
    {
        $path = tempnam(sys_get_temp_dir(), 'codes') . '.tsv';
        file_put_contents($path, $body);

        return $path;
    }

    public function test_it_imports_one_recording_per_code(): void
    {
        $file = $this->tsv(
            "C001\tالفاتحة\t7,1\tالفاتحة 3 مرات.\n" .
            "C003\tالبقرة\t5,1\tأول 5 آيات من البقرة.\n"
        );

        $this->artisan('recordings:import-text-codes', ['file' => $file])
            ->assertSuccessful();

        $this->assertSame(2, Recording::count());
        $this->assertSame(
            'الفاتحة 3 مرات.',
            Recording::where('code', 'C001')->first()->getTranslation('description', 'ar', false)
        );
    }

    public function test_a_code_repeated_in_the_sheet_is_imported_once(): void
    {
        // The source sheet carries C013 on two different rows. Importing the
        // second would overwrite the first, so it is skipped and reported.
        $file = $this->tsv(
            "C013\tالبقرة\t178\tذلك تخفيف من ربكم ورحمة\n" .
            "C013\tالبقرة\t185\tيريد الله بكم اليسر\n"
        );

        $this->artisan('recordings:import-text-codes', ['file' => $file])
            ->assertSuccessful();

        $this->assertSame(1, Recording::where('code', 'C013')->count());
        $this->assertSame(
            'ذلك تخفيف من ربكم ورحمة',
            Recording::where('code', 'C013')->first()->getTranslation('description', 'ar', false)
        );
    }

    public function test_rerunning_updates_rather_than_duplicates(): void
    {
        $file = $this->tsv("C001\tالفاتحة\t7,1\tالفاتحة 3 مرات.\n");
        $this->artisan('recordings:import-text-codes', ['file' => $file])->assertSuccessful();

        $revised = $this->tsv("C001\tالفاتحة\t7,1\tالفاتحة 7 مرات.\n");
        $this->artisan('recordings:import-text-codes', ['file' => $revised])->assertSuccessful();

        $this->assertSame(1, Recording::where('code', 'C001')->count());
        $this->assertSame(
            'الفاتحة 7 مرات.',
            Recording::where('code', 'C001')->first()->getTranslation('description', 'ar', false)
        );
    }

    public function test_imported_blocks_are_invisible_to_the_mobile_api(): void
    {
        // They carry no attachment and are not general, which is exactly what
        // the API filters on — so importing them cannot change what the app
        // serves until someone links them on purpose.
        $file = $this->tsv("C001\tالفاتحة\t7,1\tالفاتحة 3 مرات.\n");
        $this->artisan('recordings:import-text-codes', ['file' => $file])->assertSuccessful();

        $block = Recording::where('code', 'C001')->first();

        $this->assertFalse($block->is_general);
        $this->assertCount(0, $block->attachments);
        $this->assertCount(0, Recording::general()->get());
    }
}
