<?php

namespace App\Filament\Forms\Components;

use Closure;
use Filament\Forms\Components\Field;

/**
 * Recording sequence builder for the Category / Subcategory / Disease forms.
 *
 * A checkbox list cannot express what a ruqyah actually is. The same passage
 * opens the session, returns in the middle and closes it, so the state here is
 * an ordered LIST of recording ids in which repeats are meaningful — position N
 * becomes session_number N + 1, and the same id may sit at several positions.
 *
 * The list itself is unreadable as plain options once there are dozens:
 * recordings have no title, so the label has to carry the whole Ruqyah text.
 * The view renders a searchable card per recording — text excerpt, duration,
 * how many items already reuse it, and a preview player — reveals only the
 * first few until the admin asks for more, and keeps the chosen sequence in its
 * own panel above so it is never hidden behind "show more".
 */
class RecordingPicker extends Field
{
    protected string $view = 'filament.forms.components.recording-picker';

    /**
     * @var array<int, array<string, mixed>>|Closure
     */
    protected array|Closure $recordings = [];

    protected int|Closure $initiallyVisible = 5;

    protected string|Closure|null $emptyMessage = null;

    /**
     * @param  array<int, array<string, mixed>>|Closure  $recordings
     */
    public function recordings(array|Closure $recordings): static
    {
        $this->recordings = $recordings;

        return $this;
    }

    /** How many cards to show before the "Show more" button. */
    public function initiallyVisible(int|Closure $count): static
    {
        $this->initiallyVisible = $count;

        return $this;
    }

    public function emptyMessage(string|Closure|null $message): static
    {
        $this->emptyMessage = $message;

        return $this;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function getRecordings(): array
    {
        return array_values($this->evaluate($this->recordings));
    }

    public function getInitiallyVisible(): int
    {
        return max(1, (int) $this->evaluate($this->initiallyVisible));
    }

    public function getEmptyMessage(): string
    {
        return $this->evaluate($this->emptyMessage) ?? 'No recordings of this type yet.';
    }

    /**
     * The chosen sequence: an ordered list of id strings in which a repeated
     * id is a repeated session, not a duplicate to be collapsed. Always a list,
     * even when nothing has been added yet.
     */
    public function getSelectedIds(): array
    {
        $state = $this->getState();

        return is_array($state) ? array_values(array_map('strval', $state)) : [];
    }

    /**
     * The cards keyed by id, so the sequence panel can name an entry without
     * hunting through the card list for it on every render.
     *
     * @return array<string, array<string, mixed>>
     */
    public function getRecordingsById(): array
    {
        $byId = [];

        foreach ($this->getRecordings() as $recording) {
            $byId[(string) $recording['id']] = $recording;
        }

        return $byId;
    }
}
