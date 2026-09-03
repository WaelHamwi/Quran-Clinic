<?php

namespace App\Filament\Resources\Recordings\Tables;

use App\Exceptions\BusinessRuleException;
use App\Filament\Support\TranslatedName;
use App\Jobs\CompressAudioJob;
use App\Models\Category;
use App\Models\Disease;
use App\Models\Recording;
use App\Models\Subcategory;
// use App\Services\RecordingAttachmentService; // only used by the commented-out "Manage Attachments" action
use App\Services\RecordingAudioIngestService;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
// use Filament\Forms\Components\CheckboxList; // only used by the commented-out "Manage Attachments" action
use Filament\Notifications\Notification;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Filters\SelectFilter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;

class RecordingsTable
{
    public static function modifyQuery(Builder $query): Builder
    {
        return $query->with('attachments.attachable');
    }

    public static function getColumns(): array
    {
        return [
            TextColumn::make('code')
                ->label('Code')
                ->badge()
                ->color('gray')
                ->searchable()
                ->sortable()
                ->copyable()
                ->copyMessage('Code copied')
                ->placeholder('— no code —'),
            // "Attached To" is hidden for now. Kept here (commented) so it can
            // be restored later, alongside the Manage Attachments action below.
            // The summary helper itself stays — the Listen modal still shows it.
            // TextColumn::make('attachments_summary')
            //     ->label('Attached To')
            //     ->state(fn (Recording $record): string => static::attachmentsSummary($record))
            //     ->wrap()
            //     ->placeholder('— not attached —'),
            TextColumn::make('type')
                ->label('Type')
                ->badge()
                ->formatStateUsing(fn (string $state): string => $state === Recording::TYPE_SUMMARIZED ? 'Summarized (مختصرة) — Free' : 'Detailed (مطولة) — Paid')
                ->color(fn (string $state): string => $state === Recording::TYPE_SUMMARIZED ? 'success' : 'warning'),
            ToggleColumn::make('is_general')->label('General Ruqyah'),
            TextColumn::make('duration_seconds')->label('Duration (s)'),
            TextColumn::make('plays_count')->label('Plays')->sortable(),
            TextColumn::make('created_at')->label('Created')->dateTime()->sortable(),
        ];
    }

    /**
     * Sits with the filters as an "Order by" chooser: dragging builds a custom
     * order, this picks which order the list is read in — including that one.
     *
     * The ordering is applied while reorder mode is on as well as off. Drag
     * handles are only offered in custom order (see isArrangingManually), so
     * the only ordering this can add during a drag is the very one Filament
     * applies itself — with the id tie-break kept, which Filament drops. The
     * rows therefore sit in exactly the same sequence before and after the
     * handles appear: turning dragging on never reshuffles the list.
     *
     * baseQuery(), NOT query(): Filament runs each filter's query() inside a
     * nested `where(fn ($query) => …)`, so only WHERE conditions survive and an
     * orderBy() there is silently dropped. baseQuery() runs against the outer
     * builder, which is the only place a filter can set an order at all.
     */
    private static function orderFilter(): SelectFilter
    {
        return SelectFilter::make('order')
            ->label('Order by')
            ->options([
                'custom' => 'Custom order (drag & drop)',
                'code'   => 'Alphabetically, by code',
                'latest' => 'Newest first',
                'oldest' => 'Oldest first',
            ])
            ->placeholder('Default (newest first)')
            // This chooser narrows nothing — without a no-op here SelectFilter
            // falls back to its default behaviour and tries to filter rows by a
            // non-existent `order` column.
            ->query(fn (Builder $query): Builder => $query)
            ->baseQuery(function (Builder $query, array $data): Builder {
                return match ($data['value'] ?? null) {
                    // reorder() clears any ordering already on the query so this
                    // becomes the primary sort; the table's own default sort is
                    // appended after it as a tie-breaker.
                    'custom' => $query->reorder()->orderBy('display_order')->orderBy('id'),
                    // Uncoded recordings sort last, not first: they are the ones
                    // not yet matched to a sheet row. Mirrors the picker.
                    'code'   => $query->reorder()->orderByRaw('code IS NULL')->orderBy('code')->orderBy('id'),
                    'latest' => $query->reorder()->orderBy('created_at', 'desc')->orderBy('id', 'desc'),
                    'oldest' => $query->reorder()->orderBy('created_at')->orderBy('id'),
                    default  => $query,
                };
            });
    }

    /**
     * Whether the list is currently being read in its custom order — which is
     * the only order a drag can be honest in.
     *
     * A drag writes positions for the rows in the sequence they were dropped.
     * Do that while the list is showing alphabetically or by date and the query
     * re-runs on its own terms, so the row you just moved springs back to where
     * the sort says it belongs and the write goes unseen. Offering the handles
     * only here means what you drag is always what you are looking at.
     */
    public static function isArrangingManually(mixed $livewire): bool
    {
        return ($livewire->getTableFilterState('order')['value'] ?? null) === 'custom';
    }

    /**
     * Without this the drag handles would be reachable only by first knowing to
     * pick "Custom order" from the chooser. One button gets there: switch the
     * list into its custom order and turn the handles on.
     */
    public static function getHeaderActions(): array
    {
        return [
            Action::make('arrangeManually')
                ->label('Arrange manually')
                ->icon('heroicon-o-arrows-up-down')
                ->color('gray')
                // Hidden once we are there: Filament's own reorder toggle takes
                // over from this point.
                ->visible(fn ($livewire): bool => ! static::isArrangingManually($livewire))
                ->action(function ($livewire): void {
                    $livewire->tableFilters['order']['value'] = 'custom';
                    // The chooser's own update path — persists the choice and
                    // sends the list back to page one.
                    $livewire->updatedTableFilters();
                    $livewire->isTableReordering = true;
                }),
        ];
    }

    public static function getFilters(): array
    {
        return [
            static::orderFilter(),
            SelectFilter::make('disease')
                ->label('Disease')
                ->options(fn () => TranslatedName::options(Disease::ordered()->get()))
                ->query(fn (Builder $query, array $data) => $query->when(
                    $data['value'] ?? null,
                    fn (Builder $q, $value) => $q->whereHas('attachments', fn ($a) => $a
                        ->where('attachable_type', Disease::class)
                        ->where('attachable_id', $value))
                )),
            SelectFilter::make('subcategory')
                ->label('Subcategory')
                ->options(fn () => TranslatedName::options(Subcategory::doesntHave('diseases')->ordered()->get()))
                ->query(fn (Builder $query, array $data) => $query->when(
                    $data['value'] ?? null,
                    fn (Builder $q, $value) => $q->whereHas('attachments', fn ($a) => $a
                        ->where('attachable_type', Subcategory::class)
                        ->where('attachable_id', $value))
                )),
            SelectFilter::make('category')
                ->label('Category')
                ->options(fn () => TranslatedName::options(Category::where('type', 'direct')->ordered()->get()))
                ->query(fn (Builder $query, array $data) => $query->when(
                    $data['value'] ?? null,
                    fn (Builder $q, $value) => $q->whereHas('attachments', fn ($a) => $a
                        ->where('attachable_type', Category::class)
                        ->where('attachable_id', $value))
                )),
            SelectFilter::make('type')->options([
                Recording::TYPE_SUMMARIZED => 'Summarized (مختصرة)',
                Recording::TYPE_DETAILED   => 'Detailed (مطولة)',
            ]),
            SelectFilter::make('is_general')->options(['1' => 'General Ruqyah', '0' => 'Disease-specific']),
        ];
    }

    public static function getActions(): array
    {
        return [
            Action::make('listen')
                ->label('Listen')
                ->icon('heroicon-o-play-circle')
                ->color('success')
                ->hidden(fn ($record) => ! $record->audio_path)
                ->modalContent(function (Recording $record) {
                    return view('filament.recordings.audio-player-modal', [
                        'audioUrl'   => route('admin.recordings.audio', $record->id),
                        'attachedTo' => static::attachmentsSummary($record),
                    ]);
                })
                ->modalHeading(fn (Recording $record) => 'Recording ' . ($record->code ?: "#{$record->id}"))
                ->modalSubmitAction(false)
                ->modalCancelActionLabel('Close'),
            // Hidden for now — the "Manage Attachments" row action is not needed
            // in the table. Kept here (commented) so it can be restored later.
            // Action::make('manageAttachments')
            //     ->label('Manage Attachments')
            //     ->icon('heroicon-o-link')
            //     ->color('info')
            //     ->modalHeading('Attach Recording to Categories / Subcategories / Diseases')
            //     ->modalWidth('2xl')
            //     ->schema([
            //         CheckboxList::make('categories')
            //             ->label('Categories (direct — no subcategories)')
            //             ->options(fn () => TranslatedName::options(Category::where('type', 'direct')->ordered()->get()))
            //             ->searchable()
            //             ->bulkToggleable()
            //             ->columns(2),
            //         CheckboxList::make('subcategories')
            //             ->label('Subcategories (without diseases)')
            //             ->options(fn () => TranslatedName::options(Subcategory::doesntHave('diseases')->ordered()->get()))
            //             ->searchable()
            //             ->bulkToggleable()
            //             ->columns(2),
            //         CheckboxList::make('diseases')
            //             ->label('Diseases')
            //             ->options(fn () => TranslatedName::options(Disease::ordered()->get()))
            //             ->searchable()
            //             ->bulkToggleable()
            //             ->columns(2),
            //     ])
            //     ->fillForm(fn (Recording $record): array => [
            //         'categories'    => $record->attachments->where('attachable_type', Category::class)->pluck('attachable_id')->all(),
            //         'subcategories' => $record->attachments->where('attachable_type', Subcategory::class)->pluck('attachable_id')->all(),
            //         'diseases'      => $record->attachments->where('attachable_type', Disease::class)->pluck('attachable_id')->all(),
            //     ])
            //     ->action(function (Action $action, Recording $record, array $data): void {
            //         try {
            //             app(RecordingAttachmentService::class)->sync($record, [
            //                 Category::class    => $data['categories'] ?? [],
            //                 Subcategory::class => $data['subcategories'] ?? [],
            //                 Disease::class     => $data['diseases'] ?? [],
            //             ]);
            //         } catch (BusinessRuleException $e) {
            //             Notification::make()->title($e->getMessage())->danger()->send();
            //             $action->halt();
            //
            //             return;
            //         }
            //
            //         Notification::make()->title('Attachments updated')->success()->send();
            //     }),
            EditAction::make()
                ->action(function (EditAction $action, Model $record, array $data): void {
                    $audioFiles = Arr::pull($data, 'audio_files', []);
                    $data['audio_path'] = app(RecordingAudioIngestService::class)->ingest($audioFiles);

                    try {
                        $record->fill($data);
                        $record->save();
                    } catch (BusinessRuleException $e) {
                        Notification::make()
                            ->title($e->getMessage())
                            ->danger()
                            ->send();
                        $action->halt();
                        return;
                    }

                    if ($record->audio_path && ! str_starts_with($record->audio_path, 'http')) {
                        CompressAudioJob::dispatch(Recording::class, $record->id, $record->audio_path, 'local');
                    }
                }),
            DeleteAction::make(),
        ];
    }

    public static function getBulkActions(): array
    {
        return [
            BulkActionGroup::make([DeleteBulkAction::make()]),
        ];
    }

    private static function attachmentsSummary(Recording $record): string
    {
        $names = $record->attachments
            ->map(fn ($a) => TranslatedName::display($a->attachable))
            ->filter();

        return $names->isEmpty() ? '' : $names->implode(', ');
    }
}
