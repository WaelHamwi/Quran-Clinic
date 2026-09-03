<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Verse extends Model
{
    // No InvalidatesCache: verses are read one surah at a time via the uncached
    // SurahService::getSurahWithVerses (indexed query) — no cached aggregate embeds them.
    use HasTranslations, SoftDeletes;

    protected $fillable = [
        'surah_id',
        'verse_number',
        'text',
        'text_norm',
    ];

    public array $translatable = ['text'];

    protected $casts = [
        'verse_number' => 'integer',
    ];

    protected static function booted(): void
    {
        // Keep the pre-normalized search column in sync with the Arabic text for
        // any single-model write (e.g. Filament edits). Bulk seeder inserts bypass
        // model events and fill text_norm themselves in QuranSeederService.
        static::saving(function (Verse $verse): void {
            $ar = $verse->getTranslations('text')['ar'] ?? '';
            $verse->text_norm = $ar === '' ? null : self::normalizeArabic($ar);
        });
    }

    public function surah(): BelongsTo
    {
        return $this->belongsTo(Surah::class);
    }

    public function scopeBySurah(Builder $query, int $surahId): Builder
    {
        return $query->where('surah_id', $surahId)->orderBy('verse_number');
    }

    /**
     * Fast search against the pre-normalized `text_norm` column — a plain LIKE
     * instead of the legacy full-scan that ran two REGEXP_REPLACE calls per row.
     * VerseRepository falls back to scopeSearchLegacy when the column is absent
     * (database not yet upgraded via `php artisan verses:normalize`).
     */
    public function scopeSearch(Builder $query, string $term): Builder
    {
        $term = trim($term);

        return $query->where(function (Builder $q) use ($term) {
            // English — plain case-insensitive match
            $q->where('text->en', 'like', "%{$term}%");

            // Arabic — diacritic-insensitive: the stored copy is already
            // normalized, so only the user's term needs normalizing here.
            $normalized = self::normalizeArabic($term);
            if ($normalized !== '') {
                $q->orWhere('text_norm', 'like', '%' . $normalized . '%');
            }
        });
    }

    /** Legacy per-row normalization search — fallback for databases without `text_norm`. */
    public function scopeSearchLegacy(Builder $query, string $term): Builder
    {
        $term = trim($term);

        return $query->where(function (Builder $q) use ($term) {
            // English — plain case-insensitive match
            $q->where('text->en', 'like', "%{$term}%");

            // Arabic — diacritic-insensitive. The Mushaf text is stored fully
            // vowelled (Uthmani), so a raw LIKE against undiacritised user input
            // never matches. Strip harakat/tatweel and normalise alef/hamza forms
            // on BOTH the stored column and the search term before comparing.
            // REGEXP_REPLACE only exists on MySQL/MariaDB (same guard as the
            // disease FULLTEXT search) — other drivers keep the English branch.
            $normalized = self::normalizeArabic($term);
            $driver     = $q->getConnection()->getDriverName();
            if ($normalized !== '' && in_array($driver, ['mysql', 'mariadb'], true)) {
                $expr = self::arabicNormalizeSql("JSON_UNQUOTE(JSON_EXTRACT(`text`, '$.ar'))");
                $q->orWhereRaw("{$expr} LIKE ?", ['%' . $normalized . '%']);
            }
        });
    }

    // Every combining mark the Uthmani Mushaf uses: harakat (064B–065F), dagger
    // alef (0670), the small high/low Quranic annotation signs (06D6–06ED — this
    // is where the U+06E1 sukun lives) and tatweel (0640). The previous set only
    // covered 064B–0652, so vowelled words such as ٱللَّه never reduced to الله and
    // Arabic search returned nothing.
    private const ARABIC_MARKS = '\x{0610}-\x{061A}\x{064B}-\x{065F}\x{0670}\x{06D6}-\x{06DC}\x{06DF}-\x{06E8}\x{06EA}-\x{06ED}\x{0640}';

    /** Strip Arabic diacritics + Quranic signs + tatweel and normalise alef/hamza/ya/ta-marbuta (PHP side). */
    public static function normalizeArabic(string $value): string
    {
        // Drop all combining marks so fully-vowelled text reduces to bare letters
        $value = preg_replace('/[' . self::ARABIC_MARKS . ']/u', '', $value);
        // Alef variants + alef-wasla → bare alef
        $value = preg_replace('/[\x{0622}\x{0623}\x{0625}\x{0671}]/u', "\u{0627}", $value);
        // Alef-maksura → ya, ta-marbuta → ha (match common undiacritised spellings)
        $value = str_replace(["\u{0649}", "\u{0629}"], ["\u{064A}", "\u{0647}"], $value);

        return trim($value);
    }

    /** Build a SQL expression mirroring normalizeArabic() so the column matches the term. */
    private static function arabicNormalizeSql(string $col): string
    {
        // REGEXP_REPLACE (MySQL 8 / MariaDB 10.0.5+) strips the whole mark set in one
        // pass — the hand-listed REPLACE chain could never cover the 06D6–06ED signs.
        // The character classes are built from literal code points (real UTF-8 chars,
        // ranges via "-") rather than \x{…}, because MySQL's string parser would strip
        // the lone backslash from an \x escape and corrupt the pattern.
        $marks = "\u{0610}-\u{061A}\u{064B}-\u{065F}\u{0670}\u{06D6}-\u{06DC}\u{06DF}-\u{06E8}\u{06EA}-\u{06ED}\u{0640}";
        $alef  = "\u{0622}\u{0623}\u{0625}\u{0671}";
        $expr  = "REGEXP_REPLACE({$col}, '[{$marks}]', '')";
        // Alef variants + alef-wasla → bare alef
        $expr  = "REGEXP_REPLACE({$expr}, '[{$alef}]', '\u{0627}')";
        // Alef-maksura → ya, ta-marbuta → ha
        $expr  = "REPLACE(REPLACE({$expr}, '\u{0649}', '\u{064A}'), '\u{0629}', '\u{0647}')";

        return $expr;
    }
}
