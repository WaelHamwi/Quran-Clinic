<?php

namespace App\Filament\Resources\Courses\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;

class CourseForm
{
    public static function getSchema(): array
    {
        return [
            TextInput::make('title.ar')->label('Title (Arabic)')->required()->maxLength(255),
            TextInput::make('title.en')->label('Title (English)')->required()->maxLength(255),
            Textarea::make('description.ar')->label('Description (Arabic)')->rows(3),
            Textarea::make('description.en')->label('Description (English)')->rows(3),
            Textarea::make('target_audience.ar')->label('Who is this course for? (Arabic)')->rows(3),
            Textarea::make('target_audience.en')->label('Who is this course for? (English)')->rows(3),
            Textarea::make('course_topics.ar')->label('Course topics (Arabic)')->helperText('One topic per line.')->rows(4),
            Textarea::make('course_topics.en')->label('Course topics (English)')->helperText('One topic per line.')->rows(4),
            Textarea::make('registration_info.ar')->label('Registration info (Arabic)')->helperText('One item per line.')->rows(4),
            Textarea::make('registration_info.en')->label('Registration info (English)')->helperText('One item per line.')->rows(4),
            TextInput::make('instructor_name')->maxLength(255),
            TextInput::make('price')->numeric()->minValue(0)->prefix('$'),
            DatePicker::make('start_date'),
            TextInput::make('image_url')->label('Cover image URL')->url()->maxLength(255),
            TextInput::make('whatsapp_link')->url()->maxLength(255),
            Toggle::make('is_coming_soon')->default(true),
            Toggle::make('is_active')->default(true),
            TextInput::make('display_order')->numeric()->default(0),
        ];
    }
}
