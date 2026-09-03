<?php

namespace App\Filament\Support;

use App\Exceptions\BusinessRuleException;
use App\Models\Category;
use App\Models\Disease;
use App\Models\Subcategory;
use App\Services\RecordingAttachmentService;
use Closure;
use Filament\Actions\Action;
use Filament\Actions\CreateAction;
use Filament\Actions\EditAction;
use Filament\Notifications\Notification;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

/**
 * The Create / Edit actions for the three items a recording can hang off:
 * Category, Subcategory and Disease.
 *
 * They do what Filament's stock actions do, plus two things:
 *  - apply the recording links ticked in RecordingAttachmentsField, and
 *  - surface a BusinessRuleException as a red notification instead of a 500.
 *
 * Record and links are written in one transaction, so a rejected link (say a
 * second summarized recording on the same item) leaves nothing half-saved —
 * on create, the new row is rolled back with it.
 *
 * These hook into ->using(), the extension point Filament actually calls.
 * ManageRecords pages never call handleRecordCreation()/handleRecordUpdate();
 * those only exist on the separate CreateRecord/EditRecord pages.
 */
class RecordingLinkActions
{
    public static function create(): CreateAction
    {
        return CreateAction::make()
            ->using(function (CreateAction $action, array $data): ?Model {
                $model = $action->getModel();

                return static::persist($action, $data, function (array $attributes) use ($model): Model {
                    $record = new $model;
                    $record->fill($attributes);
                    $record->save();

                    return $record;
                });
            });
    }

    public static function edit(): EditAction
    {
        return EditAction::make()
            ->using(function (EditAction $action, Model $record, array $data): ?Model {
                return static::persist($action, $data, function (array $attributes) use ($record): Model {
                    $record->fill($attributes);
                    $record->save();

                    return $record;
                });
            });
    }

    /**
     * @param  Closure(array<string, mixed>): Model  $save
     */
    private static function persist(Action $action, array $data, Closure $save): ?Model
    {
        $recordingIds = static::pullRecordingIds($data);

        try {
            return DB::transaction(function () use ($data, $save, $recordingIds): Model {
                $record = $save($data);

                if ($recordingIds !== null && static::acceptsRecordings($record)) {
                    app(RecordingAttachmentService::class)->syncForAttachable($record, $recordingIds);
                }

                return $record;
            });
        } catch (BusinessRuleException $e) {
            Notification::make()->title($e->getMessage())->danger()->send();
            $action->halt();

            return null;
        }
    }

    private static function acceptsRecordings(Model $record): bool
    {
        return $record instanceof Category
            || $record instanceof Subcategory
            || $record instanceof Disease;
    }

    /**
     * Takes the two sequences out of the form data — they are not model
     * attributes, so they must not reach fill() — and joins them into the one
     * play order, summarized first.
     *
     * Order and repeats both survive: they are the content the admin built, so
     * nothing here sorts or de-duplicates. A recording listed at the beginning,
     * the middle and the end arrives as three entries and becomes three
     * sessions.
     *
     * Returns null when neither key is present: the field was hidden for this
     * item (a non-direct category, a subcategory that has diseases), and a
     * hidden field must not be read as "clear the sequence".
     *
     * @return list<int>|null
     */
    private static function pullRecordingIds(array &$data): ?array
    {
        if (array_intersect(RecordingAttachmentsField::KEYS, array_keys($data)) === []) {
            return null;
        }

        $ids = [];

        foreach (RecordingAttachmentsField::KEYS as $key) {
            $ids = array_merge($ids, Arr::wrap(Arr::pull($data, $key) ?? []));
        }

        return array_values(array_map('intval', array_filter($ids, 'is_numeric')));
    }
}
