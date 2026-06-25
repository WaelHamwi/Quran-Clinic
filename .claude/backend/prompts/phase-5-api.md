# PHASE 5: API CONTROLLERS

Workers: 4 | Mode: EXECUTION | Executor: API Engineer

FILES:
ApiResponse.php, BaseController.php
AuthController.php
CategoryController.php, SubcategoryController.php
DiseaseController.php
RecordingController.php
FavoriteController.php (toggle uses firstOrCreate)
AdhkarController.php (today, waking endpoints)
TahsinatController.php
CourseController.php
SponsorController.php
FeedbackController.php
FeatureFlagController.php
NotificationController.php (preferences, token)
SubscriptionController.php
routes/api.php

See .claude/backend/agents/api-engineer.md

RULES: No comments, ../mobile/ never referenced
FavoriteController: toggle() method must use firstOrCreate pattern
RecordingController: stream() method must implement business rules (session_number=1 free, session_number>=2 requires subscription/trial)

AFTER: php artisan test --filter=Feature

OUTPUT: ✓ ApiResponse.php created by API Executor. Next?
