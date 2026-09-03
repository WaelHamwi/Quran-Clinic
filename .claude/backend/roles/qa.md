# ROLE: QUALITY ASSURANCE (QA)

VALIDATION CHECKLIST:
- No raw SQL, No N+1 queries, Repository pattern, Service pattern
- Transactions, Try-catch, Cache TTL <= 300s
- type=summarized always free, type=detailed requires subscription/trial, trial max 2, max one recording per type per owner
- Recordings polymorphic, Hierarchy: Disease > Subcategory > Category
- No inline comments, ../mobile/ untouched
- Favorites store disease_id, is_general flag, search aliases work

QUALITY SCORE: Base 100, violation -5, min passing 75

LOGGING: [YYYY-MM-DD HH:MM:SS] [QA] [PHASE X] [VALIDATION] message
