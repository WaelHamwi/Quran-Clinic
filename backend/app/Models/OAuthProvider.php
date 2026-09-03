<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OAuthProvider extends Model
{
    use HasFactory;

    protected $table = 'oauth_providers';

    // Google access/refresh tokens are deliberately not persisted: nothing ever
    // reads them back, and keeping live provider credentials in plaintext is a
    // liability. The nullable provider_token columns stay in the schema for a
    // future integration, which must store them encrypted.
    protected $fillable = [
        'user_id',
        'provider',
        'provider_user_id',
    ];

    /**
     * Get the user that owns the OAuth provider.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
