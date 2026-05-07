'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, DollarSign, Package, ShoppingCart, Users, AlertTriangle, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/components/admin/StatsCard'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, getStatusColor } from '@/lib/utils'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import api from '@/lib/api'
import type { DashboardData } from '@/types'

const PERIODS = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '12m', label: '12 Months' },
] as const

type Period = '7d' | '30d' | '12m'

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<Period>('12m')

  const { data, isLoading } = useQuery<{ data: DashboardData }>({
    queryKey: ['admin', 'dashboard', period],
    queryFn: () => api.get('/admin/dashboard', { params: { period } }).then(r => r.data),
    refetchInterval: 60 * 1000,
  })

  const d = data?.data

  if (isLoading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
      </div>
      <Skeleton className="h-72 rounded-lg" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
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

      {/* Period toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Period:</span>
        <div className="flex rounded-lg border bg-muted p-1 gap-1">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-all ${period === p.value ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue chart */}
      <Card>
        <CardHeader><CardTitle>Revenue Over Time</CardTitle></CardHeader>
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

        {/* Revenue by category */}
        <Card>
          <CardHeader><CardTitle>Revenue by Category</CardTitle></CardHeader>
          <CardContent>
            {(d?.revenue_by_category?.length ?? 0) === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No sales data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={d?.revenue_by_category ?? []} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="revenue" fill="hsl(221.2 83.2% 53.3%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top products */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-600" />Top Products</CardTitle></CardHeader>
          <CardContent>
            {(d?.top_products?.length ?? 0) === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No sales data yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-center">Units</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {d?.top_products.map((p, i) => (
                    <TableRow key={p.product_id ?? i}>
                      <TableCell className="font-medium max-w-[180px] truncate">{p.product_name}</TableCell>
                      <TableCell className="text-center text-muted-foreground">{p.units_sold}</TableCell>
                      <TableCell className="text-right font-semibold text-green-700">{formatCurrency(p.total_revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
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
