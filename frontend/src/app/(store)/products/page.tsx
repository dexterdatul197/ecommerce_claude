'use client'
import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SlidersHorizontal, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProductCard } from '@/components/store/ProductCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useProducts, useCategories } from '@/hooks/useProducts'

export default function ProductsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const searchFromUrl = searchParams.get('q') ?? ''
  const [search, setSearch] = useState(searchFromUrl)
  const category = searchParams.get('category') ?? ''
  const sort = searchParams.get('sort') ?? 'latest'
  const page = Number(searchParams.get('page') ?? 1)

  const { data, isLoading } = useProducts({
    search: searchFromUrl || undefined,
    category: category || undefined,
    sort,
    page,
    per_page: 20,
  })

  const { data: categoriesData } = useCategories()
  const categories = categoriesData?.data ?? []
  const products = data?.data ?? []
  const meta = data?.meta

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        {meta && <p className="text-muted-foreground">{meta.total} products found</p>}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && updateParam('q', search)}
            className="pl-9"
          />
        </div>

        <Select value={category} onValueChange={(v) => updateParam('category', v === 'all' ? '' : v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <>
                <SelectItem key={cat.id} value={cat.slug} className="font-medium">
                  {cat.name}
                </SelectItem>
                {cat.children?.map((child) => (
                  <SelectItem key={child.id} value={child.slug} className="pl-6 text-muted-foreground">
                    ↳ {child.name}
                  </SelectItem>
                ))}
              </>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => updateParam('sort', v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
          </SelectContent>
        </Select>

        {(category || sort !== 'latest') && (
          <Button variant="outline" size="sm" onClick={() => router.push('/products')}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-white p-4 space-y-3">
              <Skeleton className="aspect-square rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-24 text-center">
          <SlidersHorizontal className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">No products found</p>
          <p className="text-muted-foreground">Try adjusting your filters</p>
          <Button className="mt-4" onClick={() => router.push('/products')}>Clear Filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => updateParam('page', String(page - 1))}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {page} of {meta.last_page}
          </span>
          <Button
            variant="outline"
            disabled={page >= meta.last_page}
            onClick={() => updateParam('page', String(page + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
