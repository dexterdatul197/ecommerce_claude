'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ShoppingCart, ChevronLeft, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { StarRating } from '@/components/store/StarRating'
import { useProduct } from '@/hooks/useProducts'
import { useCart } from '@/hooks/useCart'
import { useToast } from '@/components/ui/use-toast'
import { useSession } from 'next-auth/react'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { ProductAttribute } from '@/types'

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data, isLoading, error } = useProduct(slug)
  const { addItem } = useCart()
  const { toast } = useToast()
  const { data: session } = useSession()
  const router = useRouter()

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedAttribute, setSelectedAttribute] = useState<ProductAttribute | null>(null)
  const [quantity, setQuantity] = useState(1)

  const product = data?.data

  function handleAddToCart() {
    if (!session) { router.push('/auth/login'); return }
    addItem.mutate(
      { product_id: product!.id, attribute_id: selectedAttribute?.id, quantity },
      {
        onSuccess: () => toast({ title: 'Added to cart!', description: product!.name }),
        onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
      }
    )
  }

  if (error) return (
    <div className="container py-24 text-center">
      <p className="text-lg text-muted-foreground">Product not found.</p>
      <Button asChild className="mt-4"><Link href="/products">← Back to Products</Link></Button>
    </div>
  )

  if (isLoading || !product) return (
    <div className="container py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  )

  const images = product.images.length > 0 ? product.images : []
  const currentImage = images[selectedImage]
  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : null

  // Group attributes by name (e.g., Color: [Red, Blue], Size: [S, M, L])
  const attributeGroups = product.attributes.reduce<Record<string, ProductAttribute[]>>((acc, attr) => {
    if (!acc[attr.name]) acc[attr.name] = []
    acc[attr.name].push(attr)
    return acc
  }, {})

  return (
    <div className="container py-8">
      <Button variant="ghost" asChild className="mb-6 -ml-2">
        <Link href="/products"><ChevronLeft className="mr-1 h-4 w-4" />Back to Products</Link>
      </Button>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-xl border bg-gray-50">
            {currentImage ? (
              <Image src={currentImage.url} alt={currentImage.alt ?? product.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-300">
                <ShoppingCart className="h-20 w-20" />
              </div>
            )}
            {discount && <Badge className="absolute left-3 top-3 bg-red-500 text-white">-{discount}%</Badge>}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={cn('relative h-16 w-16 overflow-hidden rounded-md border-2 transition-all', i === selectedImage ? 'border-primary' : 'border-transparent')}
                >
                  <Image src={img.url} alt={img.alt ?? ''} fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          {product.category && (
            <Link href={`/products?category=${product.category.slug}`} className="text-sm font-medium text-primary hover:underline">
              {product.category.name}
            </Link>
          )}

          <h1 className="text-3xl font-bold">{product.name}</h1>

          {product.reviews_count > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rating={product.average_rating} />
              <span className="text-sm text-muted-foreground">
                {product.average_rating} ({product.reviews_count} reviews)
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-primary">{formatCurrency(product.price)}</span>
            {product.compare_price && (
              <span className="text-xl text-muted-foreground line-through">{formatCurrency(product.compare_price)}</span>
            )}
          </div>

          {product.short_description && (
            <p className="text-muted-foreground">{product.short_description}</p>
          )}

          <Separator />

          {/* Attribute selectors */}
          {Object.entries(attributeGroups).map(([name, attrs]) => (
            <div key={name}>
              <p className="mb-2 text-sm font-semibold">{name}:</p>
              <div className="flex flex-wrap gap-2">
                {attrs.map((attr) => (
                  <button
                    key={attr.id}
                    onClick={() => setSelectedAttribute(attr.id === selectedAttribute?.id ? null : attr)}
                    className={cn(
                      'rounded-md border px-3 py-1.5 text-sm font-medium transition-all',
                      attr.id === selectedAttribute?.id
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-200 hover:border-primary'
                    )}
                  >
                    {attr.value}
                    {attr.price_modifier > 0 && ` (+${formatCurrency(attr.price_modifier)})`}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div>
            <p className="mb-2 text-sm font-semibold">Quantity:</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-md border">
                <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={quantity >= product.stock}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">{product.stock} in stock</span>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={handleAddToCart}
            disabled={product.stock === 0 || addItem.isPending}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>

          <div className="text-xs text-muted-foreground">SKU: {product.sku}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.reviews_count})</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-4 prose max-w-none text-sm leading-relaxed text-gray-700">
            {product.description ? (
              <p>{product.description}</p>
            ) : (
              <p className="text-muted-foreground">No description available.</p>
            )}
          </TabsContent>
          <TabsContent value="reviews" className="mt-4">
            {product.reviews_count === 0 ? (
              <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4">
                {/* Reviews would be fetched separately */}
                <p className="text-muted-foreground">Reviews are displayed here.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
