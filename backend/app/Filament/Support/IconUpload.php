<?php

namespace App\Filament\Support;

use Filament\Forms\Components\Checkbox;
use Filament\Forms\Components\FileUpload;
use Filament\Notifications\Notification;
use Filament\Schemas\Components\Utilities\Get;
use Illuminate\Support\Str;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

/**
 * Reusable icon uploader for CMS resources (categories, subcategories, diseases…).
 *
 * SVG is strongly recommended because it stays crisp at any size. Other image
 * formats are still allowed, but the moment a non-SVG is chosen the admin gets a
 * kind warning popup and must tick an acknowledgement checkbox before saving —
 * so they consciously accept responsibility for the display quality.
 *
 * Usage inside a form schema:
 *   return [
 *       // …other fields…
 *       ...IconUpload::make('categories'),
 *   ];
 */
class IconUpload
{
    /** @return array<int, \Filament\Forms\Components\Component> */
    public static function make(string $directory, string $helper = 'Best result: upload an SVG (stays crisp at any size). PNG/JPG/WebP are allowed but may look blurry in the app.'): array
    {
        return [
            FileUpload::make('icon')
                ->label('Icon')
                ->image()
                ->acceptedFileTypes([
                    'image/svg+xml',
                    'image/png',
                    'image/jpeg',
                    'image/webp',
                    'image/gif',
                ])
                ->maxSize(500)
                ->disk('public')
                ->directory($directory)
                ->live()
                ->helperText($helper)
                ->afterStateUpdated(function ($state): void {
                    if (self::stateHasNonSvg($state)) {
                        Notification::make()
                            ->title('Heads up — this icon isn\'t an SVG')
                            ->body('For the sharpest result please use an SVG. PNG/JPG/WebP icons can look blurry or pixelated in the app. You can still keep this file, but you\'ll need to confirm below that you accept the display quality.')
                            ->warning()
                            ->persistent()
                            ->send();
                    }
                }),

            Checkbox::make('icon_format_ack')
                ->label('I understand this icon isn\'t an SVG and may not display well in the app — I accept responsibility for the display quality.')
                ->dehydrated(false)
                ->live()
                ->visible(fn (Get $get): bool => self::stateHasNonSvg($get('icon')))
                ->rule('accepted')
                ->validationMessages([
                    'accepted' => 'Please confirm you accept using a non-SVG icon, or upload an SVG instead.',
                ]),
        ];
    }

    /** Whether the current FileUpload state contains any non-SVG file. */
    private static function stateHasNonSvg(mixed $state): bool
    {
        if (blank($state)) {
            return false;
        }

        $files = is_array($state) ? $state : [$state];

        foreach ($files as $file) {
            $name = match (true) {
                $file instanceof TemporaryUploadedFile => $file->getClientOriginalName(),
                is_string($file)                       => $file,
                default                                => '',
            };

            if ($name !== '' && ! Str::endsWith(Str::lower($name), '.svg')) {
                return true;
            }
        }

        return false;
    }
}
