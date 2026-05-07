'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/store/StarRating'
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

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : null

  const isWishlisted = wishlistIds.has(product.id)

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

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {product.primary_image ? (
            <Image
              src={product.primary_image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">
              <ShoppingCart className="h-12 w-12" />
            </div>
          )}
          {discount && (
            <Badge className="absolute left-2 top-2 bg-red-500 text-white">-{discount}%</Badge>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Badge variant="secondary">Out of Stock</Badge>
            </div>
          )}

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={cn(
              'absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full shadow transition-all',
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
  )
}
