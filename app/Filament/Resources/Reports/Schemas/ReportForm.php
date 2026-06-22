<?php

namespace App\Filament\Resources\Reports\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;

class ReportForm
{
    public static function getSchema(): array
    {
        return [
            // Reports are user-submitted and immutable from the CMS — only the
            // triage status is editable so admins can track what they've handled.
            TextInput::make('user.name')
                ->label('Submitted by')
                ->disabled()
                ->dehydrated(false)
                ->placeholder('Guest'),
            Select::make('type')
                ->options([
                    'bug'        => 'Technical bug',
                    'suggestion' => 'Improvement suggestion',
                ])
                ->disabled()
                ->dehydrated(false),
            Textarea::make('message')
                ->rows(6)
                ->disabled()
                ->dehydrated(false)
                ->columnSpanFull(),
            FileUpload::make('image_path')
                ->label('Attached image')
                ->image()
                ->disk('public')
                ->directory('reports')
                ->disabled()
                ->dehydrated(false)
                ->visible(fn ($record) => $record?->image_path)
                ->columnSpanFull(),
            Select::make('status')
                ->options([
                    'new'         => 'New',
                    'in_progress' => 'In progress',
                    'resolved'    => 'Resolved',
                ])
                ->default('new')
                ->required(),
        ];
    }
}
