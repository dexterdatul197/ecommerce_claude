# TODO — ShopNext

## Setup (Do This First)

- [ ] Install [Laragon](https://laragon.org/download/) (PHP 8.2+, MySQL 8, Composer bundled)
- [ ] Open Laragon → Start All (MySQL running on 3306)
- [ ] Create database:
  ```sql
  CREATE DATABASE ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```
- [ ] Run backend setup:
  ```powershell
  cd C:\Workspace\ecommerce\backend
  .\setup.ps1
  ```
- [ ] Start backend server:
  ```powershell
  php artisan serve
  ```
- [ ] Start frontend (new terminal):
  ```powershell
  cd C:\Workspace\ecommerce\frontend
  npm run dev
  ```
- [ ] Open http://localhost:3000

---

## Done

- [x] Laravel 11 project scaffolded (74 files)
  - [x] Models: User, Product, Category, Order, OrderItem, CartItem, Coupon, Address, Review, ProductImage, ProductAttribute
  - [x] Migrations: 13 tables including FULLTEXT index on products
  - [x] API Controllers (public, auth, admin)
  - [x] Eloquent API Resources
  - [x] Form Request validation classes
  - [x] AdminMiddleware + admin route group
  - [x] Database seeders (admin user, categories, products, coupons)
  - [x] Stripe PaymentIntent integration in OrderController
  - [x] `setup.ps1` automated setup script
- [x] Next.js 15 project scaffolded (~65 files)
  - [x] Route groups: `(store)` and `(admin)`
  - [x] next-auth v5 with Credentials provider (JWT session)
  - [x] Axios instance with Bearer token interceptor
  - [x] TanStack Query v5 for all server state
  - [x] Zustand cart UI store (open/count)
  - [x] All shadcn/ui components written from scratch
  - [x] Customer store: home, product listing, product detail, cart, checkout, orders, account
  - [x] Admin panel: dashboard, products, categories, orders, customers, coupons, reviews
  - [x] `npm install` completed (512 packages)
  - [x] `.env.local` created from example

---

## Pending Features

### High Priority
- [ ] **Image upload UI** — Admin product form has no image upload; backend endpoint exists (`POST /admin/products/{id}/images`). Add a file input that calls it.
- [ ] **Stripe checkout flow** — Frontend checkout submits `payment_method: 'stripe'`, backend returns `client_secret`. Need to add `@stripe/stripe-js` + `@stripe/react-stripe-js` and render `CardElement` in checkout.
- [ ] **Real Stripe keys** — Replace `pk_test_...` in `frontend/.env.local` and add `STRIPE_SECRET` to `backend/.env`.

### Medium Priority
- [ ] **Order confirmation email** — Add a `Mail` class + queued job triggered after order creation. Set `MAIL_MAILER=smtp` in `.env` (Mailtrap for dev).
- [ ] **Product search** — `GET /products?search=...` hits the FULLTEXT index. Add a search input to the products listing page header.
- [ ] **Review eligibility check** — Backend `POST /reviews` should verify the user has a delivered order containing the product before allowing a review.
- [ ] **Password reset** — `POST /auth/forgot-password` + `POST /auth/reset-password` routes. Add forgot-password page in frontend.

### Low Priority
- [ ] **Admin image management** — View/delete existing product images in the admin product edit dialog.
- [ ] **Category hierarchy UI** — Products listing filter shows flat list; could show nested parent → children.
- [ ] **Low stock alerts** — Already shown on admin dashboard. Could add email alert when stock drops below threshold.
- [ ] **Order tracking page** — Public order status page accessible by order number (no auth required).
- [ ] **Pagination on admin lists** — Coupons and Categories admin pages currently load all records; add pagination for large datasets.

---

## Known Issues

- `npm warn deprecated eslint@8.57.1` — comes from Next.js dev dependency, not blocking
- PowerShell execution policy may block `npm` directly; use `cmd /c "npm ..."` or run from Laragon terminal
- `frontend/.env.local` has a placeholder `AUTH_SECRET` — change before deploying to production
