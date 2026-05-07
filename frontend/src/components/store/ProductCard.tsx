'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Heart, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/store/StarRating'
import { ProductQuickView } from '@/components/store/ProductQuickView'
import { formatCurrency } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import { useToast } from '@/components/ui/use-toast'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { wishlistIds, toggle: wishlistToggle } = useWishlist()
  const { toast } = useToast()
  const { data: session } = useSession()
  const router = useRouter()
  const [quickViewSlug, setQuickViewSlug] = useState<string | null>(null)
  const [imageIndex, setImageIndex] = useState(0)

  const images = product.images?.length
    ? product.images
    : product.primary_image
      ? [{ id: -1, url: product.primary_image, alt: product.name, sort_order: 0 }]
      : []
  const hasMultiple = images.length > 1

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : null

  const isWishlisted = wishlistIds.has(product.id)
  const isLowStock = product.stock > 0 && product.stock <= 5

  function prev(e: React.MouseEvent) {
    e.preventDefault()
    setImageIndex(i => (i - 1 + images.length) % images.length)
  }

  function next(e: React.MouseEvent) {
    e.preventDefault()
    setImageIndex(i => (i + 1) % images.length)
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    if (!session) { router.push('/auth/login'); return }
    addItem.mutate(
      { product_id: product.id, quantity: 1 },
      {
        onSuccess: () => toast({ title: 'Added to cart', description: product.name }),
        onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
      }
    )
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    if (!session) { router.push('/auth/login'); return }
    wishlistToggle.mutate(product.id, {
      onError: () => toast({ title: 'Error', description: 'Could not update wishlist.', variant: 'destructive' }),
    })
  }

  function handleQuickView(e: React.MouseEvent) {
    e.preventDefault()
    setQuickViewSlug(product.slug)
  }

  return (
    <>
      <Link href={`/products/${product.slug}`} className="group block">
        <div className="relative overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md">
          {/* Image carousel */}
          <div className="relative aspect-square overflow-hidden bg-gray-50">
            {images.length > 0 ? (
              images.map((img, i) => (
                <Image
                  key={img.id}
                  src={img.url}
                  alt={img.alt ?? product.name}
                  fill
                  className={cn(
                    'object-cover transition-all duration-300',
                    i === imageIndex ? 'opacity-100 scale-100 group-hover:scale-105' : 'opacity-0 absolute'
                  )}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ))
            ) : (
              <div className="flex h-full items-center justify-center text-gray-300">
                <ShoppingCart className="h-12 w-12" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute left-2 top-2 flex flex-col gap-1 z-10">
              {discount && <Badge className="bg-red-500 text-white">-{discount}%</Badge>}
              {isLowStock && <Badge className="bg-orange-500 text-white">Only {product.stock} left!</Badge>}
            </div>

            {product.stock === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                <Badge variant="secondary">Out of Stock</Badge>
              </div>
            )}

            {/* Carousel arrows */}
            {hasMultiple && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-1.5 top-1/2 z-10 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-1.5 top-1/2 z-10 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                {/* Dots */}
                <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 flex gap-1">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.preventDefault(); setImageIndex(i) }}
                      className={cn('h-1.5 rounded-full transition-all', i === imageIndex ? 'w-3 bg-white' : 'w-1.5 bg-white/60')}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Quick view + wishlist hover bar */}
            <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleQuickView}
                className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium shadow hover:bg-white transition-colors"
              >
                <Eye className="h-3.5 w-3.5" />
                Quick View
              </button>
            </div>

            {/* Wishlist button */}
            <button
              onClick={handleWishlist}
              className={cn(
                'absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow transition-all',
                isWishlisted
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500'
              )}
            >
              <Heart className={cn('h-4 w-4', isWishlisted && 'fill-current')} />
            </button>
          </div>

          {/* Info */}
          <div className="p-4">
            {product.category && (
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {product.category.name}
              </p>
            )}
            <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-gray-900">{product.name}</h3>

            {product.reviews_count > 0 && (
              <div className="mb-2 flex items-center gap-1">
                <StarRating rating={product.average_rating} size="sm" />
                <span className="text-xs text-muted-foreground">({product.reviews_count})</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-primary">{formatCurrency(product.price)}</span>
                {product.compare_price && (
                  <span className="ml-2 text-sm text-muted-foreground line-through">
                    {formatCurrency(product.compare_price)}
                  </span>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addItem.isPending}
                className="shrink-0"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Link>

      <ProductQuickView slug={quickViewSlug} onClose={() => setQuickViewSlug(null)} />
    </>
  )
}
