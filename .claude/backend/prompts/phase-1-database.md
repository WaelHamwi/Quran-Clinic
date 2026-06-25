# PHASE 1: DATABASE MIGRATIONS

Workers: 4 | Mode: EXECUTION | Executor: Laravel Expert

FILES (27 migrations):
1_users,2_roles,3_permissions,4_model_has_roles,5_role_has_permissions,6_model_has_permissions,7_media,8_surahs,9_verses,10_categories,11_subcategories,12_diseases,13_disease_aliases,14_recordings,15_favorites,16_adhkar_categories,17_adhkar_items,18_adhkar_sections,19_tahsinat_categories,20_tahsinat_items,21_courses,22_sponsors,23_sponsor_screen_config,24_feedback,25_feature_flags,26_notification_preferences,27_push_notifications

See .claude/backend/agents/database-architect.md

RULES: No comments, ../mobile/ never referenced
favorites: disease_id (not recording_id), diseases: is_general flag

AFTER: php artisan migrate:fresh
VERIFY: 27 tables exist, favorites.disease_id, diseases.is_general

OUTPUT: ✓ Migration 1 created by Laravel Executor. Next?
