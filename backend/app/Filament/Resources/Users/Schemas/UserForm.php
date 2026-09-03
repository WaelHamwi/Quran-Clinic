<?php

namespace App\Filament\Resources\Users\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Role;

class UserForm
{
    public static function getSchema(): array
    {
        return [
            Section::make('Account Information')
                ->description('Name, email and role for this user.')
                ->icon('heroicon-o-user-circle')
                ->columns(2)
                ->schema([
                    TextInput::make('name')
                        ->label('Full Name')
                        ->required()
                        ->maxLength(255),

                    TextInput::make('email')
                        ->label('Email Address')
                        ->email()
                        ->required()
                        ->maxLength(255)
                        ->unique(table: 'users', column: 'email', ignoreRecord: true),

                    Select::make('roles')
                        ->label('Role')
                        ->relationship('roles', 'name')
                        ->options(fn () => Role::pluck('name', 'id')->map(fn ($name) => match ($name) {
                            'super_admin' => 'Super Admin',
                            'admin'       => 'Admin',
                            default       => 'User',
                        }))
                        ->native(false)
                        ->preload()
                        ->required(),
                ]),

            Section::make('Account Status')
                ->description('Subscription and suspension state for this user.')
                ->icon('heroicon-o-shield-check')
                ->columns(2)
                ->schema([
                    Toggle::make('is_subscribed')
                        ->label('Subscribed')
                        ->helperText('Grants premium access independent of the trial system.'),

                    DateTimePicker::make('subscription_expires_at')
                        ->label('Subscription / Trial Expires At')
                        ->native(false),

                    Toggle::make('is_suspended')
                        ->label('Suspended')
                        ->helperText('A suspended user is rejected on every authenticated API request.')
                        ->live()
                        ->afterStateUpdated(fn ($state, callable $set) => $set('suspended_at', $state ? now() : null))
                        ->default(false),

                    DateTimePicker::make('suspended_at')
                        ->label('Suspended At')
                        ->native(false)
                        ->disabled()
                        ->dehydrated(),
                ]),

            Section::make('Profile Photo')
                ->description('Optional avatar shown in the admin panel.')
                ->icon('heroicon-o-camera')
                ->columns(1)
                ->schema([
                    FileUpload::make('avatar_path')
                        ->label('')
                        ->avatar()
                        ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
                        ->disk('public')
                        ->directory('avatars')
                        ->imageEditor()
                        ->circleCropper()
                        ->maxSize(8192)
                        ->dehydrated(fn ($state): bool => filled($state)),
                ]),

            Section::make('Password')
                ->description('Set a password. On edit, leave blank to keep the current password.')
                ->icon('heroicon-o-lock-closed')
                ->columns(2)
                ->schema([
                    TextInput::make('password')
                        ->label('Password')
                        ->password()
                        ->revealable()
                        ->rule(Password::default())
                        ->dehydrated(fn ($state): bool => filled($state))
                        ->dehydrateStateUsing(fn ($state): string => bcrypt($state))
                        ->required(fn (string $operation): bool => $operation === 'create')
                        ->maxLength(255),

                    TextInput::make('password_confirmation')
                        ->label('Confirm Password')
                        ->password()
                        ->revealable()
                        ->same('password')
                        ->dehydrated(false)
                        ->required(fn (string $operation): bool => $operation === 'create')
                        ->maxLength(255),
                ]),
        ];
    }
}
