'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StarRating } from '@/components/store/StarRating'
import { formatDate, getStatusColor } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import api from '@/lib/api'
import type { Review } from '@/types'

export default function AdminReviewsPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [statusFilter, setStatusFilter] = useState('pending')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery<{ data: Review[]; meta: { total: number; last_page: number } }>({
    queryKey: ['admin', 'reviews', statusFilter, page],
    queryFn: () => api.get('/admin/reviews', { params: { status: statusFilter !== 'all' ? statusFilter : undefined, page } }).then(r => r.data),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.put(`/admin/reviews/${id}/status`, { status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] }); toast({ title: 'Review status updated.' }) },
  })

  const deleteReview = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/reviews/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] }); toast({ title: 'Review deleted.' }) },
  })

  const reviews = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                  ))
                : reviews.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.user.name}</TableCell>
                    <TableCell><StarRating rating={r.rating} size="sm" /></TableCell>
                    <TableCell className="max-w-xs">
                      {r.title && <p className="font-medium text-sm">{r.title}</p>}
                      <p className="text-sm text-muted-foreground line-clamp-2">{r.body}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(r.created_at)}</TableCell>
                    <TableCell><span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${getStatusColor(r.status)}`}>{r.status}</span></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {r.status !== 'approved' && (
                          <Button variant="ghost" size="icon" className="text-green-600" onClick={() => updateStatus.mutate({ id: r.id, status: 'approved' })}>
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        {r.status !== 'rejected' && (
                          <Button variant="ghost" size="icon" className="text-yellow-600" onClick={() => updateStatus.mutate({ id: r.id, status: 'rejected' })}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => { if (confirm('Delete?')) deleteReview.mutate(r.id) }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
