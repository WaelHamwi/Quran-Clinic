<?php

namespace App\Filament\Support;

use App\Filament\Forms\Components\RecordingPicker;
use App\Models\Recording;
use Closure;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Text;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * Lets an admin pick which Ruqyah recordings are linked to the Category /
 * Subcategory / Disease being edited — the mirror image of the "Manage
 * Attachments" action on the Recordings table, which links from the other end.
 *
 * The same recording can be used on any number of items: that reuse is the
 * whole point of the recording_attachments pivot. An item holds as many
 * recordings as its content needs, in a deliberate order, and may hold the
 * same one several times — a ruqyah that opens with a passage, returns to it in
 * the middle and closes on it is three entries, not one. That is why each field
 * is an ordered LIST of recording ids rather than a set of ticks: the position
 * carries meaning and repeats are content, not duplicates to be collapsed.
 *
 * The two lists exist because summarized/detailed is the free/paid split the
 * app shows as tabs; within each, they play top to bottom, summarized first.
 *
 * The two fields are NOT model attributes — ManagesRecordingAttachments pulls
 * them out of the form data and hands them to RecordingAttachmentService.
 *
 * Usage inside a form schema:
 *   return [
 *       // …other fields…
 *       ...RecordingAttachmentsField::make(),
 *   ];
 */
class RecordingAttachmentsField
{
    public const SUMMARIZED_KEY = 'attached_summarized_recordings';

    public const DETAILED_KEY = 'attached_detailed_recordings';

    /** Both form keys, in the order they appear in the UI. */
    public const KEYS = [self::SUMMARIZED_KEY, self::DETAILED_KEY];

    /**
     * The section always renders. When the item is not set to hold recordings
     * directly it shows $hint instead of the pickers, rather than vanishing —
     * a section that simply isn't there reads as "this CMS cannot link
     * recordings here", when the truth is one setting away.
     *
     * @param  bool|Closure  $eligible  when the item may hold recordings directly
     *                                  — see each form's own rules.
     * @return array<int, \Filament\Schemas\Components\Component>
     */
    public static function make(
        ?string $description = null,
        bool|Closure $eligible = true,
        ?string $hint = null,
    ): array {
        return [
            Section::make('Ruqyah Recordings')
                ->description($description ?? 'Build the sequence that plays here, in order. Add a recording as many times as the ruqyah repeats it — beginning, middle and end are three entries of the same recording. Adding one here never removes it from any other category, subcategory or disease.')
                ->schema([
                    Text::make($hint ?? 'This item does not hold recordings directly.')
                        ->hidden($eligible),
                    static::list(
                        self::SUMMARIZED_KEY,
                        'Summarized (مختصرة) — Free',
                        Recording::TYPE_SUMMARIZED,
                    )->visible($eligible),
                    static::list(
                        self::DETAILED_KEY,
                        'Detailed (مطولة) — Paid',
                        Recording::TYPE_DETAILED,
                    )->visible($eligible),
                ])
                ->columns(1)
                ->columnSpanFull(),
        ];
    }

    /**
     * Whether this item already holds recording links.
     *
     * Callers OR this into their own eligibility rule so that links made
     * before the rules tightened — or through the Recordings table, which
     * applies its own rules — stay visible and removable here instead of
     * being stranded on a form that hides them.
     */
    public static function alreadyLinked(?Model $record): bool
    {
        return $record instanceof Model
            && $record->exists
            && method_exists($record, 'recordings')
            && $record->recordings()->exists();
    }

    private static function list(string $key, string $label, string $type): RecordingPicker
    {
        return RecordingPicker::make($key)
            ->label($label)
            ->recordings(fn (): array => static::optionsFor($type))
            ->emptyMessage('No ' . Str::lower($label) . ' recording exists yet.')
            ->helperText('Add as many as this item needs, in the order they should play — the same recording may be added again wherever the ruqyah returns to it.')
            ->columnSpanFull()
            ->afterStateHydrated(function (RecordingPicker $component, ?Model $record) use ($type): void {
                $component->state($record ? static::linkedIds($record, $type) : []);
            });
    }

    /**
     * The ids of $type recordings already attached to $record, in play order
     * and with repeats kept — the sequence is the state, so collapsing it here
     * would silently drop every repeat the moment the form is opened.
     */
    private static function linkedIds(Model $record, string $type): array
    {
        if (! $record->exists || ! method_exists($record, 'recordings')) {
            return [];
        }

        // Strings, so they compare cleanly against the ids the Alpine sequence
        // carries — an int id would leave an entry rendering as unknown.
        return $record->recordings()
            ->where('recordings.type', $type)
            ->pluck('recordings.id')
            ->map(strval(...))
            ->all();
    }

    /**
     * One card per recording of this type: the text the admin recognises it by
     * (recordings have no title), plus the details needed to choose between
     * them — how long it runs, how many items already reuse it, and a URL to
     * preview the audio.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function optionsFor(string $type): array
    {
        return static::query($type)
            // The rows themselves rather than a count: an item that plays this
            // recording three times holds three of them, and "Linked to 3
            // items" would be a lie. Eager-loaded, so this stays one query.
            ->with('attachments:id,recording_id,attachable_type,attachable_id')
            ->get()
            ->map(fn (Recording $r): array => static::card($r))
            ->all();
    }

    /**
     * By code, so the cards read in the order the source sheet lists them —
     * C001, C002, C003 — which is the order an admin builds a sequence from.
     * Ordering by id instead scattered the codes, because the text blocks were
     * imported long after the recordings that came before them.
     *
     * Uncoded recordings sort last rather than first: they are the ones not yet
     * matched to a sheet row, so they belong after everything that is.
     */
    private static function query(string $type)
    {
        return Recording::query()
            ->where('type', $type)
            ->orderByRaw('code IS NULL')
            ->orderBy('code')
            ->orderBy('id');
    }

    /** @return array<string, mixed> */
    private static function card(Recording $recording): array
    {
        $text     = static::firstNonEmptyTranslation($recording, ['ar', 'en']);
        $hasAudio = (bool) $recording->audio_path;
        $items    = $recording->attachments
            ->unique(fn ($attachment): string => $attachment->attachable_type . ':' . $attachment->attachable_id)
            ->count();

        return [
            'id'           => $recording->id,
            // The handle admins match against the source sheet. Falls back to
            // the id so a recording created before codes existed still shows one.
            'code'         => $recording->code ?: "#{$recording->id}",
            'excerpt'      => $text === '' ? '— no text —' : Str::limit($text, 220),
            'duration'     => $recording->duration_seconds
                ? sprintf('%d:%02d', intdiv($recording->duration_seconds, 60), $recording->duration_seconds % 60)
                : null,
            'linked_label' => match ($items) {
                0       => 'Not linked yet',
                1       => 'Linked to 1 item',
                default => "Linked to {$items} items",
            },
            'is_general'   => (bool) $recording->is_general,
            'has_audio'    => $hasAudio,
            'audio_url'    => $hasAudio ? route('admin.recordings.audio', $recording->id) : null,
            // Code first — it is what an admin working from the sheet types —
            // then both locales, so a search matches whichever they use.
            'search'       => Str::lower(trim(
                $recording->code . ' '
                . $recording->id . ' '
                . $recording->getTranslation('description', 'ar', false) . ' '
                . $recording->getTranslation('description', 'en', false)
            )),
        ];
    }

    private static function firstNonEmptyTranslation(Recording $recording, array $locales): string
    {
        foreach ($locales as $locale) {
            $text = trim((string) $recording->getTranslation('description', $locale, false));

            if ($text !== '') {
                // Collapse the newlines in a multi-line Ruqyah text so the
                // checkbox stays a single readable line.
                return (string) preg_replace('/\s+/u', ' ', $text);
            }
        }

        return '';
    }
}
