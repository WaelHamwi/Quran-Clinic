<?php

namespace App\Services;

use App\Models\Recitation;
use App\Repositories\Contracts\RecitationRepositoryInterface;
use App\Support\ModelCache;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Storage;

class RecitationService
{
    /** The full recitation set (with reciter) cached under one key. */
    public const CACHE_ALL = 'recitations.v1.all';

    /** Keys invalidated when a Recitation is written. */
    public const CACHE_KEYS = [self::CACHE_ALL];

    public function __construct(private RecitationRepositoryInterface $repository) {}

    public function find(int $id): ?Recitation
    {
        return $this->repository->findById($id);
    }

    /**
     * Recitations for one surah — sliced in PHP from the cached aggregate, the
     * same static-key + filter-in-PHP pattern the surah/reciter lists use.
     */
    public function getBySurah(int $surahId): Collection
    {
        $all = ModelCache::rememberMany(self::CACHE_ALL, 300, fn () => $this->repository->all());

        return $all->where('surah_id', $surahId)->values();
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
