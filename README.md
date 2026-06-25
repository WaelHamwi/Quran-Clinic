# Quran Clinic (Quranic Clinic)

Full-stack Islamic wellness app: **Laravel** API + Filament admin, and a **React Native (Expo)** mobile client.

## Structure

| Path        | Stack                                   | Notes                                            |
|-------------|-----------------------------------------|--------------------------------------------------|
| `backend/`  | Laravel 13, PHP 8.3, Filament 5, Sanctum | REST API + CMS. Layered Controller→Service→Repository. |
| `mobile/`   | Expo 54, React Native 0.81, Redux Toolkit + React Query | iOS/Android client. |

Each sub-project keeps its own `.gitignore`, dependencies, and history (merged in via `git subtree`).

## Getting started

```bash
# Backend
cd backend && composer install && cp .env.example .env && php artisan key:generate && php artisan migrate

# Mobile
cd mobile && npm install && npx expo start
```

## Conventions

- Commits: `feat:` `fix:` `test:` `docs:` `chore:` `refactor:` `perf:`
- Work on feature branches (`feat/…`, `fix/…`); open a PR into `main`.
