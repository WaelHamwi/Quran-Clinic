<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Filament\Models\Contracts\FilamentUser;
use Filament\Models\Contracts\HasAvatar;
use Filament\Models\Contracts\HasName;
use Filament\Panel;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

#[Fillable([
    'name', 'email', 'phone', 'country', 'gender',
    'password', 'avatar_path', 'last_active_at', 'expo_push_token',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements FilamentUser, HasAvatar, HasName
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasRoles, Notifiable, SoftDeletes;

    /**
     * Privileged columns deliberately excluded from Fillable so no API
     * payload can ever mass-assign them (overposting guard). The admin
     * panel and OAuth flow set them explicitly via forceFill().
     */
    public const PRIVILEGED_FIELDS = [
        'is_subscribed', 'subscription_expires_at', 'trial_used_count',
        'is_suspended', 'suspended_at', 'google_id',
    ];

    public function canAccessPanel(Panel $panel): bool
    {
        return $this->isAdmin();
    }

    public function getFilamentAvatarUrl(): ?string
    {
        if (! $this->avatar_path) return null;
        if (str_starts_with($this->avatar_path, 'http')) return $this->avatar_path;
        return Storage::disk('public')->url($this->avatar_path);
    }

    public function getFilamentName(): string
    {
        return $this->name;
    }

    public function issueApiToken(string $name): string
    {
        // Sanctum only *rejects* expired tokens; the rows survive until the
        // scheduled prune. Capping live sessions at 5 keeps frequent re-logins
        // from stacking a fresh 30-day token each time.
        $stale = $this->tokens()
            ->orderByDesc('id')
            ->skip(4)
            ->take(PHP_INT_MAX)
            ->pluck('id');

        if ($stale->isNotEmpty()) {
            $this->tokens()->whereIn('id', $stale)->delete();
        }

        return $this->createToken($name)->plainTextToken;
    }

    public function oauthProviders(): HasMany
    {
        return $this->hasMany(OAuthProvider::class);
    }

    public function hasOAuthProvider(string $provider): bool
    {
        return $this->oauthProviders()->where('provider', $provider)->exists();
    }

    public function favorites(): BelongsToMany
    {
        return $this->belongsToMany(Disease::class, 'favorites')->withTimestamps();
    }

    public function feedback(): HasMany
    {
        return $this->hasMany(Feedback::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }

    public function notificationPreference(): HasOne
    {
        return $this->hasOne(NotificationPreference::class);
    }

    public function pushNotifications(): HasMany
    {
        return $this->hasMany(PushNotification::class);
    }

    public function isAdmin(): bool
    {
        return $this->hasRole(['super_admin', 'admin']);
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super_admin');
    }

    public function isSubscribed(): bool
    {
        if ($this->is_subscribed) {
            return true;
        }

        return $this->subscription_expires_at !== null
            && $this->subscription_expires_at->isFuture();
    }

    public function hasActiveTrial(): bool
    {
        return ! $this->is_subscribed
            && $this->trial_used_count > 0
            && $this->subscription_expires_at !== null
            && $this->subscription_expires_at->isFuture();
    }

    public function canGrantTrial(): bool
    {
        return ! $this->isSubscribed()
            && $this->trial_used_count < 2;
    }

    public function grantTrial(): void
    {
        $this->trial_used_count++;
        $this->subscription_expires_at = now()->addDays(7);
        $this->save();
    }

    protected function casts(): array
    {
        return [
            'email_verified_at'       => 'datetime',
            'password'                => 'hashed',
            'is_subscribed'           => 'boolean',
            'subscription_expires_at' => 'datetime',
            'trial_used_count'        => 'integer',
            'last_active_at'          => 'datetime',
            'is_suspended'            => 'boolean',
            'suspended_at'            => 'datetime',
        ];
    }
}
