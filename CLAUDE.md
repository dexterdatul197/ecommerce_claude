# ShopNext — Claude Code Guide

## Project Overview
Full-stack e-commerce application: Next.js 15 frontend + Laravel 11 REST API backend.

## Directory Structure
```
ecommerce/
├── backend/   Laravel 11 API  (port 8000)
└── frontend/  Next.js 15 app  (port 3000)
```

## Running the Project

### Backend (requires PHP 8.2+ and Composer via Laragon)
```powershell
cd backend
.\setup.ps1          # first run: install, migrate, seed
php artisan serve    # subsequent runs
```

### Frontend
```powershell
cd frontend
npm install          # already done
npm run dev
```

## Key Credentials (seeded)
| Role     | Email                    | Password  |
|----------|--------------------------|-----------|
| Admin    | admin@ecommerce.com      | password  |
| Customer | customer@ecommerce.com   | password  |

## Tech Stack
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query v5, Zustand, next-auth v5
- **Backend**: Laravel 11, MySQL 8, Laravel Sanctum, Stripe PHP SDK

## Environment Files
- `frontend/.env.local` — copy from `.env.local.example`, fill `AUTH_SECRET` and Stripe key
- `backend/.env` — created by `setup.ps1` from `.env.example`, set `DB_PASSWORD` if needed

## Important Conventions

### Backend
- All API routes are in `routes/api.php` with three middleware groups: public, `auth:sanctum`, `auth:sanctum + admin`
- Admin routes use the `admin` middleware alias defined in `bootstrap/app.php`
- JSON error responses for 401/403/404/422 are configured in `bootstrap/app.php` `withExceptions()`
- Eloquent Resources live in `app/Http/Resources/` — always use them in controller responses
- Form Request validation classes are in `app/Http/Requests/`

### Frontend
- Route groups: `(store)` for customer-facing, `(admin)` for admin panel
- All API calls go through `src/lib/api.ts` (Axios instance with Sanctum Bearer token interceptor)
- Cart UI state (open/count) lives in Zustand (`src/store/cart.ts`); actual cart data from TanStack Query
- Admin layout (`src/(admin)/layout.tsx`) is a server component that protects all admin routes via `auth()`
- shadcn/ui components are in `src/components/ui/` — written from scratch, no CLI needed

## API Base URL
- Dev: `http://localhost:8000/api`
- Auth header: `Authorization: Bearer <sanctum_token>`
