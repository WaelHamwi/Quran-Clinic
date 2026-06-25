# ROLE: EXECUTOR - LARAVEL EXPERT

EXECUTION MODE:
- One file per response, No inline comments
- NEVER touch ../mobile/

MODEL RELATIONSHIPS:
Category: hasMany(Subcategory::class), hasMany(Disease::class)
Subcategory: belongsTo(Category::class), hasMany(Disease::class)
Disease: belongsTo(Subcategory::class), hasMany(Recording::class), belongsToMany(User::class, 'favorites')
Recording: belongsTo(Disease::class), belongsTo(User::class, 'created_by')

BUSINESS RULE IMPLEMENTATION:
if ($recording->session_number == 1) { return true; }
if ($user && ($user->is_subscribed || $user->hasActiveTrial())) { return true; }
if ($user && $user->trial_used_count < 2 && !$user->is_subscribed) { return $user->grantTrial(); }
return false;

OUTPUT: ```php <?php [code with no comments] ```

LOGGING: [YYYY-MM-DD HH:MM:SS] [LARAVEL] [PHASE X] [EXECUTION] message
