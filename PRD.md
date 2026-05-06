# Product Requirements Document — ShopNext

## 1. Product Vision
ShopNext is a full-featured e-commerce platform allowing customers to browse, purchase, and review products, while administrators manage the entire catalogue, orders, promotions, and customers through a dedicated admin panel.

## 2. User Personas

### Customer
- Browses products by category, search, price, rating
- Registers/logs in with email + password
- Manages a cart and places orders (cash-on-delivery or Stripe card)
- Applies discount coupons at checkout
- Saves multiple shipping/billing addresses
- Tracks order history and statuses
- Leaves product reviews (pending admin approval)

### Administrator
- Has role `admin` in the users table
- Accesses `/admin` panel protected by server-side auth check
- Full CRUD over products, categories, coupons
- Manages and fulfils orders (status transitions)
- Moderates customer reviews (approve / reject / delete)
- Views dashboard with revenue charts and KPIs
- Bans / unbans customer accounts

## 3. Feature Requirements

### Customer Store
| # | Feature | Priority |
|---|---------|----------|
| 1 | Product listing with filters (category, price range, rating, sort) | P0 |
| 2 | Product detail page with image gallery, attribute selector, reviews tab | P0 |
| 3 | Shopping cart (add, update quantity, remove, coupon) | P0 |
| 4 | Checkout with address selection and payment method | P0 |
| 5 | Email/password registration and login | P0 |
| 6 | Order history and order detail | P1 |
| 7 | Account profile (name, email, phone, password change) | P1 |
| 8 | Address book (add, edit, delete shipping/billing addresses) | P1 |
| 9 | Product reviews (submit rating + text, requires purchase) | P1 |
| 10 | Stripe card payment | P2 |

### Admin Panel
| # | Feature | Priority |
|---|---------|----------|
| 1 | Dashboard: revenue chart, order stats, low stock alerts | P0 |
| 2 | Product CRUD with images and variant attributes | P0 |
| 3 | Category CRUD with slugs | P0 |
| 4 | Order management with status updates | P0 |
| 5 | Customer listing with ban/unban | P1 |
| 6 | Coupon CRUD (percentage / fixed amount) | P1 |
| 7 | Review moderation (approve / reject / delete) | P1 |

## 4. Non-Functional Requirements
- **Auth**: Token-based (Sanctum) with JWT session in Next.js (next-auth v5)
- **Security**: Admin routes protected server-side; SQL queries via Eloquent ORM (no raw user input in queries)
- **Performance**: Product search uses MySQL FULLTEXT index; TanStack Query caches API responses (60s stale)
- **Pagination**: All list endpoints paginated (15 items/page default)
- **Images**: Stored on the server filesystem, served via `storage/` symlink; URL prefix `http://localhost:8000/storage/`

## 5. Out of Scope (v1)
- Real-time notifications (WebSockets / Pusher)
- Multi-vendor / marketplace features
- Inventory reservations / holds
- Email transactional notifications (order confirmation, shipping)
- Multi-language / multi-currency
- Mobile app
