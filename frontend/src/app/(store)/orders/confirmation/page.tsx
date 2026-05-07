'use client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Package, ArrowRight, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useOrder } from '@/hooks/useOrders'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const orderId = Number(searchParams.get('id'))

  const { data, isLoading } = useOrder(orderId)
  const order = data?.data

  if (!orderId) {
    return (
      <div className="container py-24 text-center">
        <p className="text-muted-foreground">No order found.</p>
        <Button asChild className="mt-4"><Link href="/products">Start Shopping</Link></Button>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-12">
      {/* Success header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold">Order Confirmed!</h1>
        {isLoading ? (
          <Skeleton className="mx-auto mt-2 h-5 w-48" />
        ) : (
          <p className="mt-2 text-muted-foreground">
            {order?.order_number ?? `Order #${orderId}`} · Placed on {order ? formatDate(order.created_at) : ''}
          </p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          A confirmation has been logged. We'll update you as your order ships.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      ) : order && (
        <div className="space-y-4">
          {/* Items */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <h2 className="font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" /> Items ({order.items.length})
              </h2>
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    {(item.product_snapshot as { primary_image?: string })?.primary_image ? (
                      <img
                        src={(item.product_snapshot as { primary_image: string }).primary_image}
                        alt={item.product_name}
                        className="h-10 w-10 rounded object-cover border"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded border bg-muted flex items-center justify-center">
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-muted-foreground">Qty {item.quantity} · {item.product_sku}</p>
                    </div>
                  </div>
                  <span className="font-medium">{formatCurrency(item.total_price)}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Summary + address row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="p-5 space-y-2 text-sm">
                <h2 className="font-semibold">Order Summary</h2>
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600"><span>Discount</span><span>−{formatCurrency(order.discount_amount)}</span></div>
                )}
                <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>{formatCurrency(order.shipping_amount)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Tax</span><span>{formatCurrency(order.tax_amount)}</span></div>
                <Separator />
                <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 text-sm space-y-1">
                <h2 className="font-semibold">Shipping To</h2>
                <p>{order.shipping_name}</p>
                <p className="text-muted-foreground">{order.shipping_address.line1}</p>
                {order.shipping_address.line2 && <p className="text-muted-foreground">{order.shipping_address.line2}</p>}
                <p className="text-muted-foreground">
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}
                </p>
                <p className="text-muted-foreground">{order.shipping_phone}</p>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="flex-1">
              <Link href={`/orders/${order.id}`}>
                View Order Details <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
