'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, X, ShoppingCart } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSearchProducts } from '@/hooks/useProducts'
import { formatCurrency } from '@/lib/utils'

interface SearchAutocompleteProps {
  onClose: () => void
}

export function SearchAutocomplete({ onClose }: SearchAutocompleteProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data, isFetching } = useSearchProducts(query)
  const suggestions = data?.data?.slice(0, 6) ?? []
  const showDropdown = query.length >= 2

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/products?q=${encodeURIComponent(query.trim())}`)
    onClose()
  }

  function handleSelect(slug: string) {
    router.push(`/products/${slug}`)
    onClose()
  }

  return (
    <div ref={containerRef} className="relative flex items-center gap-1">
      <form onSubmit={handleSubmit} className="flex items-center gap-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="h-8 w-52 pl-9 text-sm"
          />
          {isFetching && query.length >= 2 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          )}
        </div>
        <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 shrink-0">
          <Search className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute left-0 top-full z-50 mt-1 w-80 rounded-lg border bg-white shadow-lg">
          {suggestions.length === 0 && !isFetching ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">No results for &ldquo;{query}&rdquo;</div>
          ) : (
            <ul>
              {suggestions.map((product) => (
                <li key={product.id}>
                  <button
                    onClick={() => handleSelect(product.slug)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-muted transition-colors"
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border bg-gray-50">
                      {product.primary_image ? (
                        <Image src={product.primary_image} alt={product.name} fill className="object-cover" sizes="40px" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ShoppingCart className="h-4 w-4 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(product.price)}</p>
                    </div>
                  </button>
                </li>
              ))}
              {suggestions.length > 0 && (
                <li className="border-t">
                  <button
                    onClick={handleSubmit as unknown as React.MouseEventHandler}
                    className="w-full px-4 py-2.5 text-left text-sm text-primary hover:bg-muted transition-colors font-medium"
                  >
                    See all results for &ldquo;{query}&rdquo; →
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
