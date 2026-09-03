<?php

namespace App\Filament\Resources\Subcategories\Schemas;

use App\Filament\Support\IconUpload;
use App\Filament\Support\RecordingAttachmentsField;
use App\Filament\Support\TranslatedName;
use App\Models\Category;
use App\Models\Subcategory;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SubcategoryForm
{
    public static function getSchema(): array
    {
        return [
            Select::make('category_id')
                ->label('Category')
                ->options(fn () => TranslatedName::options(Category::where('type', 'standard')->ordered()->get()))
                ->searchable()
                ->required()
                ->helperText('Only standard-type categories can have subcategories.'),
            Select::make('type')
                ->label('Holds')
                ->options([
                    Subcategory::TYPE_STANDARD => 'Diseases — the recordings sit on each disease',
                    Subcategory::TYPE_DIRECT   => 'Recordings directly — no diseases underneath',
                ])
                ->default(Subcategory::TYPE_STANDARD)
                ->required()
                ->live()
                ->native(false)
                ->helperText('Cannot be changed once the subcategory has diseases or recordings of its own.'),

            TextInput::make('name.ar')->label('Name (Arabic)')->required()->maxLength(255),
            TextInput::make('name.en')
                ->label('Name (English)')
                ->required()
                ->maxLength(255)
                ->live(onBlur: true)
                ->afterStateUpdated(fn (Set $set, ?string $state) => $set('slug', Str::slug($state ?? ''))),
            ...IconUpload::make('subcategories'),
            TextInput::make('display_order')->numeric()->default(0),
            Toggle::make('is_active')->default(true),
            // Only a subcategory declared as holding recordings offers them —
            // a new one holds nothing yet, so its kind cannot be inferred. One
            // that already holds links still shows them, so they can be seen
            // and removed rather than stranded.
            ...RecordingAttachmentsField::make(
                eligible: fn (Get $get, ?Model $record): bool => $get('type') === Subcategory::TYPE_DIRECT
                    || RecordingAttachmentsField::alreadyLinked($record),
                hint: 'Recordings attach to this subcategory only when "Holds" is set to "Recordings directly". As it stands, they belong on the diseases underneath it — change "Holds" above to link them here instead.',
            ),
        ];
    }
}
