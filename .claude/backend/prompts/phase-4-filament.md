# PHASE 4: FILAMENT CMS

Workers: 4 | Mode: EXECUTION | Executor: Filament Expert

FILES:
ReusableFormFields.php, ReusableTableColumns.php
UserResource.php
CategoryResource.php, SubcategoryResource.php
DiseaseResource.php (with is_general checkbox and aliases management)
RecordingResource.php (session_number, type: summarized/detailed)
FavoriteResource.php (read-only)
AdhkarCategoryResource.php, AdhkarItemResource.php
TahsinatCategoryResource.php (self/others, random_order), TahsinatItemResource.php
CourseResource.php (is_coming_soon toggle)
SponsorResource.php (logo upload, display_on_launch)
FeedbackResource.php (read-only, filter by was_beneficial)
FeatureFlagResource.php (toggle feature visibility)
StatisticsDashboard.php, StatsOverviewWidget.php, FeedbackChartWidget.php, ExpiringSubscriptionsWidget.php, PopularDiseasesWidget.php

See .claude/backend/agents/filament-cms-builder.md

RULES: No comments, ../mobile/ never referenced

AFTER: php artisan filament:cache-components

OUTPUT: ✓ ReusableFormFields.php created by Filament Executor. Next?
