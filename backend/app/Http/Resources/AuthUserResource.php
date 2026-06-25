<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AuthUserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'email'       => $this->email,
            'phone'       => $this->phone,
            'country'     => $this->country,
            'gender'      => $this->gender,
            'avatar_path' => $this->getFilamentAvatarUrl(),
        ];
    }
}
