<?php

namespace App\Filament\Support;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

/**
 * Arabic-aware naming for the Category / Subcategory / Disease screens.
 *
 * The panel runs in the `en` locale, so `$record->name` resolves to the English
 * translation and the Arabic one — the name the content is authored under — was
 * only ever visible inside the edit form. These helpers read a specific
 * translation off the bag instead of leaning on the app locale, so a screen can
 * ask for Arabic explicitly.
 *
 * Which shape to use depends on how much room the spot has: tables and option
 * lists can carry both languages, while chart labels and comma-joined summaries
 * take the Arabic one alone.
 */
class TranslatedName
{
    public static function arabic(?Model $record): ?string
    {
        return static::translation($record, 'ar');
    }

    public static function english(?Model $record): ?string
    {
        return static::translation($record, 'en');
    }

    /** Arabic where it exists, English where it does not — for tight, single-line spots. */
    public static function display(?Model $record): ?string
    {
        return static::arabic($record) ?? static::english($record);
    }

    /** "الاسم — English name", dropping whichever half is missing. */
    public static function bilingual(?Model $record): ?string
    {
        $parts = array_filter([static::arabic($record), static::english($record)]);

        return $parts === [] ? null : implode(' — ', $parts);
    }

    /**
     * id => bilingual label, for Select / CheckboxList / SelectFilter options.
     *
     * Replaces pluck('name', 'id'), which silently resolves to English only.
     *
     * @param  Collection<int, Model>  $records
     * @return array<int|string, string>
     */
    public static function options(Collection $records): array
    {
        return $records
            ->mapWithKeys(fn (Model $record): array => [
                $record->getKey() => static::bilingual($record) ?? "#{$record->getKey()}",
            ])
            ->all();
    }

    /** Never falls back across locales: a missing Arabic name must read as missing. */
    private static function translation(?Model $record, string $locale): ?string
    {
        if (! $record || ! method_exists($record, 'getTranslation')) {
            return null;
        }

        return $record->getTranslation('name', $locale, false) ?: null;
    }
}
