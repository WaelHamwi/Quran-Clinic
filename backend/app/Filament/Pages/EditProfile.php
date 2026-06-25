<?php

namespace App\Filament\Pages;

use Filament\Auth\Pages\EditProfile as BaseEditProfile;
use Filament\Forms\Components\FileUpload;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class EditProfile extends BaseEditProfile
{
    public function form(Schema $schema): Schema
    {
        return $schema->components([

            Section::make('Profile Photo')
                ->description('Upload a photo that will appear across the admin panel.')
                ->icon('heroicon-o-camera')
                ->columns(1)
                ->schema([
                    FileUpload::make('avatar_path')
                        ->label('')
                        ->avatar()
                        ->disk('public')
                        ->directory('avatars')
                        ->maxSize(8192)
                        ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
                        ->dehydrated(filled(...)),
                ]),

            Section::make('Personal Information')
                ->description('Update your name and email address.')
                ->icon('heroicon-o-user')
                ->columns(2)
                ->schema([
                    $this->getNameFormComponent(),
                    $this->getEmailFormComponent(),
                ]),

            Section::make('Change Password')
                ->description('Leave blank to keep your current password.')
                ->icon('heroicon-o-lock-closed')
                ->columns(2)
                ->schema([
                    $this->getPasswordFormComponent(),
                    $this->getPasswordConfirmationFormComponent(),
                    $this->getCurrentPasswordFormComponent(),
                ]),

        ]);
    }
}
