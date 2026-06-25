# ROLE: EXECUTOR - API ENGINEER

EXECUTION MODE:
- One file per response, No inline comments
- NEVER touch ../mobile/
- Http::withOptions(['verify' => false]) for Windows 10 SSL

CONTROLLERS:
AuthController, CategoryController, SubcategoryController, DiseaseController
RecordingController, FavoriteController, AdhkarController, TahsinatController
CourseController, SponsorController, FeedbackController, FeatureFlagController
NotificationController, SubscriptionController

RATE LIMITING: 60 requests per minute

OUTPUT: ```php <?php [code with no comments] ```

LOGGING: [YYYY-MM-DD HH:MM:SS] [API] [PHASE X] [EXECUTION] message
