<?php

namespace App\Repositories;

use App\Models\FeatureFlag;
use App\Repositories\Contracts\FeatureFlagRepositoryInterface;

class FeatureFlagRepository implements FeatureFlagRepositoryInterface
{
    public function all(): array
    {
        return FeatureFlag::query()
            ->get()
            ->mapWithKeys(fn (FeatureFlag $flag) => [$flag->feature_key => $flag->is_visible])
            ->toArray();
    }
}
