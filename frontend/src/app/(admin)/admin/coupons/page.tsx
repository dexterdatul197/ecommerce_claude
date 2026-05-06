'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import api from '@/lib/api'
import type { Coupon } from '@/types'

export default function AdminCouponsPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', min_order_amount: '', max_uses: '', expires_at: '', is_active: true })

  const { data, isLoading } = useQuery<{ data: Coupon[] }>({
    queryKey: ['admin', 'coupons'],
    queryFn: () => api.get('/admin/coupons').then(r => r.data),
  })

  const saveCoupon = useMutation({
    mutationFn: () => {
      const payload = { ...form, value: Number(form.value), min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : undefined, max_uses: form.max_uses ? Number(form.max_uses) : undefined, expires_at: form.expires_at || undefined }
      return editing ? api.put(`/admin/coupons/${editing.id}`, payload) : api.post('/admin/coupons', payload)
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] }); setDialogOpen(false); toast({ title: 'Coupon saved.' }) },
    onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })

  const deleteCoupon = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/coupons/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] }); toast({ title: 'Coupon deleted.' }) },
  })

  const coupons = data?.data ?? []

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditing(null); setForm({ code: '', type: 'percentage', value: '', min_order_amount: '', max_uses: '', expires_at: '', is_active: true }); setDialogOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />Add Coupon
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Used</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                  ))
                : coupons.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono font-bold">{c.code}</TableCell>
                    <TableCell className="capitalize">{c.type}</TableCell>
                    <TableCell>{c.type === 'percentage' ? `${c.value}%` : formatCurrency(c.value)}</TableCell>
                    <TableCell>{c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ''}</TableCell>
                    <TableCell>{c.expires_at ? formatDate(c.expires_at) : '—'}</TableCell>
                    <TableCell><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{c.is_active ? 'Active' : 'Inactive'}</span></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setForm({ code: c.code, type: c.type, value: String(c.value), min_order_amount: String(c.min_order_amount ?? ''), max_uses: String(c.max_uses ?? ''), expires_at: c.expires_at ? c.expires_at.split('T')[0] : '', is_active: c.is_active }); setDialogOpen(true) }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => { if (confirm('Delete?')) deleteCoupon.mutate(c.id) }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Coupon' : 'Add Coupon'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1"><Label>Code</Label><Input value={form.code} onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="uppercase" disabled={!!editing} /></div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Value</Label><Input type="number" step="0.01" value={form.value} onChange={(e) => setForm(f => ({ ...f, value: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Min Order ($)</Label><Input type="number" step="0.01" value={form.min_order_amount} onChange={(e) => setForm(f => ({ ...f, min_order_amount: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Max Uses</Label><Input type="number" value={form.max_uses} onChange={(e) => setForm(f => ({ ...f, max_uses: e.target.value }))} /></div>
            <div className="col-span-2 space-y-1"><Label>Expires At</Label><Input type="date" value={form.expires_at} onChange={(e) => setForm(f => ({ ...f, expires_at: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => saveCoupon.mutate()} disabled={saveCoupon.isPending}>{saveCoupon.isPending ? 'Saving…' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
