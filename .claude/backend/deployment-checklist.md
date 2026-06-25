# DEPLOYMENT CHECKLIST

ENVIRONMENT:
- APP_ENV=production, APP_DEBUG=false

OPTIMIZATION:
- php artisan config:cache, route:cache, view:cache, storage:link

SECURITY:
- Rate limiting (60/min), Sanctum expiry 24h, CORS for mobile, no web routes

CACHE:
- Cache driver configured (redis recommended)

CODE QUALITY:
- No inline comments, no deletions without approval

INTEGRITY:
- ../mobile/ untouched, favorites.disease_id, is_general flag, search aliases
