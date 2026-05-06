'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import api from '@/lib/api'
import type { Order } from '@/types'

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrdersPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const { data, isLoading } = useQuery<{ data: Order[]; meta: { total: number; last_page: number } }>({
    queryKey: ['admin', 'orders', search, statusFilter, page],
    queryFn: () => api.get('/admin/orders', { params: { search: search || undefined, status: statusFilter !== 'all' ? statusFilter : undefined, page } }).then(r => r.data),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.put(`/admin/orders/${id}/status`, { status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] }); toast({ title: 'Status updated.' }) },
  })

  const orders = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search by customer, order ID…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ORDER_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                ))
              ) : orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>{order.shipping_name}</TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                  <TableCell>{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <Select value={order.status} onValueChange={(s) => updateStatus.mutate({ id: order.id, status: s })}>
                      <SelectTrigger className={`h-7 w-32 text-xs ${getStatusColor(order.status)}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(order.payment_status)}`}>{order.payment_status}</span></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}><Eye className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {meta.last_page}</span>
          <Button variant="outline" size="sm" disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}

      {/* Order detail dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Order #{selectedOrder?.id}</DialogTitle></DialogHeader>
          {selectedOrder && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><p className="font-medium">Customer</p><p className="text-muted-foreground">{selectedOrder.shipping_name}</p></div>
                <div><p className="font-medium">Date</p><p className="text-muted-foreground">{formatDate(selectedOrder.created_at)}</p></div>
              </div>
              <div>
                <p className="font-medium mb-1">Items</p>
                {selectedOrder.items.map(item => (
                  <div key={item.id} className="flex justify-between text-muted-foreground">
                    <span>{item.product_name} × {item.quantity}</span>
                    <span>{formatCurrency(item.total_price)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 font-medium flex justify-between">
                <span>Total</span><span>{formatCurrency(selectedOrder.total)}</span>
              </div>
              <div>
                <p className="font-medium">Shipping Address</p>
                <p className="text-muted-foreground">{selectedOrder.shipping_address.line1}, {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
