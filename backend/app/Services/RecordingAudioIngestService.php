<?php

namespace App\Services;

use App\Services\Audio\FfmpegAudioMerger;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Turns the "Recording File(s)" upload field into the single relative path
 * to store as Recording::audio_path. One uploaded file is used as-is; more
 * than one are merged, in the order the admin arranged them, into a single
 * file — the fragment files are then deleted, since only the merged result
 * is meaningful going forward.
 */
class RecordingAudioIngestService
{
    private const DISK = 'local';

    public function __construct(private FfmpegAudioMerger $merger) {}

    /**
     * @param  list<string|null>  $relativePaths  paths already stored on the 'local' disk by the form's FileUpload, in display order
     * @return string|null the relative path to persist as audio_path, or null when nothing was uploaded (leave audio_path untouched)
     */
    public function ingest(array $relativePaths): ?string
    {
        $relativePaths = array_values(array_filter($relativePaths, fn ($path) => filled($path)));

        if ($relativePaths === []) {
            return null;
        }

        if (count($relativePaths) === 1) {
            return $relativePaths[0];
        }

        $disk = Storage::disk(self::DISK);
        $absoluteInputs = array_map(fn (string $path): string => $disk->path($path), $relativePaths);
        $outputRelative = 'recordings/' . Str::uuid() . '.mp3';

        $this->merger->merge($absoluteInputs, $disk->path($outputRelative));

        foreach ($relativePaths as $path) {
            $disk->delete($path);
        }

        return $outputRelative;
    }
}
