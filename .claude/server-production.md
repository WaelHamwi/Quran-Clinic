# SERVER PRODUCTION — LIVE REFLECTION GUIDE

Single source of truth for how local changes reach the **live** environment for every
component: backend, CMS, API, and the mobile app. Referenced from `shared-context.md`.

---

## 1. PRODUCTION INFRASTRUCTURE

| Item | Value |
|---|---|
| Server | Ubuntu 24.04 — `ssh -i <key> -p 2222 root@185.55.243.191` |
| SSH key | `id_ed25519_MashfaQurani_pro` |
| Domain | https://mashfa.odooclick.com (Let's Encrypt SSL via Certbot, Nginx) |
| Backend path | `/var/www/mashfa/app` (git repo, `origin` = Azure DevOps `Core-Click/Almashfa`) |
| Web root | `/var/www/mashfa/app/public` (Nginx → PHP-FPM 8.4 socket) |
| Stack | PHP **8.4** (ondrej PPA — Symfony 8 needs 8.4), Composer, MySQL 8 |
| Database | `quranic_clinic`, user `quranic`@localhost (password in app `.env` + `/root/.mashfa_dbpass`) |
| CMS | Filament at `/admin` (admin: `admin@quran.local`) |
| Code repos | Backend → Azure `Almashfa` (branch `master`); Mobile → local git repo (EAS builds) |

The **backend, CMS, and API are one Laravel app** — deploying the backend updates all three at once.

---

## 2. THE GENERAL RULE — SERVER LIVE REFLECTION

> A change is only "live" once it is **(a) committed, (b) shipped to the server, and (c) the
> server has rebuilt its caches / the client has the new bundle.** Editing local files alone
> never changes production.

- **Backend / CMS / API** → push to Azure, then run `deploy.sh` on the server. Code is interpreted, so the change is live immediately after `git pull` + cache rebuild + FPM reload. **No build step.**
- **Mobile app** → JS lives inside an installed binary. A code change is live only after either an **OTA update** (JS-only) or a **new APK/AAB build** (native changes). **There is a build step.**

Whenever you change config that affects the live app (API URL, env, Nginx, `.env`), update both the running config **and** this doc.

---

## 3. BACKEND / CMS / API — UPDATE FLOW (no build)

Your loop, every time you change backend code:

```powershell
# 1. LOCAL — commit & push your changes to Azure
cd C:\Users\wael\Desktop\Quran\backend
git add -A
git commit -m "..."
git push origin master
```

```bash
# 2. SERVER — pull & apply (one command)
ssh -i C:\Users\wael\Downloads\id_ed25519_MashfaQurani_pro -p 2222 root@185.55.243.191
bash /var/www/mashfa/app/deploy.sh
```

`deploy.sh` does: `git pull` → `composer install --no-dev` → `migrate --force` →
`config/route/view:cache` → fix permissions → reload PHP-FPM.

### Auth for `git pull` on the server
The server uses git's credential **store** so pulls are non-interactive. The Azure PAT is saved
at `/root/.git-credentials` (chmod 600). To rotate the token:

```bash
git config --global credential.helper store
printf 'https://Core-Click:<NEW_PAT>@dev.azure.com\n' > /root/.git-credentials
chmod 600 /root/.git-credentials
```
PAT scope needed: **Code → Read**. Create at https://dev.azure.com/Core-Click/_usersSettings/tokens.

### ⚠ Migrations on production
The dev rule "amend the original migration + `migrate:fresh`" **must NOT be used on production** —
`migrate:fresh` **drops all data**. On production, `deploy.sh` runs `migrate --force`, which only
applies *new* migration files. For a schema change that must reach production without data loss,
add a dedicated migration file for it.

---

## 4. MOBILE APP — UPDATE FLOW (build step)

The app's API base URL is resolved in `mobile/src/services/api.ts` → `getApiUrl()`, which reads
`app.json` → `expo.extra.API_BASE_URL` (**= https://mashfa.odooclick.com/api**). Never hardcode a
tunnel/localhost URL there again.

### Do I need a new APK every time? — Two cases
- **JS / TS / asset only** (screens, logic, styles, strings): can ship as an **OTA update** — no rebuild, testers get it on next app launch. *(Requires EAS Update set up once — see §4.2.)*
- **Native change** (new native module, app.json plugins, permissions, icon/splash, SDK bump): **must build a new APK/AAB**.

### 4.1 Build a new APK (from the server — local network blocks EAS uploads)
The local machine cannot reach EAS over IPv4; builds are launched from the server instead.

```bash
# LOCAL — package the committed mobile source and ship it to the server
cd C:\Users\wael\Desktop\Quran\mobile
git add -A && git commit -m "..."
git archive --format=tar.gz -o C:/Users/wael/Downloads/mobile-build.tgz HEAD
scp -i <key> -P 2222 C:/Users/wael/Downloads/mobile-build.tgz root@185.55.243.191:/root/mobile-build.tgz

# SERVER — extract over the existing build dir (keeps node_modules) and build
ssh -i <key> -p 2222 root@185.55.243.191
cd /root/mobile-build && tar xzf /root/mobile-build.tgz
export EXPO_TOKEN='<expo-access-token>'   # https://expo.dev/settings/access-tokens
export EAS_NO_VCS=1
npx eas-cli build --platform android --profile preview --non-interactive --no-wait
# poll:  npx eas-cli build:view <id>   → "Application Archive URL" is the .apk link
```

- Profile `preview` → installable **APK** (`eas.json`). Profile `production` → **AAB** for Play Store.
- First run on a clean server also needs `npm install` once inside `/root/mobile-build`.
- Distribute the `Application Archive URL` (`https://expo.dev/artifacts/eas/<id>.apk`) to testers.
- EAS project: `@wael_hamwi/quranic-clinic`.

### 4.2 OTA updates (recommended next step — skip rebuilds for JS changes)
Set up once: `npx eas-cli update:configure` (adds `expo-updates`), then rebuild **one** APK that
contains the updates runtime. After that, JS-only changes ship with:
`eas update --branch preview --message "..."` — no new APK, testers get it on relaunch.

---

## 5. QUICK REFERENCE

| Change type | Action | Live when |
|---|---|---|
| Backend code / API / CMS | push to Azure → `deploy.sh` | after FPM reload |
| Backend `.env` | edit on server → `php artisan config:cache` + reload FPM | immediately |
| Nginx config | edit → `nginx -t && systemctl reload nginx` | immediately |
| Mobile JS/asset (with EAS Update) | `eas update` | next app launch |
| Mobile JS/asset (no EAS Update) | rebuild APK (§4.1) | after reinstall |
| Mobile native change | rebuild APK/AAB (§4.1) | after reinstall |
