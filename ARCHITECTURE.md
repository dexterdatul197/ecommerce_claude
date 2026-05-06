# Architecture — ShopNext

## System Overview

```
Browser  ──►  Next.js 15 (port 3000)  ──►  Laravel 11 API (port 8000)  ──►  MySQL 8
                   │                              │
              next-auth v5                  Laravel Sanctum
              (JWT session)               (Bearer token auth)
```

## Backend — Laravel 11

### Bootstrap
Laravel 11 uses the new fluent bootstrap API (no Http Kernel). All middleware, routing, and exception handling is configured in `bootstrap/app.php`:
- API routes loaded from `routes/api.php`
- `admin` middleware alias → `AdminMiddleware`
- `statefulApi()` enables Sanctum SPA cookie support
- JSON error handlers for 401, 403, 404, 422

### Directory Layout
```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/          Public + authenticated controllers
│   │   │   └── Admin/                Admin-only controllers
│   │   ├── Middleware/AdminMiddleware.php
│   │   ├── Requests/                 Form Request validation
│   │   └── Resources/                Eloquent API Resources
│   ├── Models/                       Eloquent models
│   └── Providers/AppServiceProvider.php
├── bootstrap/app.php                 Core application config
├── config/cors.php                   CORS: allows FRONTEND_URL
├── database/
│   ├── migrations/                   13 migration files
│   └── seeders/                      Admin, categories, products, coupons
└── routes/api.php                    All 40+ API endpoints
```

### API Route Groups
```
/api
├── (public)      GET /products, GET /categories, POST /auth/login, POST /auth/register
├── auth:sanctum  GET/POST /cart, POST /orders, GET /orders, GET /addresses, POST /reviews
└── auth:sanctum + admin
    └── /admin    CRUD /products, /categories, /orders, /coupons, /customers, /reviews
                  GET /dashboard
```

### Order Placement Flow
1. Validate stock for every item in `DB::transaction()`
2. Apply coupon discount (if any)
3. Create `Order` record with JSON shipping snapshot
4. Create `OrderItem` records with product snapshot
5. Decrement `products.stock` for each item
6. Increment `coupons.used_count`
7. Clear `cart_items` for the user
8. If Stripe: create `PaymentIntent` and return `client_secret`

## Frontend — Next.js 15

### Route Groups
```
src/app/
├── layout.tsx               Root layout (Providers: SessionProvider + QueryClientProvider)
├── (store)/
│   ├── layout.tsx           Header + Footer wrapper
│   ├── page.tsx             Home: hero, categories, featured products
│   ├── products/            Listing (filters) + detail (gallery, attributes, reviews)
│   ├── cart/                Cart with coupon input
│   ├── checkout/            Address + payment method
│   ├── orders/              Order history + order detail
│   ├── account/             Profile + address book
│   └── auth/login|register
└── (admin)/
    ├── layout.tsx           Server component: auth() check, redirects if not admin
    └── admin/
        ├── page.tsx         Dashboard
        ├── products/        CRUD table + dialog
        ├── categories/      CRUD table + dialog
        ├── orders/          Table + status dropdown + detail dialog
        ├── customers/       Table + ban/unban
        ├── coupons/         CRUD table + dialog
        └── reviews/         Moderation table
```

### State Management
| Layer | Tool | What it stores |
|-------|------|----------------|
| Server state | TanStack Query v5 | All API data (products, cart, orders, …) |
| Auth session | next-auth v5 JWT | `accessToken`, `user.role`, `user.id` |
| Cart UI | Zustand | `isOpen` (sheet), `count` (badge) |
| Form state | React `useState` | Local dialog/form values |

### Auth Flow
1. User submits login form → `signIn('credentials', { redirect: false })`
2. next-auth `authorize()` calls `POST /api/auth/login` on the Laravel backend
3. Laravel returns Sanctum token → stored in next-auth JWT as `accessToken`
4. On each API call, `src/lib/api.ts` interceptor calls `getSession()` and injects `Authorization: Bearer <token>`
5. Admin layout (`(admin)/layout.tsx`) calls `auth()` server-side — redirects to login if `role !== 'admin'`

### Key Files
| File | Purpose |
|------|---------|
| `src/lib/api.ts` | Axios instance with Bearer token interceptor |
| `src/lib/auth.ts` | next-auth v5 config (Credentials provider, JWT callbacks) |
| `src/lib/utils.ts` | `cn`, `formatCurrency`, `formatDate`, `getStatusColor`, `slugify` |
| `src/types/index.ts` | All shared TypeScript interfaces |
| `src/store/cart.ts` | Zustand cart UI store |
| `src/hooks/useCart.ts` | Cart CRUD mutations + Zustand sync |
| `src/hooks/useOrders.ts` | Order placement, history, cancel |
| `src/hooks/useProducts.ts` | Product listing and detail queries |

## Data Flow — Add to Cart
```
ProductPage (click Add to Cart)
  └─ useCart.addItem.mutate({ product_id, attribute_id, quantity })
       └─ api.post('/cart')         [Bearer token attached by interceptor]
            └─ CartController@store [Laravel creates/updates cart_item]
                 └─ TanStack Query invalidates ['cart']
                      └─ useCart refetches → Zustand count updated via useEffect
```
