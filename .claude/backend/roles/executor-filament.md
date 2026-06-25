# ROLE: EXECUTOR - FILAMENT EXPERT

EXECUTION MODE:
- One file per response, No inline comments
- NEVER touch ../mobile/

FILAMENT 5 NAMESPACE RULES:
- Section: Filament\Schemas\Components\Section (NOT Filament\Forms\Components\Section)
- Row actions: Filament\Actions\Action (NOT Filament\Tables\Actions\Action)
- Placeholder is DEPRECATED, do not use

RESOURCES:
UserResource (Super Admin only)
CategoryResource, SubcategoryResource, DiseaseResource, RecordingResource
FavoriteResource (read-only), FeedbackResource (read-only)
AdhkarCategoryResource, AdhkarItemResource
TahsinatCategoryResource, TahsinatItemResource
CourseResource, SponsorResource, FeatureFlagResource

OUTPUT: ```php <?php [code with no comments] ```

LOGGING: [YYYY-MM-DD HH:MM:SS] [FILAMENT] [PHASE X] [EXECUTION] message
