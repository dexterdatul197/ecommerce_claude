# ShopNext

A full-stack e-commerce application built with Next.js 15 and Laravel 11.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui |
| State | TanStack Query v5, Zustand |
| Auth | next-auth v5, Laravel Sanctum (Bearer token) |
| Backend | Laravel 11, PHP 8.2+ |
| Database | MySQL 8 |
| Payments | Stripe |

---

## Project Structure

```
ecommerce/
├── backend/    Laravel 11 REST API  (port 8000)
└── frontend/   Next.js 15 app       (port 3000)
```

---

## Getting Started

### Prerequisites

- PHP 8.2+ with Composer (via XAMPP or Laragon)
- Node.js 18+ with npm
- MySQL 8

### Backend

```bash
cd backend

# First run — copy env, install dependencies, migrate and seed
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

### Frontend

```bash
cd frontend

# Copy env and install
cp .env.local.example .env.local
npm install
npm run dev
```

### Environment variables

**`frontend/.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
BACKEND_URL=http://localhost:8000
AUTH_SECRET=<random-32-char-string>
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**`backend/.env`** — key values to check after copying from `.env.example`:
```
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
DB_DATABASE=ecommerce
DB_USERNAME=root
DB_PASSWORD=
STRIPE_SECRET=sk_test_...
MAIL_MAILER=log   # emails written to storage/logs/laravel.log in dev
```

---

## Seeded Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ecommerce.com | password |
| Customer | customer@ecommerce.com | password |

---

## Features

### Store (customer-facing)
- Product catalogue with search, category filter, and sort
- Product detail page with image carousel and attribute selection
- Shopping cart with quantity management
- Checkout with address selection and Stripe payment
- Order history and order detail with status tracker
- Product reviews (requires a purchase)
- Account page — profile, address book, password change
- Forgot / reset password flow

### Admin panel (`/admin`)
- Dashboard with revenue chart and low-stock alerts
- Product management — CRUD, image upload/delete, status
- Order management — status updates, order detail view
- Customer management — list and toggle active status
- Category management
- Coupon management
- Review moderation

---

## API Overview

Base URL: `http://localhost:8000/api`

| Group | Auth | Prefix |
|-------|------|--------|
| Public | None | `/` |
| Customer | Bearer token | `/` |
| Admin | Bearer token + admin role | `/admin/` |

All responses follow `{ data, message?, meta? }` structure using Laravel Eloquent Resources.

---

## Development Notes

- Password reset emails are written to `backend/storage/logs/laravel.log` when `MAIL_MAILER=log`
- Product images uploaded via admin are stored in `backend/storage/app/public/products/`
- The `storage:link` command must be run once to serve uploaded images at `/storage/...`
- Cart UI state (drawer open/count) lives in Zustand; cart data is fetched via TanStack Query
- All API calls go through `frontend/src/lib/api.ts` (Axios with auto Bearer token injection)
