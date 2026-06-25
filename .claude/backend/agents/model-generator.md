# ELOQUENT MODEL DESIGNER

USER: app/Models/User.php - HasApiTokens, SoftDeletes, HasRoles
Methods: isSubscribed(), isSuperAdmin(), isAdmin(), hasActiveTrial(), canGrantTrial(), grantTrial()
Relations: belongsToMany(Disease::class, 'favorites'), hasMany(Feedback::class), hasOne(NotificationPreference::class)

CATEGORY: app/Models/Category.php - SoftDeletes
Relations: hasMany(Subcategory::class)

SUBCATEGORY: app/Models/Subcategory.php - SoftDeletes
Relations: belongsTo(Category::class), hasMany(Disease::class)

DISEASE: app/Models/Disease.php - SoftDeletes
Relations: belongsTo(Subcategory::class), hasMany(Recording::class), belongsToMany(User::class, 'favorites')
Methods: isGeneral(), getAliasesAttribute()

RECORDING: app/Models/Recording.php - SoftDeletes
Relations: belongsTo(Disease::class), belongsTo(User::class, 'created_by')
Scopes: free(session=1), premium(session>1)
Methods: canBeAccessedBy(User $user), getStreamUrl()

FAVORITE: app/Models/Favorite.php
Relations: belongsTo(User::class), belongsTo(Disease::class)
Methods: toggle($userId, $diseaseId) - uses firstOrCreate

ADHKAR_ITEM: app/Models/AdhkarItem.php
Relations: belongsTo(AdhkarCategory::class)
Scopes: morning(), evening(), sleep(), waking()

TAHSINAT_ITEM: app/Models/TahsinatItem.php
Relations: belongsTo(TahsinatCategory::class)
Scopes: self(), forOthers()

COURSE: app/Models/Course.php - SoftDeletes
$fillable: title, description, instructor_name, price, start_date, whatsapp_link, is_coming_soon, is_active, display_order

SPONSOR: app/Models/Sponsor.php - SoftDeletes
$fillable: name, logo_path, website_url, target_countries, target_genders, is_featured, display_on_launch, display_order, is_active

SPONSOR_SCREEN_CONFIG: app/Models/SponsorScreenConfig.php
$fillable: is_enabled, display_duration_seconds, selected_sponsor_id

FEEDBACK: app/Models/Feedback.php
$fillable: user_id, service_type, service_id, was_beneficial, likes, dislikes, comment

FEATURE_FLAG: app/Models/FeatureFlag.php
$fillable: feature_key, is_visible

NOTIFICATION_PREFERENCE: app/Models/NotificationPreference.php
$fillable: user_id, adhkar_morning_enabled, adhkar_evening_enabled, adhkar_sleep_enabled, adhkar_waking_enabled, waking_start_time, waking_end_time
