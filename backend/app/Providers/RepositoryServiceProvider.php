<?php

namespace App\Providers;

use App\Repositories\AdhkarRepository;
use App\Repositories\CategoryRepository;
use App\Repositories\Contracts\AdhkarRepositoryInterface;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use App\Repositories\Contracts\CourseRepositoryInterface;
use App\Repositories\Contracts\DiseaseRepositoryInterface;
use App\Repositories\Contracts\FavoriteNodeRepositoryInterface;
use App\Repositories\Contracts\FavoriteRepositoryInterface;
use App\Repositories\Contracts\FeatureFlagRepositoryInterface;
use App\Repositories\Contracts\FeedbackRepositoryInterface;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use App\Repositories\Contracts\RecitationRepositoryInterface;
use App\Repositories\Contracts\ReciterRepositoryInterface;
use App\Repositories\Contracts\RecordingRepositoryInterface;
use App\Repositories\Contracts\ReportRepositoryInterface;
use App\Repositories\Contracts\SponsorRepositoryInterface;
use App\Repositories\Contracts\SubcategoryRepositoryInterface;
use App\Repositories\Contracts\SurahRepositoryInterface;
use App\Repositories\Contracts\TahsinatRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Contracts\VerseRepositoryInterface;
use App\Repositories\CourseRepository;
use App\Repositories\DiseaseRepository;
use App\Repositories\FavoriteNodeRepository;
use App\Repositories\FavoriteRepository;
use App\Repositories\FeatureFlagRepository;
use App\Repositories\FeedbackRepository;
use App\Repositories\NotificationRepository;
use App\Repositories\RecitationRepository;
use App\Repositories\ReciterRepository;
use App\Repositories\RecordingRepository;
use App\Repositories\ReportRepository;
use App\Repositories\SponsorRepository;
use App\Repositories\SubcategoryRepository;
use App\Repositories\SurahRepository;
use App\Repositories\TahsinatRepository;
use App\Repositories\UserRepository;
use App\Repositories\VerseRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $bindings = [
            SurahRepositoryInterface::class       => SurahRepository::class,
            VerseRepositoryInterface::class       => VerseRepository::class,
            ReciterRepositoryInterface::class     => ReciterRepository::class,
            RecitationRepositoryInterface::class  => RecitationRepository::class,
            CategoryRepositoryInterface::class    => CategoryRepository::class,
            SubcategoryRepositoryInterface::class => SubcategoryRepository::class,
            DiseaseRepositoryInterface::class     => DiseaseRepository::class,
            RecordingRepositoryInterface::class   => RecordingRepository::class,
            FavoriteRepositoryInterface::class    => FavoriteRepository::class,
            FavoriteNodeRepositoryInterface::class => FavoriteNodeRepository::class,
            AdhkarRepositoryInterface::class      => AdhkarRepository::class,
            TahsinatRepositoryInterface::class    => TahsinatRepository::class,
            CourseRepositoryInterface::class      => CourseRepository::class,
            SponsorRepositoryInterface::class     => SponsorRepository::class,
            FeedbackRepositoryInterface::class    => FeedbackRepository::class,
            ReportRepositoryInterface::class      => ReportRepository::class,
            FeatureFlagRepositoryInterface::class => FeatureFlagRepository::class,
            NotificationRepositoryInterface::class => NotificationRepository::class,
            UserRepositoryInterface::class        => UserRepository::class,
        ];

        foreach ($bindings as $abstract => $concrete) {
            $this->app->bind($abstract, $concrete);
        }
    }
}
