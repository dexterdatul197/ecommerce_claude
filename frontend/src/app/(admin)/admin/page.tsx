'use client'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, DollarSign, Package, ShoppingCart, Users, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/components/admin/StatsCard'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, getStatusColor } from '@/lib/utils'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '@/lib/api'
import type { DashboardData } from '@/types'

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery<{ data: DashboardData }>({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api.get('/admin/dashboard').then(r => r.data),
    refetchInterval: 60 * 1000,
  })

  const d = data?.data

  if (isLoading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
      </div>
      <Skeleton className="h-72 rounded-lg" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatsCard title="Revenue" value={formatCurrency(d?.stats.total_revenue ?? 0)} icon={DollarSign} iconColor="text-green-600" />
        <StatsCard title="Orders" value={d?.stats.total_orders ?? 0} icon={ShoppingCart} iconColor="text-blue-600" />
        <StatsCard title="Customers" value={d?.stats.total_customers ?? 0} icon={Users} iconColor="text-purple-600" />
        <StatsCard title="Products" value={d?.stats.total_products ?? 0} icon={Package} iconColor="text-orange-600" />
        <StatsCard title="Pending Orders" value={d?.stats.pending_orders ?? 0} icon={BarChart3} iconColor="text-yellow-600" />
        <StatsCard title="Pending Reviews" value={d?.stats.pending_reviews ?? 0} icon={AlertTriangle} iconColor="text-red-600" />
      </div>

      {/* Revenue chart */}
      <Card>
        <CardHeader><CardTitle>Revenue (Last 12 Months)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={d?.revenue_by_month ?? []}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(221.2 83.2% 53.3%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(221.2 83.2% 53.3%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(221.2 83.2% 53.3%)" fill="url(#colorRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Orders by status */}
        <Card>
          <CardHeader><CardTitle>Orders by Status</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(d?.orders_by_status ?? {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${getStatusColor(status)}`}>{status}</span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low stock */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-amber-600"><AlertTriangle className="h-4 w-4" />Low Stock Alert</CardTitle></CardHeader>
          <CardContent>
            {(d?.low_stock.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">All products are well-stocked.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {d?.low_stock.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold ${p.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>{p.stock}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
