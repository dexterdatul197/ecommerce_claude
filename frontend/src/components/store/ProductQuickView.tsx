'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Minus, Plus, X } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { StarRating } from '@/components/store/StarRating'
import { useProduct } from '@/hooks/useProducts'
import { useCart } from '@/hooks/useCart'
import { useToast } from '@/components/ui/use-toast'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { formatCurrency, cn } from '@/lib/utils'
import type { ProductAttribute } from '@/types'

interface ProductQuickViewProps {
  slug: string | null
  onClose: () => void
}

export function ProductQuickView({ slug, onClose }: ProductQuickViewProps) {
  const { data, isLoading } = useProduct(slug ?? '')
  const product = data?.data
  const { addItem } = useCart()
  const { toast } = useToast()
  const { data: session } = useSession()
  const router = useRouter()

  const [selectedAttribute, setSelectedAttribute] = useState<ProductAttribute | null>(null)
  const [quantity, setQuantity] = useState(1)

  const discount = product?.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : null

  const attributeGroups = product?.attributes.reduce<Record<string, ProductAttribute[]>>((acc, attr) => {
    if (!acc[attr.name]) acc[attr.name] = []
    acc[attr.name].push(attr)
    return acc
  }, {}) ?? {}

  function handleAddToCart() {
    if (!session) { router.push('/auth/login'); onClose(); return }
    addItem.mutate(
      { product_id: product!.id, attribute_id: selectedAttribute?.id, quantity },
      {
        onSuccess: () => { toast({ title: 'Added to cart!', description: product!.name }); onClose() },
        onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
      }
    )
  }

  return (
    <Dialog open={!!slug} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {isLoading || !product ? (
          <div className="grid grid-cols-2 gap-6 p-6">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {/* Image */}
            <div className="relative aspect-square bg-gray-50">
              {product.primary_image ? (
                <Image src={product.primary_image} alt={product.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-300">
                  <ShoppingCart className="h-16 w-16" />
                </div>
              )}
              {discount && <Badge className="absolute left-3 top-3 bg-red-500 text-white">-{discount}%</Badge>}
              {product.stock > 0 && product.stock <= 5 && (
                <Badge className="absolute left-3 bottom-3 bg-orange-500 text-white">Only {product.stock} left!</Badge>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-4 p-6">
              {product.category && (
                <p className="text-xs font-medium uppercase tracking-wide text-primary">{product.category.name}</p>
              )}
              <h2 className="text-xl font-bold leading-tight">{product.name}</h2>

              {product.reviews_count > 0 && (
                <div className="flex items-center gap-2">
                  <StarRating rating={product.average_rating} size="sm" />
                  <span className="text-xs text-muted-foreground">({product.reviews_count})</span>
                </div>
              )}

              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-primary">{formatCurrency(product.price)}</span>
                {product.compare_price && (
                  <span className="text-base text-muted-foreground line-through">{formatCurrency(product.compare_price)}</span>
                )}
              </div>

              {product.short_description && (
                <p className="text-sm text-muted-foreground line-clamp-3">{product.short_description}</p>
              )}

              {/* Attribute selectors */}
              {Object.entries(attributeGroups).map(([name, attrs]) => (
                <div key={name}>
                  <p className="mb-1.5 text-xs font-semibold">{name}:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {attrs.map((attr) => (
                      <button
                        key={attr.id}
                        onClick={() => setSelectedAttribute(attr.id === selectedAttribute?.id ? null : attr)}
                        className={cn(
                          'rounded border px-2.5 py-1 text-xs font-medium transition-all',
                          attr.id === selectedAttribute?.id
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-200 hover:border-primary'
                        )}
                      >
                        {attr.value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Quantity */}
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-md border">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={quantity >= product.stock}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <span className="text-xs text-muted-foreground">{product.stock} in stock</span>
              </div>

              <Button
                className="w-full"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addItem.isPending}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>

              <Link
                href={`/products/${product.slug}`}
                onClick={onClose}
                className="text-center text-xs text-primary hover:underline"
              >
                View full details →
              </Link>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
