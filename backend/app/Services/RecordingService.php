<?php

namespace App\Services;

use App\Models\Recording;
use App\Models\User;
use App\Repositories\Contracts\RecordingRepositoryInterface;
use Illuminate\Support\Collection;

class RecordingService
{
    public function __construct(private RecordingRepositoryInterface $repository) {}

    public function getByDisease(int $diseaseId): Collection
    {
        return $this->repository->byDisease($diseaseId);
    }

    public function find(int $id): ?Recording
    {
        return $this->repository->findById($id);
    }

    public function recordPlay(Recording $recording): void
    {
        $this->repository->incrementPlays($recording);
    }

    public function generalRuqyah(): Collection
    {
        return $this->repository->generalRuqyah();
    }

    /**
     * Visibility gate for the direct-ID endpoints: hidden content (owner node
     * inactive or removed) stays a 404 for everyone except admins, who need to
     * preview unpublished sessions.
     */
    public function canView(Recording $recording, ?User $user): bool
    {
        return $recording->isPubliclyVisible() || ($user !== null && $user->isAdmin());
    }

    public function canAccess(Recording $recording, ?User $user): bool
    {
        if ($recording->isFreeSession()) {
            return true;
        }

        if ($user === null) {
            return false;
        }

        // Admins manage the content and must be able to preview any session.
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->isSubscribed() || $user->hasActiveTrial()) {
            return true;
        }

        if ($user->canGrantTrial()) {
            $user->grantTrial();

            return true;
        }

        return false;
    }
}
