'use client'
import Link from 'next/link'
import { ArrowRight, Zap, Shield, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/store/ProductCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useProducts, useCategories } from '@/hooks/useProducts'

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/90 to-blue-700 text-white">
      <div className="container py-24">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold leading-tight">
            Shop the Best<br />
            <span className="text-yellow-300">Products Online</span>
          </h1>
          <p className="mt-6 text-xl text-blue-100">
            Discover thousands of products with fast delivery, easy returns, and unbeatable prices.
          </p>
          <div className="mt-8 flex gap-4">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link href="/products">Shop Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link href="/products?featured=true">Featured Deals</Link>
            </Button>
          </div>
        </div>
      </div>
      {/* Decorative circles */}
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
          <h2 className="text-2xl font-bold">Shop by Category</h2>
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
                  className="group flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl transition-transform group-hover:scale-110">
                    {cat.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-center px-2">{cat.name}</span>
                </Link>
              ))}
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
            <p className="text-muted-foreground">Handpicked for you</p>
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

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <CategoriesSection />
      <FeaturedProducts />
    </>
  )
}
