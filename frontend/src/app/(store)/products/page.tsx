'use client'
import { useState, Fragment } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SlidersHorizontal, Search, X, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { ProductCard } from '@/components/store/ProductCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useProducts, useCategories } from '@/hooks/useProducts'
import { cn } from '@/lib/utils'
import type { Category } from '@/types'

// ─── Sidebar content ────────────────────────────────────────────────────────

interface SidebarProps {
  search: string
  setSearch: (v: string) => void
  category: string
  priceMin: string
  priceMax: string
  setPriceMin: (v: string) => void
  setPriceMax: (v: string) => void
  categories: Category[]
  onApplySearch: () => void
  onApplyPrice: () => void
  onSelectCategory: (slug: string) => void
  onClearAll: () => void
  hasActiveFilters: boolean
}

function FilterSidebar({
  search, setSearch, category, priceMin, priceMax,
  setPriceMin, setPriceMax, categories,
  onApplySearch, onApplyPrice, onSelectCategory, onClearAll, hasActiveFilters,
}: SidebarProps) {
  const [expandedParents, setExpandedParents] = useState<Set<number>>(new Set())

  function toggleParent(id: number) {
    setExpandedParents(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const parentCategories = categories.filter(c => !c.parent_id)

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Search</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onApplySearch()}
              className="pl-9"
            />
          </div>
          <Button size="icon" variant="outline" onClick={onApplySearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Categories */}
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Categories</p>
        <nav className="space-y-0.5">
          <button
            onClick={() => onSelectCategory('')}
            className={cn(
              'w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
              !category ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'
            )}
          >
            All Products
          </button>

          {parentCategories.map((parent) => {
            const isExpanded = expandedParents.has(parent.id)
            const hasChildren = (parent.children?.length ?? 0) > 0
            const isParentActive = category === parent.slug
            const isChildActive = parent.children?.some(c => c.slug === category)

            return (
              <div key={parent.id}>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSelectCategory(parent.slug)}
                    className={cn(
                      'flex-1 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors',
                      isParentActive ? 'bg-primary text-primary-foreground' : isChildActive ? 'text-primary' : 'hover:bg-muted'
                    )}
                  >
                    {parent.name}
                  </button>
                  {hasChildren && (
                    <button
                      onClick={() => toggleParent(parent.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                  )}
                </div>

                {hasChildren && isExpanded && (
                  <div className="ml-3 mt-0.5 space-y-0.5 border-l pl-3">
                    {parent.children!.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => onSelectCategory(child.slug)}
                        className={cn(
                          'w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors',
                          category === child.slug ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        {child.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Price Range</p>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
            <Input
              type="number"
              min={0}
              placeholder="Min"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="pl-6"
            />
          </div>
          <span className="text-muted-foreground">–</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
            <Input
              type="number"
              min={0}
              placeholder="Max"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="pl-6"
            />
          </div>
        </div>
        <Button size="sm" variant="outline" className="mt-2 w-full" onClick={onApplyPrice}>
          Apply
        </Button>
      </div>

      {hasActiveFilters && (
        <>
          <Separator />
          <Button variant="ghost" size="sm" className="w-full text-destructive hover:text-destructive" onClick={onClearAll}>
            <X className="mr-2 h-4 w-4" />
            Clear All Filters
          </Button>
        </>
      )}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const searchFromUrl = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? ''
  const sort = searchParams.get('sort') ?? 'latest'
  const page = Number(searchParams.get('page') ?? 1)
  const priceMinFromUrl = searchParams.get('price_min') ?? ''
  const priceMaxFromUrl = searchParams.get('price_max') ?? ''

  const [search, setSearch] = useState(searchFromUrl)
  const [priceMin, setPriceMin] = useState(priceMinFromUrl)
  const [priceMax, setPriceMax] = useState(priceMaxFromUrl)
  const [mobileOpen, setMobileOpen] = useState(false)

  const { data, isLoading } = useProducts({
    search: searchFromUrl || undefined,
    category: category || undefined,
    sort,
    page,
    per_page: 20,
    price_min: priceMinFromUrl ? Number(priceMinFromUrl) : undefined,
    price_max: priceMaxFromUrl ? Number(priceMaxFromUrl) : undefined,
  })

  const { data: categoriesData } = useCategories()
  const categories = categoriesData?.data ?? []
  const products = data?.data ?? []
  const meta = data?.meta

  const hasActiveFilters = !!(category || searchFromUrl || sort !== 'latest' || priceMinFromUrl || priceMaxFromUrl)

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    if (key !== 'page') params.delete('page')
    router.push(`/products?${params.toString()}`)
  }

  function updateMultipleParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    router.push(`/products?${params.toString()}`)
  }

  function handleApplySearch() {
    updateParam('q', search)
  }

  function handleApplyPrice() {
    updateMultipleParams({ price_min: priceMin, price_max: priceMax })
  }

  function handleSelectCategory(slug: string) {
    updateParam('category', slug)
    setMobileOpen(false)
  }

  function handleClearAll() {
    setSearch('')
    setPriceMin('')
    setPriceMax('')
    router.push('/products')
  }

  const sidebarProps: SidebarProps = {
    search, setSearch, category, priceMin, priceMax,
    setPriceMin, setPriceMax, categories,
    onApplySearch: handleApplySearch,
    onApplyPrice: handleApplyPrice,
    onSelectCategory: handleSelectCategory,
    onClearAll: handleClearAll,
    hasActiveFilters,
  }

  // Active filter badges for quick removal
  const activeBadges = [
    category && { label: `Category: ${category}`, onRemove: () => updateParam('category', '') },
    searchFromUrl && { label: `"${searchFromUrl}"`, onRemove: () => { setSearch(''); updateParam('q', '') } },
    priceMinFromUrl && { label: `Min $${priceMinFromUrl}`, onRemove: () => { setPriceMin(''); updateMultipleParams({ price_min: '' }) } },
    priceMaxFromUrl && { label: `Max $${priceMaxFromUrl}`, onRemove: () => { setPriceMax(''); updateMultipleParams({ price_max: '' }) } },
  ].filter(Boolean) as { label: string; onRemove: () => void }[]

  return (
    <div className="container py-8">
      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-20">
            <h2 className="mb-4 text-lg font-bold">Filters</h2>
            <FilterSidebar {...sidebarProps} />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold">Products</h1>
              {meta && (
                <p className="text-sm text-muted-foreground">
                  {meta.total} {meta.total === 1 ? 'product' : 'products'} found
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile filter sheet */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                      <Badge className="ml-2 h-4 w-4 rounded-full p-0 text-[10px] flex items-center justify-center">
                        {activeBadges.length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader className="mb-6">
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <FilterSidebar {...sidebarProps} onApplySearch={() => { handleApplySearch(); setMobileOpen(false) }} onApplyPrice={() => { handleApplyPrice(); setMobileOpen(false) }} />
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <Select value={sort} onValueChange={(v) => updateParam('sort', v)}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name A–Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active filter badges */}
          {activeBadges.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {activeBadges.map((badge) => (
                <Badge key={badge.label} variant="secondary" className="gap-1 pr-1">
                  {badge.label}
                  <button onClick={badge.onRemove} className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <button onClick={handleClearAll} className="text-xs text-muted-foreground underline-offset-2 hover:underline">
                Clear all
              </button>
            </div>
          )}

          {/* Product grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
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
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
              <Button className="mt-4" onClick={handleClearAll}>Clear Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
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
      </div>
    </div>
  )
}
