# FILAMENT 5 CMS DESIGNER

REUSABLE TRAITS:
ReusableFormFields: getNameFields, getActiveToggle, getDisplayOrderField
ReusableTableColumns: getNameColumns, getActiveIconColumn, getDisplayOrderColumn

RESOURCES:
UserResource (Super Admin only)
CategoryResource (Admin only)
SubcategoryResource (Admin only)
DiseaseResource (Admin only) - with is_general checkbox, aliases management
RecordingResource (Admin only) - session_number, type (summarized=free / detailed=paid, max one of each per owner)
FavoriteResource (Admin only, read-only)
AdhkarCategoryResource (Admin only)
AdhkarItemResource (Admin only) - morning/evening/sleep/waking flags
TahsinatCategoryResource (Admin only) - self/others, random_order
TahsinatItemResource (Admin only)
CourseResource (Admin only) - is_coming_soon toggle
SponsorResource (Admin only) - logo upload, display_on_launch
FeedbackResource (Admin only, read-only) - filter by was_beneficial
FeatureFlagResource (Admin only) - toggle feature visibility

PAGES: StatisticsDashboard
WIDGETS: StatsOverviewWidget, FeedbackChartWidget, ExpiringSubscriptionsWidget, PopularDiseasesWidget

OUTPUT: ```php <?php [code with no comments] ```
