'use client'
import Link from 'next/link'
import { Package, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useOrders } from '@/hooks/useOrders'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

export default function OrdersPage() {
  const { data, isLoading } = useOrders()
  const orders = data?.data ?? []

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="mb-6 text-3xl font-bold">My Orders</h1>

      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}</div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="mt-6 text-2xl font-bold">No orders yet</h2>
          <p className="mt-2 max-w-sm text-muted-foreground">
            Looks like you haven't placed any orders. Start shopping and your orders will show up here.
          </p>
          <Button asChild className="mt-8" size="lg"><Link href="/products">Start Shopping</Link></Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{order.order_number ?? `Order #${order.id}`}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                      <p className="text-sm text-muted-foreground">{order.items.length} item(s)</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-lg font-bold">{formatCurrency(order.total)}</span>
                    <div className="flex gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(order.status)}`}>{order.status}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(order.payment_status)}`}>{order.payment_status}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
