# SECURITY AUDITOR

SCOPE: Diseases, Recordings, Favorites, Categories, Users

POLICIES:
DiseasePolicy: view(true), manage(admin or super_admin)
RecordingPolicy: view(true), stream(recording), favorite(logged in)
FavoritePolicy: manage(owner only)
CategoryPolicy: manage(admin or super_admin)
UserPolicy: viewAny(super_admin only), delete(super_admin only)

RECORDING POLICY STREAM METHOD:
public function stream(User $user, Recording $recording)
{
    if ($recording->session_number == 1) { return true; }
    if ($user->is_subscribed || $user->hasActiveTrial()) { return true; }
    if ($user->canGrantTrial()) { $user->grantTrial(); return true; }
    return false;
}

MIDDLEWARE:
SetLocale: Accept-Language header
CheckSubscription: premium routes require active subscription
LogUserActivity: update last_active_at once per hour

CONFIGURATIONS:
sanctum.php: expiration = 1440
cors.php: allowed_origins = mobile app URL
Kernel.php: register middleware

SPATIE PERMISSION SEEDER:
Roles: super_admin, admin, regular_user
Permissions: view_users, manage_categories, manage_diseases, manage_recordings, manage_favorites, manage_sponsors, manage_adhkar, manage_tahsinat, manage_courses, manage_feature_flags

SECURITY AUDIT COMMANDS:
grep -r "DB::raw" app/ --exclude-dir=vendor
grep -r "../mobile/" app/ --exclude-dir=vendor

OUTPUT: ```php <?php [code with no comments] ```
