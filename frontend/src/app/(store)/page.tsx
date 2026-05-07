'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Zap, Shield, Truck, Tag, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/store/ProductCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useProducts, useCategories } from '@/hooks/useProducts'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { formatCurrency } from '@/lib/utils'

const CATEGORY_EMOJIS: Record<string, string> = {
  electronics: '💻',
  clothing: '👕',
  'home-garden': '🏡',
  'home-&-garden': '🏡',
  sports: '⚽',
  phones: '📱',
  laptops: '💻',
  accessories: '🎧',
  men: '👔',
  women: '👗',
  kids: '🧒',
  furniture: '🛋️',
  kitchen: '🍳',
  garden: '🌿',
  outdoor: '🏕️',
  fitness: '🏋️',
  'team-sports': '🏀',
}

function getCategoryEmoji(slug: string, name: string): string {
  return CATEGORY_EMOJIS[slug] ?? CATEGORY_EMOJIS[name.toLowerCase()] ?? name.charAt(0).toUpperCase()
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/90 to-blue-700 text-white">
      <div className="container py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              <Tag className="h-3.5 w-3.5" />
              New arrivals every week
            </div>
            <h1 className="text-5xl font-bold leading-tight">
              Shop the Best<br />
              <span className="text-yellow-300">Products Online</span>
            </h1>
            <p className="mt-6 text-xl text-blue-100">
              Discover thousands of products with fast delivery, easy returns, and unbeatable prices.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link href="/products">Shop Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white/10 hover:text-white">
                <Link href="/products?featured=true">Featured Deals</Link>
              </Button>
            </div>

            <div className="mt-10 flex gap-8">
              {[
                { value: '10k+', label: 'Products' },
                { value: '50k+', label: 'Happy Customers' },
                { value: '4.8★', label: 'Average Rating' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-sm text-blue-200">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right side decorative grid */}
          <div className="hidden lg:grid grid-cols-2 gap-3 opacity-90">
            {[
              { bg: 'bg-white/20', emoji: '💻', label: 'Electronics' },
              { bg: 'bg-yellow-400/30', emoji: '👕', label: 'Clothing' },
              { bg: 'bg-blue-400/30', emoji: '🏡', label: 'Home & Garden' },
              { bg: 'bg-white/20', emoji: '⚽', label: 'Sports' },
            ].map(({ bg, emoji, label }) => (
              <div key={label} className={`${bg} flex flex-col items-center justify-center gap-2 rounded-2xl py-8 backdrop-blur-sm`}>
                <span className="text-4xl">{emoji}</span>
                <span className="text-sm font-medium text-white/90">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/5" />
      <div className="absolute -bottom-10 right-40 h-60 w-60 rounded-full bg-white/5" />
    </section>
  )
}

function FeaturesSection() {
  return (
    <section className="border-b bg-white py-10">
      <div className="container">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
            { icon: Shield, title: 'Secure Payments', desc: '100% protected transactions' },
            { icon: Zap, title: 'Fast Delivery', desc: '2-3 business days' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4 rounded-lg border p-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CategoriesSection() {
  const { data, isLoading } = useCategories()
  const categories = data?.data?.slice(0, 6) ?? []

  return (
    <section className="py-16">
      <div className="container">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Shop by Category</h2>
            <p className="text-sm text-muted-foreground">Browse our curated collections</p>
          </div>
          <Link href="/products" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            All Products <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))
            : categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="group flex aspect-square flex-col items-center justify-center gap-3 rounded-xl border bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-3xl transition-transform group-hover:scale-110">
                    {getCategoryEmoji(cat.slug, cat.name)}
                  </div>
                  <span className="text-sm font-medium text-center px-2 leading-tight">{cat.name}</span>
                </Link>
              ))}
        </div>
      </div>
    </section>
  )
}

function PromoBanner() {
  return (
    <section className="py-8">
      <div className="container">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-pink-600 px-8 py-10 text-white">
          <div className="relative z-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-orange-100">Limited Time Offer</p>
              <h3 className="mt-1 text-2xl font-bold">Get 10% off your first order</h3>
              <p className="mt-1 text-orange-100">Use code <span className="font-mono font-bold text-white bg-white/20 px-2 py-0.5 rounded">WELCOME10</span> at checkout</p>
            </div>
            <Button asChild size="lg" className="shrink-0 bg-white text-orange-600 hover:bg-white/90">
              <Link href="/products">Claim Offer <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 right-32 h-48 w-48 rounded-full bg-white/10" />
        </div>
      </div>
    </section>
  )
}

function FeaturedProducts() {
  const { data, isLoading } = useProducts({ featured: true, per_page: 8 })
  const products = data?.data ?? []

  return (
    <section className="bg-gray-50 py-16">
      <div className="container">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <p className="text-sm text-muted-foreground">Handpicked for you</p>
          </div>
          <Link href="/products?featured=true" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-white p-4 space-y-3">
                <Skeleton className="aspect-square rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No featured products yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function NewArrivals() {
  const { data, isLoading } = useProducts({ sort: 'latest', per_page: 4 })
  const products = data?.data ?? []

  return (
    <section className="py-16">
      <div className="container">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">New Arrivals</h2>
            <p className="text-sm text-muted-foreground">Just added to the store</p>
          </div>
          <Link href="/products?sort=latest" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            See All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-white p-4 space-y-3">
                <Skeleton className="aspect-square rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function RecentlyViewedSection() {
  const { items } = useRecentlyViewed()
  if (items.length === 0) return null

  return (
    <section className="py-16">
      <div className="container">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Recently Viewed</h2>
            <p className="text-sm text-muted-foreground">Pick up where you left off</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} className="group block">
              <div className="overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md">
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  {product.primary_image ? (
                    <Image src={product.primary_image} alt={product.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 640px) 50vw, 16vw" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-300">
                      <ShoppingCart className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="truncate text-xs font-medium">{product.name}</p>
                  <p className="text-xs font-bold text-primary">{formatCurrency(product.price)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <CategoriesSection />
      <PromoBanner />
      <FeaturedProducts />
      <NewArrivals />
      <RecentlyViewedSection />
    </>
  )
}
