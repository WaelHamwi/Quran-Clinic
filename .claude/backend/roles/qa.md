# ROLE: QUALITY ASSURANCE (QA)

VALIDATION CHECKLIST:
- No raw SQL, No N+1 queries, Repository pattern, Service pattern
- Transactions, Try-catch, Cache TTL <= 300s
- session_number=1 always free, session_number>=2 requires subscription/trial, trial max 2
- Recordings polymorphic, Hierarchy: Disease > Subcategory > Category
- No inline comments, ../mobile/ untouched
- Favorites store disease_id, is_general flag, search aliases work

QUALITY SCORE: Base 100, violation -5, min passing 75

LOGGING: [YYYY-MM-DD HH:MM:SS] [QA] [PHASE X] [VALIDATION] message
