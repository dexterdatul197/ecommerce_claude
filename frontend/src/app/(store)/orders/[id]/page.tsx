'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Package, Clock, Cog, Truck, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useOrder, useCancelOrder } from '@/hooks/useOrders'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

const STATUS_STEPS = [
  { key: 'pending',    label: 'Order Placed', desc: 'We\'ve received your order',    icon: Clock },
  { key: 'processing', label: 'Processing',   desc: 'Your items are being prepared', icon: Cog },
  { key: 'shipped',    label: 'Shipped',       desc: 'Your order is on its way',      icon: Truck },
  { key: 'delivered',  label: 'Delivered',     desc: 'Enjoy your order!',             icon: CheckCircle2 },
]

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useOrder(Number(id))
  const cancelOrder = useCancelOrder()
  const { toast } = useToast()

  const order = data?.data

  function handleCancel() {
    cancelOrder.mutate(Number(id), {
      onSuccess: () => toast({ title: 'Order cancelled successfully.' }),
      onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
    })
  }

  if (isLoading) return (
    <div className="container max-w-3xl py-8 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  )

  if (!order) return (
    <div className="container py-12 text-center">
      <p className="text-muted-foreground">Order not found.</p>
      <Button asChild className="mt-4"><Link href="/orders">Back to Orders</Link></Button>
    </div>
  )

  const stepIndex = STATUS_STEPS.findIndex(s => s.key === order.status)

  return (
    <div className="container max-w-3xl py-8">
      <Button variant="ghost" asChild className="mb-6 -ml-2">
        <Link href="/orders"><ChevronLeft className="mr-1 h-4 w-4" />My Orders</Link>
      </Button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{order.order_number ?? `Order #${order.id}`}</h1>
          <p className="text-sm text-muted-foreground">Placed on {formatDate(order.created_at)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(order.status)}`}>{order.status}</span>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(order.payment_status)}`}>{order.payment_status}</span>
        </div>
      </div>

      {/* Progress tracker */}
      {order.status === 'cancelled' ? (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 p-5">
            <XCircle className="h-8 w-8 shrink-0 text-red-500" />
            <div>
              <p className="font-semibold text-red-700">Order Cancelled</p>
              <p className="text-sm text-red-500">This order has been cancelled.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start">
              {STATUS_STEPS.map((step, i) => {
                const isCompleted = i < stepIndex
                const isCurrent   = i === stepIndex
                const Icon        = step.icon

                return (
                  <div key={step.key} className="flex flex-1 items-start">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full transition-all',
                        isCompleted ? 'bg-green-500 text-white'
                        : isCurrent ? 'bg-primary text-white ring-4 ring-primary/20'
                        : 'bg-gray-100 text-gray-400'
                      )}>
                        {isCompleted
                          ? <CheckCircle2 className="h-5 w-5" />
                          : <Icon className={cn('h-5 w-5', isCurrent && 'animate-pulse')} />
                        }
                      </div>
                      <p className={cn('text-xs font-medium text-center w-16',
                        isCompleted ? 'text-green-600'
                        : isCurrent ? 'text-primary'
                        : 'text-muted-foreground'
                      )}>
                        {step.label}
                      </p>
                      <p className="hidden sm:block text-[10px] text-center text-muted-foreground w-16 leading-tight">
                        {step.desc}
                      </p>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={cn('mx-1 mt-5 h-0.5 flex-1 transition-colors', i < stepIndex ? 'bg-green-500' : 'bg-gray-200')} />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {/* Items */}
        <Card>
          <CardHeader><CardTitle className="text-base">Items ({order.items.length})</CardTitle></CardHeader>
          <CardContent className="space-y-3 pt-0">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">SKU: {item.product_sku} × {item.quantity}</p>
                  </div>
                </div>
                <span className="font-medium">{formatCurrency(item.total_price)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader><CardTitle className="text-base">Order Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 pt-0 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount {order.coupon && `(${order.coupon.code})`}</span>
                <span>−{formatCurrency(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{formatCurrency(order.shipping_amount)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatCurrency(order.tax_amount)}</span></div>
            <Separator />
            <div className="flex justify-between text-base font-bold"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
          </CardContent>
        </Card>

        {/* Shipping address */}
        <Card>
          <CardHeader><CardTitle className="text-base">Shipping Address</CardTitle></CardHeader>
          <CardContent className="pt-0 text-sm">
            <p className="font-medium">{order.shipping_name}</p>
            <p className="text-muted-foreground">{order.shipping_address.line1}</p>
            {order.shipping_address.line2 && <p className="text-muted-foreground">{order.shipping_address.line2}</p>}
            <p className="text-muted-foreground">{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}</p>
            <p className="text-muted-foreground">{order.shipping_phone}</p>
          </CardContent>
        </Card>

        {/* Cancel */}
        {['pending', 'processing'].includes(order.status) && (
          <Button variant="destructive" onClick={handleCancel} disabled={cancelOrder.isPending}>
            {cancelOrder.isPending ? 'Cancelling…' : 'Cancel Order'}
          </Button>
        )}
      </div>
    </div>
  )
}
