'use client'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCard } from '@/components/store/ProductCard'
import { useWishlist } from '@/hooks/useWishlist'
import { useSession } from 'next-auth/react'

export default function WishlistPage() {
  const { data: session } = useSession()
  const { query } = useWishlist()

  if (!session) {
    return (
      <div className="container py-24 text-center">
        <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Your Wishlist</h1>
        <p className="mt-2 text-muted-foreground">Sign in to view and manage your wishlist.</p>
        <Button asChild className="mt-6"><Link href="/auth/login">Sign In</Link></Button>
      </div>
    )
  }

  const items = query.data?.data ?? []

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        {!query.isLoading && (
          <p className="text-muted-foreground">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
        )}
      </div>

      {query.isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-white p-4 space-y-3">
              <Skeleton className="aspect-square rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-24 text-center">
          <Heart className="mx-auto h-16 w-16 text-muted-foreground/30" />
          <p className="mt-4 text-lg font-medium">Your wishlist is empty</p>
          <p className="text-sm text-muted-foreground">Save items you love by clicking the heart on any product.</p>
          <Button asChild className="mt-6"><Link href="/products">Browse Products</Link></Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => item.product && (
            <ProductCard key={item.id} product={item.product} />
          ))}
        </div>
      )}
    </div>
  )
}
