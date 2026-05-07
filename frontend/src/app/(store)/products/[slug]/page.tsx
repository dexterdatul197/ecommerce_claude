'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ShoppingCart, ChevronLeft, ChevronRight, Minus, Plus, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { StarRating } from '@/components/store/StarRating'
import { useProduct, useProductReviews } from '@/hooks/useProducts'
import { useCart } from '@/hooks/useCart'
import { useToast } from '@/components/ui/use-toast'
import { useSession } from 'next-auth/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import api from '@/lib/api'
import Link from 'next/link'
import type { ProductAttribute } from '@/types'

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data, isLoading, error } = useProduct(slug)
  const { addItem } = useCart()
  const { toast } = useToast()
  const { data: session } = useSession()
  const router = useRouter()

  const queryClient = useQueryClient()
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedAttribute, setSelectedAttribute] = useState<ProductAttribute | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewHover, setReviewHover] = useState(0)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewBody, setReviewBody] = useState('')

  const product = data?.data
  const { data: reviewsData } = useProductReviews(product?.id)
  const reviews = reviewsData?.data ?? []

  const [reviewError, setReviewError] = useState<string | null>(null)
  const submitReview = useMutation({
    mutationFn: () => api.post(`/products/${product!.id}/reviews`, { rating: reviewRating, title: reviewTitle || undefined, body: reviewBody }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', product!.id] })
      queryClient.invalidateQueries({ queryKey: ['product', slug] })
      setReviewRating(0); setReviewTitle(''); setReviewBody(''); setReviewError(null)
      toast({ title: 'Review submitted!', description: 'Your review is pending approval.' })
    },
    onError: (err) => setReviewError(err.message),
  })

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
        {/* Image carousel */}
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-xl border bg-gray-50 group">
            {currentImage ? (
              <Image src={currentImage.url} alt={currentImage.alt ?? product.name} fill className="object-cover transition-opacity duration-300" sizes="(max-width: 1024px) 100vw, 50vw" />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-300">
                <ShoppingCart className="h-20 w-20" />
              </div>
            )}
            {discount && <Badge className="absolute left-3 top-3 bg-red-500 text-white">-{discount}%</Badge>}

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage(i => (i - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setSelectedImage(i => (i + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={cn('h-1.5 rounded-full transition-all', i === selectedImage ? 'w-4 bg-white' : 'w-1.5 bg-white/50')}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={cn('relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all', i === selectedImage ? 'border-primary' : 'border-transparent hover:border-primary/40')}
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
          <TabsContent value="reviews" className="mt-4 space-y-6">
            {/* Review list */}
            {reviews.length === 0 ? (
              <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-lg border p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} size="sm" />
                        {review.title && <span className="font-medium text-sm">{review.title}</span>}
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.body}</p>
                    <p className="text-xs text-muted-foreground">— {review.user.name}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Submit review */}
            {session ? (
              <div className="rounded-lg border p-5 space-y-4">
                <h3 className="font-semibold">Write a Review</h3>
                <div className="space-y-1">
                  <Label>Your Rating</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setReviewHover(star)}
                        onMouseLeave={() => setReviewHover(0)}
                        className="focus:outline-none"
                      >
                        <Star className={cn('h-6 w-6 transition-colors', star <= (reviewHover || reviewRating) ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-300')} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Title <span className="text-muted-foreground">(optional)</span></Label>
                  <Input value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} placeholder="Summarize your experience" />
                </div>
                <div className="space-y-1">
                  <Label>Review</Label>
                  <Textarea value={reviewBody} onChange={(e) => setReviewBody(e.target.value)} rows={4} placeholder="Tell others about your experience with this product (min. 10 characters)" />
                </div>
                {reviewError && (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{reviewError}</p>
                )}
                <Button
                  onClick={() => submitReview.mutate()}
                  disabled={!reviewRating || reviewBody.length < 10 || submitReview.isPending}
                >
                  {submitReview.isPending ? 'Submitting…' : 'Submit Review'}
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border p-5 text-center">
                <p className="text-sm text-muted-foreground">
                  <Link href="/auth/login" className="text-primary hover:underline font-medium">Sign in</Link> to leave a review.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
