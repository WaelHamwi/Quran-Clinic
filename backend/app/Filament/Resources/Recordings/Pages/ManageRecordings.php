<?php

namespace App\Filament\Resources\Recordings\Pages;

use App\Exceptions\BusinessRuleException;
use App\Filament\Resources\Recordings\RecordingResource;
use App\Jobs\CompressAudioJob;
use App\Models\Recording;
use App\Services\RecordingAudioIngestService;
use Filament\Actions\CreateAction;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ManageRecords;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ManageRecordings extends ManageRecords
{
    protected static string $resource = RecordingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->using(function (array $data): Model {
                    $audioFiles = Arr::pull($data, 'audio_files', []);
                    $data['audio_path'] = app(RecordingAudioIngestService::class)->ingest($audioFiles);

                    try {
                        return Recording::create($data);
                    } catch (BusinessRuleException $e) {
                        Notification::make()->title($e->getMessage())->danger()->send();
                        throw ValidationException::withMessages(['data' => $e->getMessage()]);
                    }
                })
                ->after(function (Recording $record): void {
                    if ($record->audio_path && ! str_starts_with($record->audio_path, 'http')) {
                        CompressAudioJob::dispatch(Recording::class, $record->id, $record->audio_path, 'local');
                    }
                }),
        ];
    }

    /**
     * Filament numbers a drag 1..N over the rows it was handed, and with
     * pagination left on that is one page's worth — so a drop on page 2 would
     * stamp 1, 2, 3… over positions page 1 already holds and the two pages
     * would interleave. Instead: take the positions these rows already own and
     * deal them back out in the sequence they were dropped in. The page keeps
     * its block of the library; only the order inside it changes.
     */
    public function reorderTable(array $order, int | string | null $draggedRecordKey = null): void
    {
        if (! $this->getTable()->isReorderable()) {
            return;
        }

        $keys = array_values($order);

        $positions = Recording::whereIn('id', $keys)
            ->orderBy('display_order')
            ->orderBy('id')
            ->pluck('display_order')
            ->all();

        // A row that vanished between render and drop — let Filament's own
        // handling deal with the mismatch rather than guessing at it.
        if (count($positions) !== count($keys)) {
            parent::reorderTable($order, $draggedRecordKey);

            return;
        }

        // Two rows sharing a position would leave the drop order down to the id
        // tie-break; nudge them apart so the sequence is the one dropped.
        $previous = null;

        foreach ($positions as $index => $position) {
            if ($previous !== null && $position <= $previous) {
                $positions[$index] = $previous + 1;
            }

            $previous = $positions[$index];
        }

        DB::transaction(function () use ($keys, $positions): void {
            foreach ($keys as $index => $key) {
                Recording::whereKey($key)->update(['display_order' => $positions[$index]]);
            }
        });
    }
}
