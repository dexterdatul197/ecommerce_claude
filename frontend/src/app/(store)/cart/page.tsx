'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, ShoppingCart, Trash2, Tag } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useCart } from '@/hooks/useCart'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/utils'
import api from '@/lib/api'

export default function CartPage() {
  const { query, updateItem, removeItem, clearCart } = useCart()
  const { toast } = useToast()
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState<number | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)

  const cart = query.data

  async function applyCoupon() {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      const res = await api.post('/coupons/validate', { code: couponCode, subtotal: cart?.subtotal ?? 0 })
      setCouponDiscount(res.data.data.discount_amount)
      toast({ title: 'Coupon applied!', description: `Saved ${formatCurrency(res.data.data.discount_amount)}` })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid coupon.'
      toast({ title: 'Error', description: message, variant: 'destructive' })
    } finally {
      setCouponLoading(false)
    }
  }

  if (query.isLoading) {
    return (
      <div className="container py-8">
        <h1 className="mb-6 text-3xl font-bold">Shopping Cart</h1>
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}</div>
      </div>
    )
  }

  if (!cart || cart.data.length === 0) {
    return (
      <div className="container flex flex-col items-center py-24 text-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-muted">
          <ShoppingCart className="h-14 w-14 text-muted-foreground" />
        </div>
        <h2 className="mt-6 text-2xl font-bold">Your cart is empty</h2>
        <p className="mt-2 max-w-sm text-muted-foreground">
          You haven't added anything yet. Browse our products and find something you'll love.
        </p>
        <div className="mt-8 flex gap-3">
          <Button asChild size="lg"><Link href="/products">Browse Products</Link></Button>
          <Button asChild variant="outline" size="lg"><Link href="/wishlist">View Wishlist</Link></Button>
        </div>
      </div>
    )
  }

  const subtotal = cart.subtotal
  const discount = couponDiscount ?? 0
  const shipping = 5
  const tax = (subtotal - discount) * 0.08
  const total = subtotal - discount + shipping + tax

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Shopping Cart <span className="text-muted-foreground text-xl">({cart.count} items)</span></h1>
        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => clearCart.mutate()}>
          <Trash2 className="mr-1 h-4 w-4" />Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="space-y-4 lg:col-span-2">
          {cart.data.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex gap-4 p-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-gray-50">
                  {item.product.primary_image ? (
                    <Image src={item.product.primary_image} alt={item.product.name} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="flex h-full items-center justify-center"><ShoppingCart className="h-8 w-8 text-gray-300" /></div>
                  )}
                </div>

                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between">
                    <Link href={`/products/${item.product.slug}`} className="font-semibold hover:underline line-clamp-1">
                      {item.product.name}
                    </Link>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => removeItem.mutate(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {item.attribute && <p className="text-sm text-muted-foreground">{item.attribute.name}: {item.attribute.value}</p>}

                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-md border">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity - 1 })} disabled={item.quantity <= 1}><Minus className="h-3 w-3" /></Button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })} disabled={item.quantity >= item.product.stock}><Plus className="h-3 w-3" /></Button>
                    </div>
                    <span className="font-semibold">{formatCurrency(item.total_price)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Order Summary</h2>

              {/* Coupon */}
              <div className="flex gap-2">
                <Input placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="uppercase" />
                <Button variant="outline" onClick={applyCoupon} disabled={couponLoading}>
                  <Tag className="h-4 w-4" />
                </Button>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(discount)}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{formatCurrency(shipping)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax (8%)</span><span>{formatCurrency(tax)}</span></div>
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>

              <Button asChild className="w-full" size="lg">
                <Link href={`/checkout${couponCode ? `?coupon=${couponCode}` : ''}`}>Proceed to Checkout</Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
