# PHASE 3: MODELS + SERVICES + TESTS + SEEDERS

Workers: 5 | Mode: EXECUTION | Executor: Laravel Expert

FILES:
Models: User, Category, Subcategory, Disease, Recording, Favorite, AdhkarCategory, AdhkarItem, AdhkarSection, TahsinatCategory, TahsinatItem, Course, Sponsor, SponsorScreenConfig, Feedback, FeatureFlag, NotificationPreference, PushNotification
Services: CategoryService, DiseaseService, RecordingService, FavoriteService, AdhkarService, TahsinatService, CourseService, SponsorService, FeedbackService, FeatureFlagService, NotificationService, TrialService, SubscriptionService, GoogleAuthService
Helpers: Helpers.php
Seeders: QuranSeeder, DiseaseSeeder, AdhkarSeeder, TahsinatSeeder, SponsorSeeder, FeatureFlagSeeder
Tests: RepositoryTest, ServiceTest, SeederTest

See .claude/backend/agents/model-generator.md, service-generator.md, seeder-generator.md

RULES: No comments, ../mobile/ never referenced
User model: methods isSubscribed(), hasActiveTrial(), canGrantTrial(), grantTrial()
Recording model: method canBeAccessedBy(User $user) implementing business rules
Favorite model: method toggle($userId, $diseaseId) using firstOrCreate

AFTER: php artisan test --filter=Unit

OUTPUT: ✓ Model User.php created by Laravel Executor. Next?
