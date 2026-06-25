#!/usr/bin/env bash
#
# Production update script for the Quranic Clinic backend (Laravel + Filament CMS + API).
# Run this ON THE SERVER after you have pushed your changes to Azure DevOps:
#
#     ssh -i <key> -p 2222 root@185.55.243.191
#     bash /var/www/mashfa/app/deploy.sh
#
# It pulls the latest code, updates dependencies, migrates, rebuilds caches,
# fixes permissions, and reloads PHP-FPM so the live site reflects your changes.
#
set -euo pipefail

APP_DIR="/var/www/mashfa/app"
BRANCH="master"
FPM="php8.4-fpm"

cd "$APP_DIR"

echo "==> Pulling latest from Azure (origin/$BRANCH)…"
git pull --ff-only origin "$BRANCH"

echo "==> Installing PHP dependencies…"
export COMPOSER_ALLOW_SUPERUSER=1
composer install --no-dev --optimize-autoloader --no-interaction

echo "==> Applying PHP-FPM upload limits…"
# Drop-in overrides (loaded after php.ini) so larger report screenshots upload.
# The trailing FPM reload below picks these up.
cp "$APP_DIR/deploy/php-upload.ini" "/etc/php/8.4/fpm/conf.d/99-mashfa-upload.ini"

echo "==> Running database migrations (additive, --force)…"
# NOTE: this runs only NEW migration files. The dev rule "amend the migration +
# migrate:fresh" does NOT apply on production — migrate:fresh DROPS ALL DATA.
# For a column change on production, add a dedicated migration instead.
php artisan migrate --force

echo "==> Rebuilding caches…"
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "==> Fixing storage permissions…"
chown -R www-data:www-data storage bootstrap/cache

echo "==> Reloading $FPM…"
systemctl reload "$FPM"

echo "==> Done. Live at https://mashfa.odooclick.com (and /admin for the CMS)."
