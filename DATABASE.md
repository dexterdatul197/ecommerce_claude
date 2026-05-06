# Database Schema — ShopNext

**Engine**: MySQL 8  
**Database**: `ecommerce`  
**Charset**: utf8mb4

---

## Tables

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| name | varchar(255) | |
| email | varchar(255) | unique |
| password | varchar(255) | bcrypt |
| role | enum('customer','admin') | default: customer |
| phone | varchar(20) | nullable |
| is_active | boolean | default: true |
| remember_token | varchar(100) | nullable |
| created_at / updated_at | timestamps | |

### `categories`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| parent_id | bigint FK → categories.id | nullable (top-level) |
| name | varchar(255) | |
| slug | varchar(255) | unique |
| description | text | nullable |
| image | varchar(255) | nullable |
| created_at / updated_at | timestamps | |

### `products`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| category_id | bigint FK → categories.id | nullable |
| name | varchar(255) | FULLTEXT |
| slug | varchar(255) | unique |
| description | longtext | FULLTEXT |
| short_description | text | nullable, FULLTEXT |
| price | decimal(10,2) | |
| compare_price | decimal(10,2) | nullable (original price for sale display) |
| stock | int | default: 0 |
| sku | varchar(100) | nullable, unique |
| status | enum('active','inactive','draft') | default: active |
| is_featured | boolean | default: false |
| weight | decimal(8,2) | nullable |
| created_at / updated_at | timestamps | |

**Index**: FULLTEXT on `(name, description, short_description)`

### `product_images`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| product_id | bigint FK → products.id | cascade delete |
| url | varchar(255) | path under storage/ |
| alt | varchar(255) | nullable |
| sort_order | int | default: 0 |
| created_at / updated_at | timestamps | |

### `product_attributes`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| product_id | bigint FK → products.id | cascade delete |
| name | varchar(255) | e.g. "Color", "Size" |
| value | varchar(255) | e.g. "Red", "XL" |
| price_modifier | decimal(10,2) | default: 0.00 |
| stock | int | default: 0 |
| created_at / updated_at | timestamps | |

### `coupons`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| code | varchar(50) | unique, uppercase |
| type | enum('percentage','fixed') | |
| value | decimal(10,2) | percent (0-100) or dollar amount |
| min_order_amount | decimal(10,2) | nullable |
| max_uses | int | nullable (unlimited if null) |
| used_count | int | default: 0 |
| expires_at | timestamp | nullable |
| is_active | boolean | default: true |
| created_at / updated_at | timestamps | |

### `addresses`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| user_id | bigint FK → users.id | cascade delete |
| type | enum('shipping','billing') | |
| first_name | varchar(100) | |
| last_name | varchar(100) | |
| company | varchar(100) | nullable |
| address_line_1 | varchar(255) | |
| address_line_2 | varchar(255) | nullable |
| city | varchar(100) | |
| state | varchar(100) | |
| postal_code | varchar(20) | |
| country | varchar(2) | ISO 3166-1 alpha-2 |
| phone | varchar(20) | nullable |
| is_default | boolean | default: false |
| created_at / updated_at | timestamps | |

### `orders`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| user_id | bigint FK → users.id | nullable (guest future) |
| order_number | varchar(50) | unique, e.g. ORD-20240101-00001 |
| status | enum('pending','processing','shipped','delivered','cancelled') | default: pending |
| subtotal | decimal(10,2) | |
| discount | decimal(10,2) | default: 0 |
| shipping | decimal(10,2) | default: 0 |
| tax | decimal(10,2) | default: 0 |
| total | decimal(10,2) | |
| coupon_code | varchar(50) | nullable |
| payment_method | enum('cod','stripe') | |
| payment_status | enum('pending','paid','failed','refunded') | default: pending |
| stripe_payment_intent_id | varchar(255) | nullable |
| shipping_address | json | snapshot of address at time of order |
| notes | text | nullable |
| created_at / updated_at | timestamps | |

### `order_items`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| order_id | bigint FK → orders.id | cascade delete |
| product_id | bigint FK → products.id | nullable (set null on product delete) |
| product_snapshot | json | name, sku, image captured at order time |
| attribute_id | bigint FK → product_attributes.id | nullable |
| attribute_snapshot | json | nullable, attribute name+value at order time |
| quantity | int | |
| unit_price | decimal(10,2) | |
| total_price | decimal(10,2) | unit_price × quantity |
| created_at / updated_at | timestamps | |

### `cart_items`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| user_id | bigint FK → users.id | cascade delete |
| product_id | bigint FK → products.id | cascade delete |
| attribute_id | bigint FK → product_attributes.id | nullable, cascade delete |
| quantity | int | |
| created_at / updated_at | timestamps | |

**Unique index**: `(user_id, product_id, attribute_id)`

### `reviews`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| user_id | bigint FK → users.id | cascade delete |
| product_id | bigint FK → products.id | cascade delete |
| rating | tinyint | 1–5 |
| title | varchar(255) | nullable |
| body | text | |
| status | enum('pending','approved','rejected') | default: pending |
| created_at / updated_at | timestamps | |

**Unique index**: `(user_id, product_id)` — one review per customer per product

---

## Relationships Summary

```
users
  ├─< orders
  ├─< addresses
  ├─< cart_items
  └─< reviews

categories (self-referencing)
  └─< products

products
  ├─< product_images
  ├─< product_attributes
  ├─< cart_items
  ├─< order_items
  └─< reviews

orders
  └─< order_items

coupons (referenced by orders.coupon_code)
```

---

## Seeded Data

| Seeder | Data |
|--------|------|
| AdminUserSeeder | admin@ecommerce.com (admin), customer@ecommerce.com (customer) |
| CategorySeeder | 4 parent categories, 12 child categories |
| ProductSeeder | 20 sample products with images + attributes |
| CouponSeeder | WELCOME10 (10% off), SAVE20 ($20 fixed, min $100) |
