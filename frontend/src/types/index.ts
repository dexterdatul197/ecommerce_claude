export interface User {
  id: number
  name: string
  email: string
  phone?: string
  role: 'customer' | 'admin'
  is_active: boolean
  created_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  image?: string
  sort_order: number
  parent_id?: number
  children?: Category[]
}

export interface ProductImage {
  id: number
  url: string
  alt?: string
  sort_order: number
}

export interface ProductAttribute {
  id: number
  name: string
  value: string
  price_modifier: number
  stock?: number
}

export interface Product {
  id: number
  name: string
  slug: string
  description?: string
  short_description?: string
  price: number
  compare_price?: number
  stock: number
  sku: string
  featured: boolean
  status: 'active' | 'inactive' | 'draft'
  average_rating: number
  reviews_count: number
  category?: Category
  images: ProductImage[]
  attributes: ProductAttribute[]
  primary_image?: string
}

export interface CartItem {
  id: number
  quantity: number
  unit_price: number
  total_price: number
  product: {
    id: number
    name: string
    slug: string
    sku: string
    stock: number
    primary_image?: string
  }
  attribute?: {
    id: number
    name: string
    value: string
  } | null
}

export interface CartSummary {
  data: CartItem[]
  subtotal: number
  count: number
}

export interface OrderItem {
  id: number
  product_id?: number
  product_name: string
  product_sku: string
  quantity: number
  unit_price: number
  total_price: number
  product_snapshot: Record<string, unknown>
}

export interface Order {
  id: number
  order_number?: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  subtotal: number
  discount_amount: number
  shipping_amount: number
  tax_amount: number
  total: number
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method?: string
  shipping_name: string
  shipping_phone: string
  shipping_address: {
    line1: string
    line2?: string
    city: string
    state: string
    zip: string
    country: string
  }
  notes?: string
  created_at: string
  coupon?: { code: string; type: string; value: number }
  items: OrderItem[]
}

export interface Address {
  id: number
  name: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  zip: string
  country: string
  type: 'shipping' | 'billing'
  is_default: boolean
}

export interface Review {
  id: number
  rating: number
  title?: string
  body: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  user: { id: number; name: string }
}

export interface Coupon {
  id: number
  code: string
  type: 'percentage' | 'fixed'
  value: number
  min_order_amount?: number
  max_uses?: number
  used_count: number
  expires_at?: string
  is_active: boolean
}

export interface ApiMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
  meta?: ApiMeta
}

export interface WishlistItem {
  id: number
  product_id: number
  product: Product | null
}

export interface DashboardData {
  stats: {
    total_revenue: number
    total_orders: number
    total_customers: number
    total_products: number
    pending_orders: number
    pending_reviews: number
  }
  revenue_by_month: { month: string; revenue: number; orders: number }[]
  orders_by_status: Record<string, number>
  low_stock: { id: number; name: string; sku: string; stock: number }[]
  top_products: { product_id: number; product_name: string; total_revenue: number; units_sold: number }[]
  revenue_by_category: { category: string; revenue: number }[]
}
