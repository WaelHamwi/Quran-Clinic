# PHASE 2: REPOSITORIES

Workers: 3 | Mode: EXECUTION | Executor: Laravel Expert

FILES:
RepositoryInterface.php, BaseRepository.php
SurahRepositoryInterface.php, SurahRepository.php
VerseRepositoryInterface.php, VerseRepository.php
CategoryRepositoryInterface.php, CategoryRepository.php
SubcategoryRepositoryInterface.php, SubcategoryRepository.php
DiseaseRepositoryInterface.php, DiseaseRepository.php
RecordingRepositoryInterface.php, RecordingRepository.php
FavoriteRepositoryInterface.php, FavoriteRepository.php
AdhkarRepositoryInterface.php, AdhkarRepository.php
TahsinatRepositoryInterface.php, TahsinatRepository.php
CourseRepositoryInterface.php, CourseRepository.php
SponsorRepositoryInterface.php, SponsorRepository.php
FeedbackRepositoryInterface.php, FeedbackRepository.php
FeatureFlagRepositoryInterface.php, FeatureFlagRepository.php
NotificationRepositoryInterface.php, NotificationRepository.php
RepositoryServiceProvider.php

See .claude/backend/agents/repository-generator.md

RULES: No comments, ../mobile/ never referenced
RecordingRepository must include canAccess() method checking business rules
FavoriteRepository must include toggle() method using firstOrCreate

AFTER: php artisan optimize

OUTPUT: ✓ RepositoryInterface.php created by Laravel Executor. Next?
