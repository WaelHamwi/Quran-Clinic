<?php

namespace App\Services;

use App\Models\Recitation;
use App\Models\Reciter;
use App\Repositories\Contracts\RecitationRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class RecitationService
{
    public function __construct(private RecitationRepositoryInterface $repository) {}

    public function getBySurah(int $surahId): Collection
    {
        try {
            $rows = Cache::remember("recitations.surah.{$surahId}", 300, fn() =>
                $this->repository->getBySurah($surahId)->map(fn(Recitation $r) => [
                    'attrs'   => $r->getAttributes(),
                    'reciter' => $r->reciter?->getAttributes(),
                ])->all()
            );

            return new Collection(array_map(function (array $row) {
                $recitation = new Recitation;
                $recitation->setRawAttributes($row['attrs']);
                $recitation->exists = true;
                if ($row['reciter']) {
                    $recitation->setRelation('reciter', Reciter::newFromBuilder($row['reciter']));
                }
                return $recitation;
            }, $rows));
        } catch (\Throwable $e) {
            Log::warning('RecitationService cache failed, falling back to DB: ' . $e->getMessage());
            return $this->repository->getBySurah($surahId);
        }
    }

    public function getAudioUrl(Recitation $recitation): string
    {
        $path = (string) $recitation->audio_path;

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('public');
        return $disk->url($path);
    }
}
