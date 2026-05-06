'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import api from '@/lib/api'
import type { User } from '@/types'

export default function AdminCustomersPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery<{ data: User[]; meta: { total: number; last_page: number } }>({
    queryKey: ['admin', 'customers', search, page],
    queryFn: () => api.get('/admin/customers', { params: { search: search || undefined, page } }).then(r => r.data),
  })

  const toggleCustomer = useMutation({
    mutationFn: (id: number) => api.put(`/admin/customers/${id}/toggle`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] }); toast({ title: 'Customer status updated.' }) },
  })

  const customers = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Input placeholder="Search customers…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                  ))
                : customers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.email}</TableCell>
                    <TableCell className="text-muted-foreground">{c.phone ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(c.created_at)}</TableCell>
                    <TableCell>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {c.is_active ? 'Active' : 'Banned'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => toggleCustomer.mutate(c.id)} disabled={toggleCustomer.isPending}>
                        {c.is_active ? 'Ban' : 'Unban'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {meta.last_page}</span>
          <Button variant="outline" size="sm" disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  )
}
