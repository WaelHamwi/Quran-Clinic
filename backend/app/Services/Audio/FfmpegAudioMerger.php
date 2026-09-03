<?php

namespace App\Services\Audio;

use Symfony\Component\Process\Process;

/**
 * Concatenates multiple audio files (in the given order) into one, via
 * ffmpeg's filter_complex concat — unlike the `-f concat` demuxer, this
 * works even when the inputs are different formats/codecs (mp3, m4a, wav,
 * ogg, ...), which is what an admin uploading several files may mix.
 */
class FfmpegAudioMerger
{
    /**
     * @param  list<string>  $absoluteInputPaths  two or more files, in merge order
     */
    public function merge(array $absoluteInputPaths, string $absoluteOutputPath): void
    {
        $count = count($absoluteInputPaths);

        $args = ['ffmpeg', '-y'];
        foreach ($absoluteInputPaths as $path) {
            $args[] = '-i';
            $args[] = $path;
        }

        $filterInputs = implode('', array_map(fn (int $i): string => "[{$i}:a]", range(0, $count - 1)));
        $args[] = '-filter_complex';
        $args[] = "{$filterInputs}concat=n={$count}:v=0:a=1[out]";
        $args[] = '-map';
        $args[] = '[out]';
        $args[] = $absoluteOutputPath;

        $process = new Process($args);
        $process->setTimeout(600);
        $process->run();

        if (! $process->isSuccessful() || ! file_exists($absoluteOutputPath)) {
            throw new \RuntimeException('Failed to merge recording audio files: ' . $process->getErrorOutput());
        }
    }
}
