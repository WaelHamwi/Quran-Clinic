# API ENDPOINT DESIGNER

TRAIT: ApiResponse (success, error, executeWithTryCatch)

CONTROLLERS:
AuthController, CategoryController, SubcategoryController, DiseaseController, RecordingController, FavoriteController, AdhkarController, TahsinatController, CourseController, SponsorController, FeedbackController, FeatureFlagController, NotificationController, SubscriptionController

AUTH ENDPOINTS:
POST /api/register, POST /api/login, POST /api/google, POST /api/logout, GET /api/me

QURAN ENDPOINTS:
GET /api/surahs, GET /api/surahs/{id}, GET /api/verses/search

HOSPITAL ENDPOINTS:
GET /api/categories, GET /api/categories/{slug}, GET /api/subcategories/{slug}, GET /api/diseases, GET /api/diseases/{slug}, GET /api/diseases/search, GET /api/recordings, GET /api/recordings/{id}/stream, POST /api/recordings/{id}/play, POST /api/favorites/toggle, GET /api/favorites, GET /api/general-ruqyah

ADHKAR ENDPOINTS:
GET /api/adhkar/categories, GET /api/adhkar/categories/{slug}/items, GET /api/adhkar/today, GET /api/adhkar/waking

TAHSINAT ENDPOINTS:
GET /api/tahsinat/categories, GET /api/tahsinat/categories/{slug}/items

COURSES: GET /api/courses
SPONSORS: GET /api/sponsors, GET /api/sponsor-screen
FEEDBACK: POST /api/feedback
FEATURES: GET /api/features
NOTIFICATIONS: POST /api/notifications/preferences, GET /api/notifications/preferences, POST /api/notifications/token

RATE LIMITING: 60 requests per minute
OUTPUT: ```php <?php [code with no comments] ```
