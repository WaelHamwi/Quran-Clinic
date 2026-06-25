# VALIDATION CHECKLIST

PRE-BUILD:
- SCAN complete, ../mobile/ ignored, approvals obtained

POST-MIGRATION:
- All tables exist, favorites.disease_id, diseases.is_general, ../mobile/ untouched

POST-REPOSITORY:
- All models have RepositoryInterface, no comments

POST-FILAMENT:
- Super Admin sees all, Admin sees content

POST-API:
- GET /api/categories works, GET /api/diseases/search works, GET /api/general-ruqyah works
- POST /api/favorites/toggle stores disease_id, session_number=1 free
- session_number>=2 requires subscription/trial, trial max 2, no comments

POST-SECURITY:
- Policies enforce roles, middleware registered, ../mobile/ untouched

CODE QUALITY:
- No inline comments, no deletion without approval
